import {
  ButtonSolid,
  ContentWrapper,
  IOToast,
} from '@pagopa/io-app-design-system';
import { CieManager, type NfcEvent } from '@pagopa/io-react-native-cie';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
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
    // Start listening for NFC events
    const unsubscribeEvent = CieManager.addEventListener((e) => {
      setEvent(e);
    });

    const unsubscribeError = CieManager.addErrorListener((error) => {
      setResult(error);
      setStatus('error');
      setEvent(undefined);
      IOToast.error('Error while reading attributes');
    });

    const unsubscribeAttributesSuccess =
      CieManager.addAttributesSuccessListener((attributes) => {
        setResult(attributes);
        setStatus('success');
        IOToast.success('Attributes read successfully');
      });

    return () => {
      // Remove the event listener on unmount
      unsubscribeEvent();
      unsubscribeError();
      unsubscribeAttributesSuccess();
      // Ensure the reading is stopped when the screen is unmounted
      CieManager.stopReading();
    };
  }, []);

  const handleStartReading = async () => {
    setEvent(undefined);
    setResult(null);
    setStatus('reading');
    setEvent(undefined);
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
    <ContentWrapper style={styles.container}>
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
    </ContentWrapper>
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
