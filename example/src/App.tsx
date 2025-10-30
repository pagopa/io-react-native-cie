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
import { MrtdScreen } from './screens/mrtd/MrtdScreen';
import { MrtdResultScreen } from './screens/mrtd/MrtdResultScreen';
import { InternalAuthAndMrtdScreen } from './screens/internalAuthAndMrtd/InternalAuthAndMrtdScreen';
import { InternalAuthAndMrtdResultScreen } from './screens/internalAuthAndMrtd/InternalAuthAndMrtdResultScreen';
import { InternalAuthenticationScreen } from './screens/internalAuthentication/InternalAuthenticationScreen';
import { InternalAuthenticationResultScreen } from './screens/internalAuthentication/InternalAuthenticationResultScreen';

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
    Mrtd: {
      screen: MrtdScreen,
      options: {
        title: 'MRTD with PACE',
      },
    },
    MrtdResult: {
      screen: MrtdResultScreen,
      options: {
        title: 'MRTD with PACE Result',
      },
    },
    InterlanAuthAndMrtd: {
      screen: InternalAuthAndMrtdScreen,
      options: {
        title: 'Internal Auth + MRTD',
      },
    },
    InternalAuthAndMrtdResult: {
      screen: InternalAuthAndMrtdResultScreen,
      options: {
        title: 'Internal Auth + MRTD Result',
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
