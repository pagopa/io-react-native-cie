import {
  ScrollView,
  View,
  StyleSheet,
  Text,
  Share,
  Alert,
  Platform,
  SafeAreaView,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { IOButton } from '@pagopa/io-app-design-system';

interface Props {
  route: {
    params: {
      result: any;
      challenge: string;
    };
  };
  navigation: any;
}

export function InternalAuthenticationResultScreen({ route }: Props) {
  const { result, challenge } = route.params;
  const resultString = JSON.stringify({ challenge, ...result }, null, 2);

  const handleCopy = async () => {
    Clipboard.setString(resultString);
    Alert.alert('Copied', 'Result copied to clipboard');
  };

  const handleShare = async () => {
    try {
      await Share.share(
        {
          message: resultString,
          title: 'Internal Auth Result',
          // Workdaround for iOS to set the subject sharing email in some apps
          ...(Platform.OS === 'ios' ? { url: 'Internal Auth Result' } : {}),
        },
        {
          subject: 'Internal Auth Result',
          dialogTitle: 'Share Internal Auth Result',
        }
      );
    } catch (error) {
      Alert.alert('Error', 'Could not share the result');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <Text selectable style={styles.resultText}>
          {resultString}
        </Text>
      </ScrollView>
      <View style={styles.buttonRow}>
        <IOButton variant="outline" label="Copy" onPress={handleCopy} />
        <IOButton variant="outline" label="Share" onPress={handleShare} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 4,
    gap: 4,
  },
  scrollView: {
    flex: 1,
    margin: 4,
  },
  contentContainer: {
    paddingBottom: 4,
  },
  resultText: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: 'black',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 4,
    paddingBottom: 4,
  },
});
