import type { StaticScreenProps } from '@react-navigation/native';
import WebView from 'react-native-webview';

type Props = StaticScreenProps<{
  authUrl: string;
}>;

export function AuthenticationScreen({ route }: Props) {
  return <WebView source={{ uri: route.params.authUrl }} />;
}
