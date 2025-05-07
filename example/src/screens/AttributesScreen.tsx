import {
  ContentWrapper,
  IOButton,
  IOColors,
  IOPictograms,
  IOToast,
  Pictogram,
} from '@pagopa/io-app-design-system';
import { CieManager } from '@pagopa/io-react-native-cie';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { DebugPrettyPrint } from '../components/DebugPrettyPrint';

type Status = 'idle' | 'reading' | 'error' | 'success';

const pictogramMap: Record<Status, IOPictograms> = {
  idle: 'nfcScaniOS',
  reading: 'nfcScaniOS',
  success: 'success',
  error: 'fatalError',
};

const statusColorMap: Record<Status, IOColors> = {
  idle: 'blueIO-500',
  reading: 'blueIO-500',
  success: 'success-500',
  error: 'error-500',
};

export function AttributesScreen() {
  const [status, setStatus] = useState<Status>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    // Start listening for NFC events
    CieManager.addEventListener((event) => {
      console.info('NFC Event', event);
      setProgress(event.progress * 100);
    });

    CieManager.addErrorListener((error) => {
      console.error('NFC Error', error);
      setResult(error);
      setStatus('error');
      IOToast.error('Error reading attributes');
    });

    CieManager.addAttributesSuccessListener((attributes) => {
      setResult(attributes);
      setStatus('success');
      IOToast.success('Attributes read successfully');
    });

    return () => {
      // Remove the event listener on unmount
      CieManager.removeAllListeners();
      // Ensure the reading is stopped when the screen is unmounted
      CieManager.stopReading();
    };
  }, []);

  const handleStartReading = async () => {
    setProgress(0);
    setResult(null);
    setStatus('reading');

    try {
      await CieManager.startReadingAttributes();
    } catch (e) {
      IOToast.error('Unable to start reading attributes');
    }
  };

  const handleStopReading = () => {
    setProgress(0);
    setResult(null);
    setStatus('idle');
    CieManager.stopReading();
  };

  return (
    <ContentWrapper style={styles.container}>
      <View style={styles.progressContainer}>
        <Animated.View layout={LinearTransition}>
          <AnimatedCircularProgress
            size={300}
            width={10}
            fill={progress}
            tintColor={IOColors[statusColorMap[status]]}
            backgroundColor={IOColors['grey-50']}
            padding={8}
          >
            {() => (
              <>
                <Pictogram size={180} name={pictogramMap[status]} />
              </>
            )}
          </AnimatedCircularProgress>
        </Animated.View>
      </View>
      <Animated.View
        style={styles.attributesContainer}
        layout={LinearTransition}
      >
        {result && <DebugPrettyPrint data={result} />}
      </Animated.View>
      <IOButton
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
  },
  progressContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attributesContainer: {
    justifyContent: 'flex-end',
  },
});
