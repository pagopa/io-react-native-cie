import {
  IOThemeContextProvider,
  ToastProvider,
} from '@pagopa/io-app-design-system';
import {
  createStaticNavigation,
  type StaticParamList,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AttributesScreen } from './screens/AttributesScreen';
import { AuthenticationScreen } from './screens/AuthenticationScreen';
import { HomeScreen } from './screens/HomeScreen';

const RootStack = createNativeStackNavigator({
  screens: {
    Home: {
      screen: HomeScreen,
      options: {
        headerShown: false,
      },
    },
    Attributes: {
      screen: AttributesScreen,
      options: {
        title: 'Read CIE attributes',
      },
    },
    Authentication: {
      screen: AuthenticationScreen,
      options: {
        title: 'CIE authentication',
      },
    },
  },
});

const Navigation = createStaticNavigation(RootStack);

export default function App() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView>
        <IOThemeContextProvider theme={'light'}>
          <ToastProvider>
            <Navigation />
          </ToastProvider>
        </IOThemeContextProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

type RootStackParamList = StaticParamList<typeof RootStack>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
