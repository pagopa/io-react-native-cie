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
import type { CertificateData } from '../../../../src/manager/types';

interface Props {
  route: {
    params: CertificateData;
  };
  navigation: any;
}

export function CertificateReadingResultScreen({ route }: Props) {
  const { docSerialNumber, fiscalCode, name, surname } = route.params;
  const resultString = JSON.stringify(
    { docSerialNumber, fiscalCode, name, surname },
    null,
    2
  );

  const handleCopy = async () => {
    Clipboard.setString(resultString);
    Alert.alert('Copied', 'Result copied to clipboard');
  };

  const handleShare = async () => {
    try {
      await Share.share(
        {
          message: resultString,
          title: 'Cie Data',
          // Workaround for iOS to set the subject sharing email in some apps
          ...(Platform.OS === 'ios' ? { url: 'Cie Data' } : {}),
        },
        {
          subject: 'Cie Data Result',
          dialogTitle: 'Share Cie Data Result',
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
