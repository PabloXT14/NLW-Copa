import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../libs/prisma";
import { authenticate } from "../plugins/authenticate";

export async function gameRoutes(fastify: FastifyInstance) {
  fastify.get('/pools/:id/games', { onRequest: [authenticate] }, async (request, reply) => {
    const getPoolParams = z.object({
      id: z.string(),
    })

    const { id } = getPoolParams.parse(request.params)

    const games = await prisma.game.findMany({
      orderBy: {
        date: 'desc'
      },
      include: {// incluindo na query o relacionamento de palpites onde o palpite tenha como participante o usuário autenticado
        guesses: {
          where: {
            participant: {
              userId: request.user.sub,
              poolId: id,
            }
          }
        }
      }
    })

    return {// customizando o retorno de guesse (palpite)
      games: games.map(game => {
        return {
          ...game,
          guess: game.guesses.length > 0 ? game.guesses[0] : null,
          guesses: undefined,
        }
      })
    }
  })
}