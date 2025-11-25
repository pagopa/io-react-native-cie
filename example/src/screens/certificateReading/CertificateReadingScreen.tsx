import {
  ButtonSolid,
  ListItemHeader,
  OTPInput,
} from '@pagopa/io-app-design-system';
import { CieManager, type NfcEvent } from '@pagopa/io-react-native-cie';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import {
  ReadStatusComponent,
  type ReadStatus,
} from '../../components/ReadStatusComponent';

export function CertificateReadingScreen() {
  const navigation = useNavigation();
  const [code, setCode] = useState<string>('');
  const [status, setStatus] = useState<ReadStatus>('idle');
  const [event, setEvent] = useState<NfcEvent>();

  useEffect(() => {
    const cleanup = [
      // Start listening for NFC events
      CieManager.addListener('onEvent', (e) => {
        setEvent(e);
        CieManager.setCurrentAlertMessage(
          `Reading in progress\n ${getProgressEmojis(e.progress)}`
        );
      }),
      // Start listening for errors
      CieManager.addListener('onError', (error) => {
        setStatus('error');
        setEvent(undefined);
        Alert.alert('Error', JSON.stringify(error, undefined, 2));
      }),
      // Start listening for success
      CieManager.addListener('onCertificateSuccess', (data) => {
        setStatus('success');
        navigation.reset({
          index: 0,
          routes: [
            { name: 'Home' },
            {
              name: 'CertificateReadingResult',
              params: data,
            },
          ],
        });
      }),
    ];

    return () => {
      // Remove the event listener on unmount
      cleanup.forEach((remove) => remove());
      // Ensure the reading is stopped when the screen is unmounted
      CieManager.stopReading();
    };
  }, [navigation]);

  const handleStartReading = async () => {
    setEvent(undefined);
    setStatus('reading');

    try {
      await CieManager.startReadingCertificate(code);
    } catch (e) {
      Alert.alert('Unable to read CIE', JSON.stringify(e, undefined, 2));
    }
  };

  const handleStopReading = () => {
    setEvent(undefined);
    setStatus('idle');
    CieManager.stopReading();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoidingView}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.progressContainer}>
          <ReadStatusComponent
            progress={event?.progress}
            status={status}
            step={event?.name}
          />
        </View>
        <View>
          <ListItemHeader label="Insert card PIN" />
          <OTPInput secret value={code} length={8} onValueChange={setCode} />
        </View>
        <ButtonSolid
          label={status === 'reading' ? 'Stop reading' : 'Start reading'}
          disabled={code.length !== 8}
          onPress={() =>
            status === 'reading' ? handleStopReading() : handleStartReading()
          }
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const getProgressEmojis = (progress: number) => {
  // Clamp progress between 0 and 1
  progress = Math.max(0, Math.min(1, progress));

  const totalDots = 10; // Length of the progress bar
  const blueDots = Math.round(progress * totalDots);
  const whiteDots = totalDots - blueDots;

  return '🔵'.repeat(blueDots) + '⚪'.repeat(whiteDots);
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
    marginHorizontal: 24,
    gap: 24,
  },
  progressContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  attributesContainer: {
    justifyContent: 'flex-end',
  },
});
