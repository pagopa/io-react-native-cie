import { ButtonSolid, IOToast } from '@pagopa/io-app-design-system';
import { CieManager, type NfcEvent } from '@pagopa/io-react-native-cie';
import { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { DebugPrettyPrint } from '../components/DebugPrettyPrint';
import {
  ReadStatusComponent,
  type ReadStatus,
} from '../components/ReadStatusComponent';

export function AttributesScreen() {
  const [status, setStatus] = useState<ReadStatus>('idle');
  const [event, setEvent] = useState<NfcEvent>();
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const cleanup = [
      // Start listening for NFC events
      CieManager.addEventListener(setEvent),
      // Start listening for errors
      CieManager.addErrorListener((error) => {
        setResult(error);
        setStatus('error');
        IOToast.error('Error while reading attributes');
      }),
      // Start listening for attributes success
      CieManager.addAttributesSuccessListener((attributes) => {
        setResult(attributes);
        setStatus('success');
        IOToast.success('Attributes read successfully');
      }),
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
      await CieManager.startReadingAttributes();
    } catch (e) {
      setStatus('error');
      IOToast.error('Unable to start reading attributes');
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
        {result && <DebugPrettyPrint data={result} />}
      </Animated.View>
      <ButtonSolid
        label={status === 'reading' ? 'Stop reading' : 'Start reading'}
        onPress={() =>
          status === 'reading' ? handleStopReading() : handleStartReading()
        }
      />
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
  attributesContainer: {
    justifyContent: 'flex-end',
  },
});
