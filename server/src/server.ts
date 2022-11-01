import Fastify from 'fastify'
import { PrismaClient } from '@prisma/client'

const PORT = 3333
const prisma = new PrismaClient({
  log: ['query'], // dar um log no terminal da execução das nossas consultas no DB
})

async function bootstrap() {
  const fastify = Fastify({
    logger: true, // printar no terminal tudo que acontecer em nosso servidor 
  })

  fastify.get('/pools/count', async () => {
    const count = await prisma.pool.count()

    return { count }
  })

  await fastify.listen({ port: PORT })
}

bootstrap()