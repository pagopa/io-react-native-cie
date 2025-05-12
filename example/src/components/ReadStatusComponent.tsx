import {
  IOColors,
  IOPictograms,
  IOText,
  Pictogram,
} from '@pagopa/io-app-design-system';
import { Platform, StyleSheet } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import Animated, { LinearTransition } from 'react-native-reanimated';

export type ReadStatus = 'idle' | 'reading' | 'error' | 'success';

const pictogramMap: Record<ReadStatus, IOPictograms> = {
  idle: 'smile',
  reading: Platform.select({ ios: 'nfcScaniOS', default: 'nfcScanAndroid' }),
  success: 'success',
  error: 'fatalError',
};

const statusColorMap: Record<ReadStatus, IOColors> = {
  idle: 'blueIO-500',
  reading: 'blueIO-500',
  success: 'success-500',
  error: 'error-500',
};

type Props = {
  progress?: number;
  status: ReadStatus;
  step?: string;
};

export const ReadStatusComponent = ({ progress = 0, status, step }: Props) => {
  return (
    <Animated.View layout={LinearTransition} style={styles.container}>
      <AnimatedCircularProgress
        size={300}
        width={10}
        fill={progress * 100}
        tintColor={IOColors[statusColorMap[status]]}
        backgroundColor={IOColors['grey-100']}
        padding={8}
      >
        {() => (
          <>
            <Animated.View layout={LinearTransition}>
              <Pictogram size={180} name={pictogramMap[status]} />
            </Animated.View>
            {status === 'reading' && step && (
              <IOText font="DMMono" color="black" weight="Bold" size={12}>
                {step}
              </IOText>
            )}
          </>
        )}
      </AnimatedCircularProgress>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
