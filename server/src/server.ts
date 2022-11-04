import Fastify from 'fastify'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import ShortUniqueId from 'short-unique-id'
import cors from '@fastify/cors'

const PORT = 3333
const prisma = new PrismaClient({
  log: ['query'], // dar um log no terminal da execução das nossas consultas no DB
})

async function bootstrap() {
  const fastify = Fastify({
    logger: true, // printar no terminal tudo que acontecer em nosso servidor 
  })

  // SETANDO CORS(QUAIS FRONT-ENDS PODEM ACESSAR NOSSO BACK-END)
  fastify.register(cors, {
    origin: "*",
    methods: ["POST"]
  });

  fastify.get('/pools/count', async () => {
    const count = await prisma.pool.count()

    return { count }
  })

  fastify.get('/users/count', async () => {
    const count = await prisma.user.count()

    return { count }
  })

  fastify.get('/guesses/count', async () => {
    const count = await prisma.guess.count()

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

    await prisma.pool.create({
      data: {
        title,
        code
      }
    })

    return reply.status(201).send({ code })
  })

  await fastify.listen({ port: PORT })
}

bootstrap()