import {
  IOButton,
  ListItemSwitch,
  TextInput,
  VSpacer,
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

export function InternalAuthAndMrtdScreen() {
  const navigation = useNavigation();
  const [status, setStatus] = useState<ReadStatus>('idle');
  const [event, setEvent] = useState<NfcEvent>();
  const [can, setCan] = useState<string>('');
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
          'Error while reading MRTD with PACE',
          JSON.stringify(error, undefined, 2)
        );
      }),
      // Start listening for reading MRTD data success
      CieManager.addListener(
        'onInternalAuthAndMRTDWithPaceSuccess',
        (internalAuthAndMrtdResponse) => {
          setStatus('success');
          navigation.reset({
            index: 0,
            routes: [
              { name: 'Home' },
              {
                name: 'InternalAuthAndMrtdResult',
                params: {
                  result: internalAuthAndMrtdResponse,
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
  }, [isBase64Encoding, navigation]);

  const handleStartReading = async () => {
    Keyboard.dismiss();
    setEvent(undefined);
    setStatus('reading');

    try {
      await CieManager.startInternalAuthAndMRTDReading(
        can,
        challenge,
        isBase64Encoding ? 'base64' : 'hex'
      );
    } catch (e) {
      setStatus('error');
      Alert.alert(
        'Error while reading MRTD with PACE',
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
          <TextInput value={can} placeholder={'CAN'} onChangeText={setCan} />
          <VSpacer size={8} />
          <TextInput
            value={challenge}
            placeholder={'Challenge'}
            onChangeText={setChallenge}
          />
        </View>
        <IOButton
          variant="solid"
          label={status === 'reading' ? 'Stop' : 'Start sigtn and reading'}
          disabled={can.length < 6 && challenge.length === 0}
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
});
