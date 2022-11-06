import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'

import { poolRoutes } from './routes/pool'
import { userRoutes } from './routes/user'
import { guessRoutes } from './routes/guess'
import { gameRoutes } from './routes/game'
import { authRoutes } from './routes/auth'

const PORT = 3333

async function bootstrap() {
  const fastify = Fastify({
    logger: true, // printar no terminal tudo que acontecer em nosso servidor 
  })

  // SETANDO CORS(QUAIS FRONT-ENDS PODEM ACESSAR NOSSO BACK-END)
  await fastify.register(cors, {
    origin: true// neste caso todos podem acessar
  });

  // CONFIGURAÇÃO JWT NO FASTIFY
  await fastify.register(jwt, {
    secret: 'nlwcopa', // Em produção isso precisa ser uma variável ambiente (e muito mais bem elaborada)
  })

  // IMPORTANDO ROTAS
  await fastify.register(poolRoutes)
  await fastify.register(authRoutes)
  await fastify.register(userRoutes)
  await fastify.register(guessRoutes)
  await fastify.register(gameRoutes)

  // SETANDO ESCUTA E PORTA DO SERVIDOR
  await fastify.listen({ port: PORT, host: '0.0.0.0' })
}

bootstrap()