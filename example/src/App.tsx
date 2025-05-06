import {
  CieManager,
  CieUtils,
  type NfcError,
  type NfcEvent,
} from '@pagopa/io-react-native-cie';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import { Alert, Button, FlatList, StyleSheet, Text, View } from 'react-native';

type CieEvent = (
  | (NfcEvent & { kind: 'event' })
  | (NfcError & { kind: 'error' })
) & {
  timestamp: number;
};

export default function App() {
  const flatListRef = useRef<FlatList<CieEvent>>(null);
  const [events, setEvents] = useState<CieEvent[]>([]);
  const [hasNFC, setHasNFC] = useState<boolean | undefined>();
  const [isNFCEnabled, setIsNFCEnabled] = useState<boolean | undefined>();
  const [isCieAuthenticationSupported, setIsCieAuthenticationSupported] =
    useState<boolean | undefined>();

  useEffect(() => {
    const checkNFC = async () => {
      setHasNFC(await CieUtils.hasNfcFeature());
      setIsNFCEnabled(await CieUtils.isNfcEnabled());
      setIsCieAuthenticationSupported(
        await CieUtils.isCieAuthenticationSupported()
      );
    };
    checkNFC();
  }, []);

  useEffect(() => {
    const eventSubscription = CieManager.addNfcEventListener((event) => {
      setEvents((prev) => [
        ...prev,
        { ...event, timestamp: new Date().getTime(), kind: 'event' },
      ]);
      flatListRef.current?.scrollToEnd({ animated: true });
    });
    const errorSubscription = CieManager.addNfcErrorListener((error) => {
      setEvents((prev) => [
        ...prev,
        { ...error, timestamp: new Date().getTime(), kind: 'error' },
      ]);
      flatListRef.current?.scrollToEnd({ animated: true });
    });

    return () => {
      eventSubscription.remove();
      errorSubscription.remove();
    };
  }, []);

  const handleReadAttributesSuccess = (data: any) => {
    Alert.alert('Success', JSON.stringify(data));
    CieManager.stopReading();
  };

  const handleReadAttributesError = (error: any) => {
    Alert.alert('Error', JSON.stringify(error));
    CieManager.stopReading();
  };
  return (
    <View style={styles.container}>
      <View style={styles.console}>
        <FlatList
          ref={flatListRef}
          contentContainerStyle={{ padding: 8 }}
          data={events}
          renderItem={({ item }) => (
            <Text
              key={item.timestamp}
              style={{
                color: item.kind === 'event' ? 'white' : 'red',
                fontSize: 12,
              }}
            >
              {dayjs(item.timestamp).format('HH:mm:ss.SSS')} - {item.name}
            </Text>
          )}
        />
      </View>
      <View style={styles.featureContainer}>
        <FeatureStatus title="Has NFC" value={hasNFC} />
        <View style={styles.divider} />
        <FeatureStatus title="Is NFC enabled" value={isNFCEnabled} />
        <View style={styles.divider} />
        <FeatureStatus
          title="Is CIE authentication supported"
          value={isCieAuthenticationSupported}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="Read CIE attributes"
          disabled={!isCieAuthenticationSupported}
          onPress={() =>
            CieManager.startReadingAttributes({
              onSuccess: handleReadAttributesSuccess,
              onError: handleReadAttributesError,
            })
          }
        />
        <Button
          title="Start CIE authentication"
          disabled={!isCieAuthenticationSupported}
          onPress={() => CieUtils.openNfcSettings()}
        />
        <Button
          title="Open NFC Settings"
          onPress={() => CieUtils.openNfcSettings()}
        />
      </View>
    </View>
  );
}

const FeatureStatus = ({
  title,
  value,
}: {
  title: string;
  value: boolean | undefined;
}) => {
  return (
    <View style={styles.featureStatus}>
      <Text>{title}</Text>
      <Text>{value ? 'OK 🟢' : 'KO 🔴'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'stretch',
    gap: 16,
  },
  console: {
    flex: 1,
    backgroundColor: 'black',
    borderRadius: 8,
    overflow: 'scroll',
  },
  featureContainer: {
    backgroundColor: 'lightgray',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  featureStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  divider: {
    height: 1,
    backgroundColor: 'gray',
    opacity: 0.3,
    marginVertical: 8,
  },
  buttonContainer: {
    gap: 8,
  },
});
