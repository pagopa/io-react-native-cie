import { IOButton } from '@pagopa/io-app-design-system';
import Clipboard from '@react-native-clipboard/clipboard';
import {
  Alert,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DebugPrettyPrint } from '../components/DebugPrettyPrint';

interface Props {
  route: {
    params: {
      title: string;
      data: string;
    };
  };
  navigation: any;
}

export function ResultScreen({ route }: Props) {
  const { title, data } = route.params;

  console.log('ResultScreen data:', data);

  const handleCopy = async () => {
    Clipboard.setString(data);
    Alert.alert('Copied', 'Result copied to clipboard');
  };

  const handleShare = async () => {
    try {
      await Share.share(
        {
          message: data,
          title,
          // Workaround for iOS to set the subject sharing email in some apps
          ...(Platform.OS === 'ios' ? { url: title } : {}),
        },
        {
          subject: `${title} Result`,
          dialogTitle: `Share ${title} Result`,
        }
      );
    } catch (error) {
      Alert.alert('Error', 'Could not share the result');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <DebugPrettyPrint data={data} />
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
