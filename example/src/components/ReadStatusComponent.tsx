import {
  IOColors,
  IOPictograms,
  IOText,
  Pictogram,
} from '@pagopa/io-app-design-system';
import { Platform } from 'react-native';
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
  progress: number;
  status: ReadStatus;
  step?: string;
};

export const ReadStatusComponent = ({ progress, status, step }: Props) => {
  return (
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
            {step && (
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
