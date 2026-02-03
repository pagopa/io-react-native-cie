import {
  IOColors,
  IOThemeContextProvider,
  ToastProvider,
} from '@pagopa/io-app-design-system';
import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AttributesScreen } from './screens/AttributesScreen';
import { AuthenticationRequestScreen } from './screens/AuthenticationRequestScreen';
import { AuthenticationScreen } from './screens/AuthenticationScreen';
import { CertificateReadingScreen } from './screens/CertificateReadingScreen';
import { HomeScreen } from './screens/HomeScreen';
import { InternalAuthAndMrtdScreen } from './screens/InternalAuthAndMrtdScreen';
import { InternalAuthenticationScreen } from './screens/InternalAuthenticationScreen';
import { MrtdScreen } from './screens/MrtdScreen';
import { ResultScreen } from './screens/ResultScreen';

export type RootStackParamList = {
  Home: undefined;
  InternalAuthentication: undefined;
  Mrtd: undefined;
  InternalAuthAndMrtd: undefined;
  CertificateReading: undefined;
  Attributes: undefined;
  AuthenticationRequest: undefined;
  Authentication: { authUrl: string };
  Result: { title: string; data: string };
};

const RootStack = createNativeStackNavigator<RootStackParamList>({
  screenOptions: {
    contentStyle: {
      backgroundColor: IOColors.white,
    },
    headerBackButtonDisplayMode: 'minimal',
  },
  screens: {
    Home: {
      screen: HomeScreen,
      options: {
        title: '@pagopa/io-react-native-cie',
      },
    },
    InternalAuthentication: {
      screen: InternalAuthenticationScreen,
      options: {
        title: 'Internal CIE authentication',
      },
    },
    Mrtd: {
      screen: MrtdScreen,
      options: {
        title: 'MRTD with PACE',
      },
    },
    InternalAuthAndMrtd: {
      screen: InternalAuthAndMrtdScreen,
      options: {
        title: 'Internal Auth + MRTD',
      },
    },
    CertificateReading: {
      screen: CertificateReadingScreen,
      options: {
        title: 'Certificate reading',
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
    Result: {
      screen: ResultScreen,
      options: ({ route }) => ({
        title: route.params.title || '',
      }),
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

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
