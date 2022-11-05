import { FastifyRequest } from 'fastify'

export async function authenticate(request: FastifyRequest) {
  // VERIFICA TOKEN JWT NO CABEÇALHO DA REQUISIÇÃO
  await request.jwtVerify();
}