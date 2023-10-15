import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { New } from '../screens/New';
import { Pools } from '../screens/Pools';
import { Platform } from 'react-native'
import { PlusCircle, SoccerBall } from 'phosphor-react-native'
import { useTheme } from 'native-base'
import { Find } from '../screens/Find';
import { Details } from '../screens/Details';

const { Navigator, Screen } = createBottomTabNavigator();

export function AppRoutes() {
  const { colors, sizes } = useTheme()

  const iconsSize = sizes[6]

  return (
    <Navigator screenOptions={{
      headerShown: false,
      tabBarLabelPosition: 'beside-icon',
      tabBarActiveTintColor: colors.yellow[500],
      tabBarInactiveTintColor: colors.gray[300],
      tabBarStyle: {
        position: 'absolute',
        height: sizes[22],
        borderTopWidth: 0,
        backgroundColor: colors.gray[800]
      },
      tabBarItemStyle: {
        position: 'relative',
        top: Platform.OS === 'android' ? -10 : 0// estilizando especifico de acordo com a plataforma
      }
    }}>
      <Screen 
        name="new"
        component={New}
        options={{
          // <color> vem do <tabBarActiveTintColor>
          tabBarIcon: ({ color }) => <PlusCircle color={color} size={iconsSize} />,
          tabBarLabel: 'Novo bolão'
        }}
      />

      <Screen
        name="pools"
        component={Pools}
        options={{
          tabBarIcon: ({ color }) => <SoccerBall color={color} size={iconsSize} />,
          tabBarLabel: 'Meus bolões'
        }}
      />

      <Screen
        name="find"
        component={Find}
        options={{
          tabBarButton: () => null// hackzinho para não aparecer button na tabBar
        }}
      />

      <Screen
        name="details"
        component={Details}
        options={{
          tabBarButton: () => null// hackzinho para não aparecer button na tabBar
        }}
      />
    </Navigator>
  )
}