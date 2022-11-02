import Fastify from 'fastify'
import cors from '@fastify/cors'
import { PrismaClient } from '@prisma/client'

const PORT = 3333
const prisma = new PrismaClient({
  log: ['query'], // dar um log no terminal da execução das nossas consultas no DB
})

async function bootstrap() {
  const fastify = Fastify({
    logger: true, // printar no terminal tudo que acontecer em nosso servidor 
  })

  // PERMITINDO QUE QLQ FRONT-END ACESSE NOSSO BACK-END
  await fastify.register(cors, {
    origin: true,
  })

  fastify.get('/pools/count', async () => {
    const count = await prisma.pool.count()

    return { count }
  })

  await fastify.listen({ port: PORT, host: '0.0.0.0' })
}

bootstrap()