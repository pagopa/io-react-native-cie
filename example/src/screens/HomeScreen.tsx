import {
  Divider,
  IOColors,
  ListItemInfo,
  ListItemNav,
  VSpacer,
  VStack,
} from '@pagopa/io-app-design-system';
import { CieLogger, CieUtils } from '@pagopa/io-react-native-cie';
import { useNavigation } from '@react-navigation/native';
import { Fragment, useCallback, useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStateActive } from '../hooks/useAppStateActive';

export function HomeScreen() {
  const navigation = useNavigation();
  const [hasNFC, setHasNFC] = useState<boolean | undefined>();
  const [isNFCEnabled, setIsNFCEnabled] = useState<boolean | undefined>();
  const [isCieAuthenticationSupported, setIsCieAuthenticationSupported] =
    useState<boolean | undefined>();

  useEffect(() => {
    CieLogger.setLogMode('FILE');
  }, []);

  useAppStateActive(
    useCallback(async () => {
      setHasNFC(await CieUtils.hasNfcFeature());
      setIsNFCEnabled(await CieUtils.isNfcEnabled());
      setIsCieAuthenticationSupported(
        await CieUtils.isCieAuthenticationSupported()
      );
    }, [])
  );

  const obtainLogs = async () => {
    if (Platform.OS === 'ios') {
      try {
        const logs = await CieLogger.getLogs();
        navigation.navigate('Result', {
          title: 'Logs',
          data: logs,
        });
      } catch (e) {
        Alert.alert(
          'Error while obtaining logs',
          JSON.stringify(e, undefined, 2)
        );
      }
    }
  };

  const infos = [
    { label: 'Has NFC', value: hasNFC },
    { label: 'Is NFC enabled', value: isNFCEnabled },
    {
      label: 'CIE authentication supported',
      value: isCieAuthenticationSupported,
    },
  ];

  const tests: ReadonlyArray<ListItemNav> = [
    {
      value: 'Start CIE attributes reading',
      icon: 'creditCard',
      onPress: () => navigation.navigate('Attributes'),
    },
    {
      value: 'Start CIE authentication',
      icon: 'cieLetter',
      onPress: () => navigation.navigate('AuthenticationRequest'),
    },
    {
      value: 'Start Internal CIE authentication',
      icon: 'selfCert',
      onPress: () => navigation.navigate('InternalAuthentication'),
    },
    {
      value: 'Start MRTD with PACE reading',
      icon: 'fiscalCodeIndividual',
      onPress: () => navigation.navigate('Mrtd'),
    },
    {
      value: 'Start Internal Auth + MRTD reading',
      icon: 'navWalletFocused',
      onPress: () => navigation.navigate('InternalAuthAndMrtd'),
    },
    {
      value: 'Start Certificate reading',
      icon: 'navWalletFocused',
      onPress: () => navigation.navigate('CertificateReading'),
    },
  ];

  return (
    <SafeAreaView edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <VStack style={styles.infoContainer}>
          {infos.map((info, index) => (
            <Fragment key={`home-screen-info-fragment-${info.label}-${index}`}>
              {index !== 0 && <Divider />}
              <ListItemInfo
                value={info.label}
                endElement={{
                  type: 'badge',
                  componentProps: {
                    text: info.value ? '🟢 OK' : '🔴 KO',
                    variant: info.value ? 'success' : 'error',
                  },
                }}
              />
            </Fragment>
          ))}
        </VStack>
        <VSpacer size={24} />
        <VStack style={styles.testsContainer}>
          {tests.map((item, index) => {
            return (
              <Fragment key={`home-screen-fragment-${item.value}-${index}`}>
                {index !== 0 && <Divider />}
                <ListItemNav {...item} />
              </Fragment>
            );
          })}
          {Platform.OS === 'android' && (
            <>
              <Divider />
              <ListItemNav
                value="Open NFC Settings"
                icon="coggle"
                onPress={() => CieUtils.openNfcSettings()}
              />
            </>
          )}
          {Platform.OS === 'ios' && (
            <>
              <Divider />
              <ListItemNav
                value="View logs"
                icon="docAttach"
                onPress={obtainLogs}
              />
            </>
          )}
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingVertical: 24,
  },
  infoContainer: {
    backgroundColor: IOColors['grey-50'],
    paddingHorizontal: 16,
    marginHorizontal: 24,
    borderRadius: 8,
  },
  testsContainer: {
    marginHorizontal: 24,
  },
  buttonContainer: {
    alignSelf: 'center',
    paddingVertical: 16,
  },
});
