import {
  HStack,
  IOButton,
  ListItemRadio,
  TextInput,
  VStack,
} from '@pagopa/io-app-design-system';
import {
  CieManager,
  type NfcEvent,
  type ResultEncoding,
} from '@pagopa/io-react-native-cie';
import { useEffect, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import {
  ReadStatusComponent,
  type ReadStatus,
} from '../components/ReadStatusComponent';

import { StackActions, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { encodeChallenge } from '../utils/encoding';

export function InternalAuthAndMrtdScreen() {
  const navigation = useNavigation();
  const [status, setStatus] = useState<ReadStatus>('idle');
  const [event, setEvent] = useState<NfcEvent>();
  const [can, setCan] = useState<string>('');
  const [challenge, setChallenge] = useState<string>('');

  const [encoding, setEncoding] = useState<ResultEncoding>('hex');

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
          navigation.dispatch(
            StackActions.replace('Result', {
              title: 'Internal Auth + MRTD',
              data: JSON.stringify(
                {
                  result: internalAuthAndMrtdResponse,
                  challenge,
                  encodedChallenge: encodeChallenge(challenge, encoding),
                  encoding,
                },
                undefined,
                2
              ),
            })
          );
        }
      ),
    ];

    return () => {
      // Remove the event listener on unmount
      cleanup.forEach((remove) => remove());
      // Ensure the reading is stopped when the screen is unmounted
      CieManager.stopReading();
    };
  }, [challenge, encoding, navigation]);

  const handleStartReading = async () => {
    Keyboard.dismiss();
    setEvent(undefined);
    setStatus('reading');

    try {
      await CieManager.startInternalAuthAndMRTDReading(
        can,
        challenge,
        encoding
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
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 124 : 0}
    >
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.progressContainer}>
          <ReadStatusComponent
            progress={event?.progress}
            status={status}
            step={event?.name}
          />
        </View>
        <VStack space={8} style={styles.inputContainer}>
          <TextInput
            value={can}
            placeholder={'CAN'}
            onChangeText={setCan}
            textInputProps={{
              keyboardType: 'number-pad',
              inputMode: 'numeric',
            }}
          />
          <TextInput
            value={challenge}
            placeholder={'Challenge'}
            onChangeText={setChallenge}
          />
          <HStack space={8}>
            <ListItemRadio
              selected={encoding === 'hex'}
              value={'HEX'}
              onValueChange={() => setEncoding('hex')}
            />
            <ListItemRadio
              selected={encoding === 'base64'}
              value={'Base64'}
              onValueChange={() => setEncoding('base64')}
            />
            <ListItemRadio
              selected={encoding === 'base64url'}
              value={'Base64 URL-safe'}
              onValueChange={() => setEncoding('base64url')}
            />
          </HStack>
        </VStack>
        <IOButton
          variant="solid"
          label={status === 'reading' ? 'Stop' : 'Start sign and reading'}
          disabled={can.length !== 6 || challenge.length === 0}
          onPress={() =>
            status === 'reading' ? handleStopReading() : handleStartReading()
          }
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
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
    backgroundColor: 'white',
    justifyContent: 'center',
    marginBottom: 16,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
});
