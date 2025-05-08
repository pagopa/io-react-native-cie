import {
  ButtonSolid,
  ContentWrapper,
  IOColors,
  IOPictograms,
  IOText,
  IOToast,
  Pictogram,
} from '@pagopa/io-app-design-system';
import { CieManager, type NfcEventName } from '@pagopa/io-react-native-cie';
import { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { DebugPrettyPrint } from '../components/DebugPrettyPrint';

type Status = 'idle' | 'reading' | 'error' | 'success';

const pictogramMap: Record<Status, IOPictograms> = {
  idle: 'smile',
  reading: Platform.select({ ios: 'nfcScaniOS', default: 'nfcScanAndroid' }),
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
  const [event, setEvent] = useState<NfcEventName>();
  const [progress, setProgress] = useState<number>(0);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    // Start listening for NFC events
    CieManager.addEventListener((e) => {
      console.info('NFC Event', e);
      setEvent(e.name);
      setProgress(e.progress * 100);
    });

    CieManager.addErrorListener((error) => {
      setResult(error);
      setStatus('error');
      setEvent(undefined);
      IOToast.error('Error while reading attributes');
    });

    CieManager.addAttributesSuccessListener((attributes) => {
      setResult(attributes);
      setStatus('success');
      setEvent(undefined);
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
    setEvent(undefined);
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
            backgroundColor={IOColors['grey-100']}
            padding={8}
          >
            {() => (
              <>
                <Animated.View layout={LinearTransition}>
                  <Pictogram size={180} name={pictogramMap[status]} />
                </Animated.View>
                {event && (
                  <IOText font="DMMono" color="black" weight="Bold" size={12}>
                    {event}
                  </IOText>
                )}
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
