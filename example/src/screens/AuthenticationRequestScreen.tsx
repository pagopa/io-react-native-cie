import {
  ButtonSolid,
  ContentWrapper,
  IOToast,
  ListItemHeader,
  OTPInput,
} from '@pagopa/io-app-design-system';
import { CieManager, type NfcEventName } from '@pagopa/io-react-native-cie';
import { StackActions, useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { CiewWebView } from '../components/CiewWebView';
import { LoadingSpinnerOverlay } from '../components/LoadingSpinnerOverlay';
import {
  ReadStatusComponent,
  type ReadStatus,
} from '../components/ReadStatusComponent';

export function AuthenticationRequestScreen() {
  const navigation = useNavigation();

  const [authUrl, setAuthUrl] = useState<string>();
  const [code, setCode] = useState<string>('');
  const [status, setStatus] = useState<ReadStatus>('idle');
  const [event, setEvent] = useState<NfcEventName>();
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    // Start listening for NFC events
    const unsubscribeEvent = CieManager.addEventListener((e) => {
      console.info('NFC Event', e);
      setProgress(e.progress * 100);
      setEvent(e.name);
    });

    const unsubscribeError = CieManager.addErrorListener((error) => {
      setStatus('error');
      setEvent(undefined);
      Alert.alert('Error', JSON.stringify(error, undefined, 2));
    });

    const unsubscribeSuccess = CieManager.addSuccessListener((uri) => {
      setStatus('success');
      setEvent(undefined);
      navigation.dispatch(
        StackActions.replace('Authentication', { authUrl: uri })
      );
    });

    return () => {
      // Remove the event listener on unmount
      unsubscribeEvent();
      unsubscribeError();
      unsubscribeSuccess();
      // Ensure the reading is stopped when the screen is unmounted
      CieManager.stopReading();
    };
  }, [navigation]);

  const handleStartReading = async () => {
    if (authUrl === undefined) {
      return;
    }

    setProgress(0);
    setStatus('reading');

    try {
      await CieManager.startReading(code, authUrl);
    } catch (e) {
      console.error('Error starting reading', JSON.stringify(e, null, 2));
      IOToast.error('Unable to start reading attributes');
    }
  };

  const handleStopReading = () => {
    setProgress(0);
    setStatus('idle');
    CieManager.stopReading();
  };

  if (!authUrl) {
    return (
      <LoadingSpinnerOverlay>
        <CiewWebView
          uri={
            'https://app-backend.io.italia.it/login?entityID=xx_servizicie&authLevel=SpidL3'
          }
          onAuthUrlChange={setAuthUrl}
        />
      </LoadingSpinnerOverlay>
    );
  }

  return (
    <ContentWrapper style={styles.container}>
      <View style={styles.progressContainer}>
        <ReadStatusComponent progress={progress} status={status} step={event} />
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
    </ContentWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 24,
    backgroundColor: 'white',
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
