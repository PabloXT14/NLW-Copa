import { useState, useEffect } from 'react'
import { Game, GameProps } from './Game';
import { useToast, FlatList } from 'native-base' 
import { api } from '../services/api';
import { Loading } from './Loading';
import { EmptyMyPoolList } from './EmptyMyPoolList';

interface Props {
  poolId: string;
  code: string;
}

export function Guesses({ poolId, code }: Props) {
  const [isLoadingFetchGames, setIsLoadingFetchGames] = useState(true);
  const [games, setGames] = useState<GameProps[]>([]);
  const [firstTeamPoints, setFirstTeamPoints] = useState('');
  const [secondTeamPoints, setSecondTeamPoints] = useState('');

  const toast = useToast();

  async function fetchGames() {
    try {
      setIsLoadingFetchGames(true)

      const response = await api.get(`/pools/${poolId}/games`);
      setGames(response.data.games);

    } catch (error) {
      console.log(error)

      toast.show({
        title: 'Não foi possível carregar os jogos!',
        placement: 'top',
        bgColor: 'red.500',
      })
    } finally {
      setIsLoadingFetchGames(false)
    }
  }

  async function handleGuessConfirm(gameId: string) {
    try {
      if (!firstTeamPoints.trim() || !secondTeamPoints.trim()) {
        return toast.show({
          title: 'Informe o placar do palpite!',
          placement: 'top',
          bgColor: 'red.500'
        })
      }

      await api.post(`/pools/${poolId}/games/${gameId}/guesses`, {
        firstTeamPoints: Number(firstTeamPoints),
        secondTeamPoints: Number(secondTeamPoints),
      })

      toast.show({
        title: 'Palpite realizado com sucesso!',
        placement: 'top',
        bgColor: 'green.500'
      })

      fetchGames()// buscar games já com o novo palpite

    } catch (error) {
      console.log(error)

      toast.show({
        title: 'Não foi possível enviar o palpite!',
        placement: 'top',
        bgColor: 'red.500'
      })
    }
  }

  useEffect(() => {
    fetchGames()
  }, [poolId])

  if (isLoadingFetchGames) {
    return <Loading />
  }

  return (
    <FlatList
      data={games}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <Game
          data={item}
          setFirstTeamPoints={setFirstTeamPoints}
          setSecondTeamPoints={setSecondTeamPoints}
          onGuessConfirm={() => handleGuessConfirm(item.id)}
        />
      )}
      _contentContainerStyle={{ pb: 100 }}
      ListEmptyComponent={<EmptyMyPoolList code={code} />}
    />
  );
}
