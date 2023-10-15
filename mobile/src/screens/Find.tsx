import { useState } from 'react'
import { Heading, VStack } from "native-base";
import { Header } from "../components/Header";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { useToast } from 'native-base';
import { api } from '../services/api';
import { useNavigation } from '@react-navigation/native';

export function Find() {
  const [isLoadingJoinPool, setIsLoadingJoinPool] = useState(false);
  const [code, setCode] = useState('')

  const { navigate } = useNavigation()
  const toast = useToast();

  async function handleJoinPool() {
    try {
      setIsLoadingJoinPool(true)

      if(!code) {
        return toast.show({
          title: 'Informe o códgigo!',
          placement: 'top',
          bgColor: 'red.500'
        })
      }

      await api.post('/pools/join', { code });

      toast.show({
        title: 'Você entrou no bolão com sucesso!',
        placement: 'top',
        bgColor: 'green.500'
      })

      navigate('pools');

    } catch (error) {
      console.log(error)
      setIsLoadingJoinPool(false)

      if (error.response?.data?.message === 'Pool not found') {
        return toast.show({
          title: 'Bolão não encontrado!',
          placement: 'top',
          bgColor: 'red.500'
        })
      }

      if (error.response?.data?.message === 'You already joined this pool') {
        return toast.show({
          title: 'Você já está neste bolão!',
          placement: 'top',
          bgColor: 'red.500'
        })
      }

      toast.show({
        title: 'Não foi possível encontrar o bolão!',
        placement: 'top',
        bgColor: 'red.500'
      });
    }
  }

  return(
    <VStack flex={1} bgColor="gray.900">
      <Header
        title="Buscar por código"
        showBackButton
      />

      <VStack mt={8} mx={5} alignItems="center">
        <Heading fontFamily="heading" color="white" fontSize="xl" mb={8} textAlign="center">
          Encontre um bolão através de {'\n'}
          seu código único
        </Heading>

        <Input
          mb={2}
          placeholder="Qual o código do bolão?"
          autoCapitalize="characters"
          onChangeText={setCode}
          value={code}
        />

        <Button
          title="Buscar bolão"
          isLoading={isLoadingJoinPool}
          onPress={handleJoinPool}
        />
      </VStack>
    </VStack>
  )
}