import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../libs/prisma";
import { authenticate } from "../plugins/authenticate";

export async function authRoutes(fastify: FastifyInstance) {
  fastify.get('/me', {
    onRequest: [authenticate]// CHAMANDO PLUGIN QUE VERIFICA TOKEN JWT 
  }, async (request) => {

    // RETORNA ERRO OU DADOS DECIFRADOS DO TOKEN JWT
    return { user: request.user }
  })

  fastify.post('/users', async(resquest) => {
    // VALIDANDO DADOS DO BODY DA REQUISIÇÃO
    const createUserBody = z.object({
      access_token: z.string(),
    })

    const { access_token } = createUserBody.parse(resquest.body)

    // BUSCA DADOS DO USUÁRIO NA API DO GOOGLE
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${access_token}`,
      }
    })

    const userData = await userResponse.json()

    // VALIDANDO DADOS DE USUÁRIO VINDO DA API DO GOOGLE
    const userInfoSchema = z.object({
      id: z.string(),
      email: z.string().email(),
      name: z.string(),
      picture: z.string().url(),
    })

    const userInfo = userInfoSchema.parse(userData)

    // CRIANDO USER OU DEVOLVENDO USUÁRIO EXISTENTE
    let user = await prisma.user.findUnique({
      where: {
        googleId: userInfo.id,
      }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          googleId: userInfo.id,
          name: userInfo.name,
          email: userInfo.email,
          avatarUrl: userInfo.picture,
        }
      })
    }

    // GERANDO TOKEN JWT (COM INFORMAÇÕES)
    const token = fastify.jwt.sign({// informações para criptografar
      name: user.name,
      avatarUrl: user.avatarUrl,
    }, {// confi. de criptografação
      sub: user.id,// quem criou o token
      expiresIn: '7 days'// tempo de expiração do token
    })

    return { token }
  })
}