import { createContext, ReactNode, useEffect, useState } from "react";
import * as Google from 'expo-auth-session/providers/google';// provider de autenticação da google
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { api } from "../services/api";

// garantir redirecionamento do navegador para o app

// TYPES
interface UserProps {
  name: string;
  avatarUrl: string;
}

export interface AuthContextDataProps {
  user: UserProps;
  isUserLoading: boolean;
  signIn: () => Promise<void>;
}

interface AuthContextProviderProps {
  children: ReactNode;
}

// CONTEXT
export const AuthContext = createContext<AuthContextDataProps>({} as AuthContextDataProps);

// PROVIDER
export function AuthContextProvider({ children }: AuthContextProviderProps) {
  const [user, setUser] = useState<UserProps>({} as UserProps);
  const [isUserLoading, setIsUserLoading] = useState(false);
  
  // Requisição de autenticação com Google
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.CLIENT_ID,
    redirectUri: AuthSession.makeRedirectUri({ useProxy: true }),
    scopes: ['profile', 'email'],
  })

  async function signIn() {
    // promptAsync => função que permite que se inicie o fluxo de autenticação
    try {
      setIsUserLoading(true)
      await promptAsync()
    } catch(error) {
      console.log(error)
      throw error
    } finally {
      setIsUserLoading(false)
    }
  }

  async function signInWithGoogle(access_token: string) {
    // console.log("TOKEN DE AUTENTICAÇÃO ===>", acess_token) 
    try {
      setIsUserLoading(true)

      const tokenResponse = await api.post('/users', { access_token });

      // SALVANDO NO HEADER DE TODAS AS PRÓXIMAS REQUISIÇÕES O TOKEN JWT GERADO PELO BACK-END
      api.defaults.headers.common['Authorization'] = `Bearer ${tokenResponse.data.token}`;
      
      // BUSCANDO DADOS DO USUÁRIO AUTENTICADO
      const userInfoResponse = await api.get('/me');
      //console.log(userInfoResponse.data.user);

      setUser(userInfoResponse.data.user);
    } catch (error) {
      console.log(error?.response?.data)
      throw error
    } finally {
      setIsUserLoading(false)
    }
  }

  // OBSERVANDO QUANDO HOUVER UMA RESPOSTA DA AUTENTICAÇÃO
  useEffect(() => {
    if(response?.type === 'success' && response?.authentication?.accessToken) {
      signInWithGoogle(response.authentication.accessToken);
    }
  }, [response])

  return (
    <AuthContext.Provider value={{
      signIn,
      isUserLoading,
      user,
    }}>
      {children}
    </AuthContext.Provider>
  )
}