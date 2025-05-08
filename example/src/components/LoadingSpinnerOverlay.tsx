import { IOColors, LoadingSpinner } from '@pagopa/io-app-design-system';
import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

export const LoadingSpinnerOverlay = (props: PropsWithChildren) => {
  return (
    <View style={styles.container}>
      {props.children}
      <View style={styles.spinnerContainer}>
        <LoadingSpinner size={76} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  spinnerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: IOColors.white,
  },
});
