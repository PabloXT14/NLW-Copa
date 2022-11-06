import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../libs/prisma";
import { authenticate } from "../plugins/authenticate";

export async function guessRoutes(fastify: FastifyInstance) {
  fastify.get('/guesses/count', async () => {
    const count = await prisma.guess.count()

    return { count }
  })

  fastify.post('/pools/:poolId/games/:gameId/guesses', {
    onRequest: [authenticate]
  }, async (request, reply) => {
    // VALIDAÇÃO DOS ROUTE PARAMS
    const createGuessParams = z.object({
      poolId: z.string(),
      gameId: z.string(),
    })

    // VALIDAÇÃO DO BODY PARAMS
    const createGuessBody = z.object({
      firstTeamPoints: z.number(),
      secondTeamPoints: z.number(),
    })

    const { poolId, gameId } = createGuessParams.parse(request.params)
    const { firstTeamPoints, secondTeamPoints } = createGuessBody.parse(request.body)

    // VERIFICANDO SE USUÁRIO É PARTICIPANTE DO BOLÃO
    const participant = await prisma.participant.findUnique({
      where: {
        userId_poolId: {
          poolId,
          userId: request.user.sub,
        }
      }
    })

    if (!participant) {
      return reply.status(400).send({
        message: "You're not allowed to create a guess inside this pool"
      })
    }

    // VERIFICANDO SE USUÁRIO JÁ FEZ UM PALPITE PARA O JOGO INFORMADO
    const guess = await prisma.guess.findUnique({
      where: {
        participantId_gameId: {
          participantId: participant.id,
          gameId,
        }
      }
    })

    if (guess) {
      return reply.status(400).send({
        message: "You already sent a guess to this game on this pool"
      })
    }

    const game = await prisma.game.findUnique({
      where: {
        id: gameId,
      }
    })

    // VERIFICANDO SE GAME EXISTE
    if (!game) {
      return reply.status(400).send({
        message: "Game not found."
      })
    }

    // VERIFICANDO SE GAME AINDA ESTÁ DENTRO DA DATA PARA PODER PALPITAR
    if (game.date < new Date()) {
      return reply.status(400).send({
        message: "You cannot send guesses after the game date"
      })
    }

    // CRIANDO PALPITE DE FATO
    await prisma.guess.create({
      data: {
        gameId,
        participantId: participant.id,
        firstTeamPoints,
        secondTeamPoints
      }
    })
    return reply.status(201).send()
  })
}