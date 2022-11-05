import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient({
  log: ['query'], // dar um log no terminal da execução das nossas consultas no DB
})