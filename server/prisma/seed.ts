import { PrismaClient } from '@prisma/client'

// CRIANDO CONEXÃO COM O BANCO DE DADOS
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john.doe@gmail.com',
      avatarUrl: 'https://github.com/pabloxt14.png'
    }
  })

  const pool = await prisma.pool.create({
    data: {
      title: 'Example Pool',
      code: 'BOL123',
      ownerId: user.id,

      participants: {// criando um participante através do relacionamento inverso da tabela Pool com a Participants 
        create: {
          userId: user.id
        }
      }
    }
  })

  // CRIANDO JOGOS FICTÍCIOS
  await prisma.game.create({// jogo sem palpites
    data: {
      date: '2022-11-02T12:00:00.201Z',
      firstTeamCountryCode: 'DE',
      secondTeamCountryCode: 'BR',
    }
  })

  await prisma.game.create({//jogo com palpites
    data: {
      date: '2022-11-03T12:00:00.201Z',
      firstTeamCountryCode: 'BR',
      secondTeamCountryCode: 'PT',

      guesses:{ // criando palpite através do relacionamento inverso da tabela Game com a Guess 
        create: {
          firstTeamPoints: 2,
          secondTeamPoints: 1,

          participant: {// referenciado qual o participante que criou este palpite
            connect: {
              userId_poolId: {
                userId: user.id,
                poolId: pool.id,
              }
            }
          }
        }
      }
    }
  })
}

main()