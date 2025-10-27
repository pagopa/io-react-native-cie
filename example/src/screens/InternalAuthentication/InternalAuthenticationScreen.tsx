import {
  IOButton,
  ListItemSwitch,
  TextInput,
} from '@pagopa/io-app-design-system';
import { CieManager, type NfcEvent } from '@pagopa/io-react-native-cie';
import { useEffect, useState } from 'react';
import {
  Alert,
  Keyboard,
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

import { useNavigation } from '@react-navigation/native';
import { encodeChallenge } from '../../utils/encoding';

export function InternalAuthenticationScreen() {
  const navigation = useNavigation();
  const [status, setStatus] = useState<ReadStatus>('idle');
  const [event, setEvent] = useState<NfcEvent>();
  const [challenge, setChallenge] = useState<string>('');

  const [isBase64Encoding, setIsBase64Encoding] = useState(false);
  const toggleEncodingSwitch = () =>
    setIsBase64Encoding((previousState) => !previousState);

  useEffect(() => {
    const cleanup = [
      // Start listening for NFC events
      CieManager.addListener('onEvent', setEvent),
      // Start listening for errors
      CieManager.addListener('onError', (error) => {
        setStatus('error');
        Alert.alert(
          'Error while reading attributes',
          JSON.stringify(error, undefined, 2)
        );
      }),
      // Start listening for attributes success
      CieManager.addListener(
        'onInternalAuthenticationSuccess',
        (internalAutheticationResult) => {
          setStatus('success');
          navigation.reset({
            index: 0,
            routes: [
              { name: 'Home' },
              {
                name: 'InternalAuthenticationResult',
                params: {
                  result: internalAutheticationResult,
                  challenge,
                  encodedChallenge: encodeChallenge(
                    challenge,
                    isBase64Encoding ? 'base64' : 'hex'
                  ),
                  encoding: isBase64Encoding ? 'base64' : 'hex',
                },
              },
            ],
          });
        }
      ),
    ];

    return () => {
      // Remove the event listener on unmount
      cleanup.forEach((remove) => remove());
      // Ensure the reading is stopped when the screen is unmounted
      CieManager.stopReading();
    };
  }, [challenge, isBase64Encoding, navigation]);

  const handleStartReading = async () => {
    Keyboard.dismiss();
    setEvent(undefined);
    setStatus('reading');

    try {
      await CieManager.startInternalAuthentication(
        challenge,
        isBase64Encoding ? 'base64' : 'hex'
      );
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
    setStatus('idle');
    CieManager.stopReading();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 124 : 0}
      >
        <View style={styles.progressContainer}>
          <ReadStatusComponent
            progress={event?.progress}
            status={status}
            step={event?.name}
          />
        </View>
        <View style={styles.inputContainer}>
          <ListItemSwitch
            label="Use base64 encoding"
            onSwitchValueChange={toggleEncodingSwitch}
            value={isBase64Encoding}
          />
          <TextInput
            value={challenge}
            placeholder={'Challenge'}
            onChangeText={setChallenge}
          />
        </View>
        <IOButton
          variant="solid"
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
