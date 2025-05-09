import {
  ButtonLink,
  ButtonSolid,
  ContentWrapper,
  Divider,
  IOColors,
  ListItemInfo,
  Pictogram,
  VStack,
} from '@pagopa/io-app-design-system';
import { CieUtils } from '@pagopa/io-react-native-cie';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useAppStateActive } from '../hooks/useAppStateActive';

export function HomeScreen() {
  const navigation = useNavigation();
  const [hasNFC, setHasNFC] = useState<boolean | undefined>();
  const [isNFCEnabled, setIsNFCEnabled] = useState<boolean | undefined>();
  const [isCieAuthenticationSupported, setIsCieAuthenticationSupported] =
    useState<boolean | undefined>();

  useAppStateActive(
    useCallback(async () => {
      setHasNFC(await CieUtils.hasNfcFeature());
      setIsNFCEnabled(await CieUtils.isNfcEnabled());
      setIsCieAuthenticationSupported(
        await CieUtils.isCieAuthenticationSupported()
      );
    }, [])
  );

  return (
    <ContentWrapper style={styles.container}>
      <View style={styles.pictogramContainer}>
        <Pictogram name="cie" size={180} />
      </View>
      <View style={styles.infoContainer}>
        <ListItemInfo
          value="Has NFC"
          endElement={{
            type: 'badge',
            componentProps: {
              text: hasNFC ? '🟢 OK' : '🔴 KO',
              variant: hasNFC ? 'success' : 'error',
            },
          }}
        />
        <Divider />
        <ListItemInfo
          value="Is NFC enabled"
          endElement={{
            type: 'badge',
            componentProps: {
              text: isNFCEnabled ? '🟢 OK' : '🔴 KO',
              variant: isNFCEnabled ? 'success' : 'error',
            },
          }}
        />
        <Divider />
        <ListItemInfo
          value="CIE authentication supported"
          endElement={{
            type: 'badge',
            componentProps: {
              text: isCieAuthenticationSupported ? '🟢 OK' : '🔴 KO',
              variant: isCieAuthenticationSupported ? 'success' : 'error',
            },
          }}
        />
      </View>
      <VStack space={8}>
        <ButtonSolid
          label="Read CIE attributes"
          icon="creditCard"
          disabled={!isCieAuthenticationSupported}
          onPress={() => navigation.navigate('Attributes')}
        />
        <ButtonSolid
          label="Start CIE authentication"
          icon="cieLetter"
          disabled={!isCieAuthenticationSupported}
          onPress={() => navigation.navigate('AuthenticationRequest')}
        />
        <View style={styles.buttonContainer}>
          <ButtonLink
            label="Open NFC Settings"
            icon="coggle"
            onPress={() => CieUtils.openNfcSettings()}
          />
        </View>
      </VStack>
    </ContentWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 24,
    gap: 24,
    backgroundColor: 'white',
  },
  pictogramContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    backgroundColor: IOColors['grey-50'],
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonContainer: {
    alignSelf: 'center',
    paddingVertical: 16,
  },
});
