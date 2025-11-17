import { IOButton } from '@pagopa/io-app-design-system';
import Clipboard from '@react-native-clipboard/clipboard';
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type {
  MrtdResponse,
  ResultEncoding,
} from '../../../../src/manager/types';

interface Props {
  route: {
    params: {
      result: MrtdResponse;
      encoding: ResultEncoding;
    };
  };
  navigation: any;
}

export function MrtdResultScreen({ route }: Props) {
  const { result, encoding } = route.params;
  const resultString = JSON.stringify({ encoding, ...result }, null, 2);

  const handleCopy = async () => {
    Clipboard.setString(resultString);
    Alert.alert('Copied', 'Result copied to clipboard');
  };

  const handleShare = async () => {
    try {
      await Share.share(
        {
          message: resultString,
          title: 'MRTD with PACE Result',
          // Workaround for iOS to set the subject sharing email in some apps
          ...(Platform.OS === 'ios' ? { url: 'MRTD with PACE Result' } : {}),
        },
        {
          subject: 'MRTD with PACE Result',
          dialogTitle: 'Share MRTD with PACE Result',
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
