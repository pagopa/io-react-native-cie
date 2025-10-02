import { ButtonSolid, TextInput } from '@pagopa/io-app-design-system';
import { CieManager, type NfcEvent } from '@pagopa/io-react-native-cie';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { DebugPrettyPrint } from '../../components/DebugPrettyPrint';
import {
  ReadStatusComponent,
  type ReadStatus,
} from '../../components/ReadStatusComponent';

export function InternalAuthenticationScreen() {
  const [status, setStatus] = useState<ReadStatus>('idle');
  const [event, setEvent] = useState<NfcEvent>();
  const [result, setResult] = useState<any>(null);
  const [challenge, setChallenge] = useState<string>('');

  useEffect(() => {
    const cleanup = [
      // Start listening for NFC events
      CieManager.addListener('onEvent', setEvent),
      // Start listening for errors
      CieManager.addListener('onError', (error) => {
        setResult(error);
        setStatus('error');
        Alert.alert(
          'Error while reading attributes',
          JSON.stringify(error, undefined, 2)
        );
      }),
      // Start listening for attributes success
      CieManager.addListener(
        'onInternalAuthenticationSuccess',
        (attributes) => {
          setResult(attributes);
          setStatus('success');
        }
      ),
    ];

    return () => {
      // Remove the event listener on unmount
      cleanup.forEach((remove) => remove());
      // Ensure the reading is stopped when the screen is unmounted
      CieManager.stopReading();
    };
  }, []);

  const handleStartReading = async () => {
    setEvent(undefined);
    setResult(null);
    setStatus('reading');

    try {
      await CieManager.startInternalAuthentication('foo');
    } catch (e) {
      setStatus('error');
      Alert.alert(
        'Error while reading attributes',
        JSON.stringify(e, undefined, 2)
      );
    }
  };

  const handleStopReading = () => {
    setEvent(undefined);
    setResult(null);
    setStatus('idle');
    CieManager.stopReading();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 124 : 0}
      >
        <View style={styles.progressContainer}>
          <ReadStatusComponent
            progress={event?.progress}
            status={status}
            step={event?.name}
          />
        </View>
        <Animated.View
          style={styles.attributesContainer}
          layout={LinearTransition}
        >
          {result && <DebugPrettyPrint data={{ challenge, ...result }} />}
        </Animated.View>
        <View style={styles.inputContainer}>
          <TextInput
            value={challenge}
            placeholder={'Challenge'}
            onChangeText={setChallenge}
          />
        </View>
        <ButtonSolid
          label={status === 'reading' ? 'Stop' : 'Sign challenge'}
          disabled={challenge.length === 0}
          onPress={() =>
            status === 'reading' ? handleStopReading() : handleStartReading()
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  inputContainer: {
    justifyContent: 'center',
    marginBottom: 16,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  attributesContainer: {
    justifyContent: 'flex-end',
  },
});
