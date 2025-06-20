import { BodySmall, IOColors, IOText } from '@pagopa/io-app-design-system';
import { StyleSheet, View } from 'react-native';

type Props = {
  title?: string;
  data: any;
};

export const DebugPrettyPrint = ({ title, data }: Props) => {
  return (
    <View testID="DebugPrettyPrintTestID" style={styles.container}>
      {title && (
        <View style={styles.header}>
          <BodySmall weight="Semibold" color="white">
            {title}
          </BodySmall>
        </View>
      )}
      <View style={styles.content} pointerEvents="box-only">
        <IOText
          font="DMMono"
          size={12}
          lineHeight={18}
          color={'grey-700'}
          weight="Medium"
        >
          {JSON.stringify(data, null, 2)}
        </IOText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 4,
  },
  header: {
    backgroundColor: IOColors['error-600'],
    padding: 12,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  content: {
    backgroundColor: IOColors['grey-50'],
    padding: 8,
  },
});
