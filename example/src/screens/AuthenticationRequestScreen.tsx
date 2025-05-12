import {
  ButtonSolid,
  ContentWrapper,
  IOToast,
  ListItemHeader,
  OTPInput,
} from '@pagopa/io-app-design-system';
import { CieManager, type NfcEvent } from '@pagopa/io-react-native-cie';
import { StackActions, useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
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
  const [event, setEvent] = useState<NfcEvent>();

  useEffect(() => {
    // Start listening for NFC events
    const unsubscribeEvent = CieManager.addEventListener((e) => {
      console.info('NFC Event', e);
      setEvent(e);
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

    setEvent(undefined);
    setStatus('reading');

    try {
      await CieManager.startReading(code, authUrl);
    } catch (e) {
      console.error('Error starting reading', JSON.stringify(e, null, 2));
      IOToast.error('Unable to start reading attributes');
    }
  };

  const handleStopReading = () => {
    setEvent(undefined);
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ContentWrapper style={styles.container}>
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
      </ContentWrapper>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 24,
    backgroundColor: 'white',
    paddingBottom: 24,
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
