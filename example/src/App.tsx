import { InternalAuthenticationResultScreen } from './screens/InternalAuthentication/InternalAuthenticationResultScreen';
import {
  HeaderSecondLevel,
  IOColors,
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
import { AuthenticationRequestScreen } from './screens/AuthenticationRequestScreen';
import { AuthenticationScreen } from './screens/AuthenticationScreen';
import { HomeScreen } from './screens/HomeScreen';
import { InternalAuthenticationScreen } from './screens/InternalAuthentication/InternalAuthenticationScreen';
import { PaceScreen } from './screens/pace/PaceScreen';
import { PaceResultScreen } from './screens/pace/PaceResultScreen';

const RootStack = createNativeStackNavigator({
  screenOptions: {
    contentStyle: {
      backgroundColor: IOColors.white,
    },
  },
  screens: {
    Home: {
      screen: HomeScreen,
      options: {
        header: () => (
          <HeaderSecondLevel title="@pagopa/io-react-native-cie" type="base" />
        ),
      },
    },
    InternalAuthentication: {
      screen: InternalAuthenticationScreen,
      options: {
        title: 'Internal CIE authentication',
      },
    },
    InternalAuthenticationResult: {
      screen: InternalAuthenticationResultScreen,
      options: {
        title: 'Internal Auth Result',
      },
    },
    Pace: {
      screen: PaceScreen,
      options: {
        title: 'PACE/MRTD',
      },
    },
    PaceResult: {
      screen: PaceResultScreen,
      options: {
        title: 'PACE/MRTD Result',
      },
    },
    Attributes: {
      screen: AttributesScreen,
      options: {
        title: 'Read CIE attributes',
      },
    },
    AuthenticationRequest: {
      screen: AuthenticationRequestScreen,
      options: {
        title: 'CIE authentication',
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
    interface RootParamList extends RootStackParamList {
      InternalAuthenticationResult: { result: any; challenge: string };
    }
  }
}
