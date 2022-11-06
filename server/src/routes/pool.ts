import { FastifyInstance } from "fastify";
import { prisma } from "../libs/prisma";
import ShortUniqueId from 'short-unique-id';
import { z } from 'zod'
import { authenticate } from "../plugins/authenticate";

export async function poolRoutes(fastify: FastifyInstance) {
  fastify.get('/pools/count', async () => {
    const count = await prisma.pool.count()

    return { count }
  })

  fastify.post('/pools', async (request, reply) => {// reply = response do express
    // SCHEMA DE VALIDAÇÃO COM ZOD
    const createPoolBody = z.object({
      title: z.string(),
    })

    // VALIDANDO SE DADOS NO CORPO DA REQUISIÇÃO ESTÃO CERTOS (SE NÃO O ZOD DEVOLVE UMA RESP. AUTOMATICAMENTE)
    const { title } = createPoolBody.parse(request.body)

    // GERANDO ID UNICO DE 6 CARACTERES
    const idGenerate = new ShortUniqueId({ length: 6 })
    const code = String(idGenerate()).toUpperCase()

    try {// CRIANDO BOLÃO COM USUÁRIO JÁ AUTENTICADO
      await request.jwtVerify()

      await prisma.pool.create({
        data: {
          title,
          code,
          ownerId: request.user.sub,// id da conta Google do criador do bolão

          participants: {// colocando dono do bolão como participante do bolão
            create: {
              userId: request.user.sub,
            }
          }
        }
      })
    } catch {// CRIANDO BOLÃO SEM USUÁRIO AUTENTICADO
      await prisma.pool.create({
        data: {
          title,
          code,
        }
      })
    }

    return reply.status(201).send({ code })
  })

  // ROTA PARA INCLUIR NOVO PARTICIPANTE A UM BOLÃO EXISTENTE
  fastify.post('/pools/join', {
    onRequest: [authenticate]
  }, async (request, reply) => {
    const joinPoolBody = z.object({
      code: z.string(),
    })

    const { code } = joinPoolBody.parse(request.body)// pegando código do bolão

    // BUSCANDO BOLÃO
    const pool = await prisma.pool.findUnique({
      where: {
        code,
      },
      include: {// inclui mais informações na query realizado para o banco de dados(tipo um JOIN do SQL)
        participants: {
          where: {
            userId: request.user.sub,
          }
        }
      }
    })

    // VERIFICANDO SE BOLÃO EXISTE
    if (!pool) {
      return reply.status(400).send({
        message: 'Pool not found'
      })
    }

    // VERIFICANDO SE USUÁRIO JÁ PARTICIPA DO BOLÃO
    if (pool.participants.length > 0) {
      return reply.status(400).send({
        message: 'You already joined this pool'
      })
    }

    // COLOCANDO PRIMEIRO PARTICIPANTE DO BOLÃO COMO DONO (CASO NÃO HAJA DONO)
    if (!pool.ownerId) {
      await prisma.pool.update({
        where: {
          id: pool.id,
        },
        data: {
          ownerId: request.user.sub,
        }
      })
    }
    
    // CRIANDO NOVO PARTICIPANTE
    await prisma.participant.create({
      data: {
        poolId: pool.id,
        userId: request.user.sub,
      }
    })

    return reply.status(201).send()
  })
 
  // ROTA QUE RETORNA BOLÕES QUE UM USUÁRIO AUTENTICADO PARTICIPA
  fastify.get('/pools', {
    onRequest: [authenticate],
  }, async (request, reply) => {
    const pools = await prisma.pool.findMany({
      where: {
        participants: {
          some: {// retorna pools onde pelo menos um dos participantes tenha o id do usuário autenticado
            userId: request.user.sub,
          }
        }
      },
      include: {// incluindo no retorno mais alguns dados do pool
        _count: {// quantidade participantes do pool
          select: {
            participants: true,
          }
        },
        owner: {// dono do pool
          select: {
            id: true,
            name: true,
          }
        },
        participants: {// retornando avatar de 4 participantes aleatórios
          select: {
            id: true,
            user: {
              select: {
                avatarUrl: true,
              }
            }
          },
          take: 4,
        }
      }
    })

    return { pools }
  })

  // ROTA PARA RETORNAR DADOS DE UM BOLÃO ESPECÍFICO INFORMADO
  fastify.get('/pools/:id', { onRequest: [authenticate] }, async (request, reply) => {
    const getPoolParams = z.object({
      id: z.string(),
    })

    const { id } = getPoolParams.parse(request.params)

    const pool = await prisma.pool.findMany({
      where: {
        id,
      },
      include: {// incluindo no retorno mais alguns dados do pool
        _count: {// quantidade participantes do pool
          select: {
            participants: true,
          }
        },
        owner: {// dono do pool
          select: {
            id: true,
            name: true,
          }
        },
        participants: {// retornando avatar de 4 participantes aleatórios
          select: {
            id: true,
            user: {
              select: {
                avatarUrl: true,
              }
            }
          },
          take: 4,
        }
      }
    })

    return { pool }
  })
}