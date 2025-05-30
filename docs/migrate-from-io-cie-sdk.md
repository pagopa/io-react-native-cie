## How to migrate from [io-cie-sdk](https://github.com/pagopa/io-cie-sdk)

### Methods

| `io-cie-sdk`                                                                | `io-react-native-cie`                                                   | Notes                                                                             |
| :-------------------------------------------------------------------------- | :---------------------------------------------------------------------- | :-------------------------------------------------------------------------------- |
| `hasApiLevelSupport()`                                                      | -                                                                       | Superseded by `isCIEAuthenticationSupported()`                                    |
| `hasNFCFeature()`                                                           | `hasNFCFeature()`                                                       |                                                                                   |
| `isCIEAuthenticationSupported()`                                            | `isCieAuthenticationSupported()`                                        |                                                                                   |
| `isNfcEnabled()`                                                            | `isNfcEnabled()`                                                        |                                                                                   |
| `launchCieID()`                                                             | -                                                                       | Moved to [io-react-native-cieid](https://github.com/pagopa/io-react-native-cieid) |
| `openNFCSettings()`                                                         | `openNFCSettings()`                                                     |                                                                                   |
| `onError(callback: (error: Error) => void)`                                 | `addErrorListener(listener: (error: NfcError) => void)`                 |                                                                                   |
| `onSuccess(callback: (url: string) => void)`                                | `addSuccessListener(listener: (uri: string) => void)`                   |                                                                                   |
| `enableLog(isEnabled: boolean)`                                             | -                                                                       | Not available. Logs are enabled by default in debug builds                        |
| `setCustomIdpUrl(idpUrl: string?)`                                          | `setCustomIdpUrl(url: string)`                                          | IDP url could not be reset using `undefined`                                      |
| `setAuthenticationUrl(url: string)`                                         | -                                                                       | Moved to `startReading` function parameters                                       |
| `setPin(pin: string)`                                                       | -                                                                       | Moved to `startReading` function parameters                                       |
| `start(alertMessagesConfig?: Partial<Record<iOSAlertMessageKeys, string>>)` | -                                                                       | Not required                                                                      |
| `startListeningNFC()`                                                       | `startReading(pin: string, authenticationUrl: string, timeout: number)` |                                                                                   |
| `stopListeningNFC()`                                                        | `stopReading()`                                                         |                                                                                   |
| `removeAllListeners()`                                                      | `removeAllListeners()`                                                  |                                                                                   |
| `setAlertMessage(key: iOSAlertMessageKeys, value: string)`                  | `setAlertMessage(key: AlertMessageKey, value: string)`                  |                                                                                   |

### Error events

| `io-cie-sdk`                  | `io-react-native-cie`       | Notes |
| :---------------------------- | :-------------------------- | :---- |
| `ON_TAG_DISCOVERED_NOT_CIE`   | `ON_TAG_DISCOVERED_NOT_CIE` |       |
| `TAG_ERROR_NFC_NOT_SUPPORTED` | `ON_TAG_DISCOVERED_NOT_CIE` |       |
| `ON_TAG_DISCOVERED`           | `ON_TAG_DISCOVERED`         |       |
| `ON_TAG_LOST`                 | `TAG_LOST`                  |       |
| `ON_CARD_PIN_LOCKED`          | `CARD_BLOCKED`              |       |
| `PIN Locked`                  | `CARD_BLOCKED`              |       |
| `ON_PIN_ERROR`                | `WRONG_PIN`                 |       |
| `PIN_INPUT_ERROR`             |                             | Moved to exceptions  |
| `CERTIFICATE_EXPIRED`         | `CERTIFICATE_EXPIRED`       |       |
| `CERTIFICATE_REVOKED`         | `CERTIFICATE_REVOKED`       |       |
| `AUTHENTICATION_ERROR`        | `AUTHENTICATION_ERROR`      |       |
| `ON_NO_INTERNET_CONNECTION`   | `NO_INTERNET_CONNECTION`    |       |
| `STOP_NFC_ERROR`              |                             | Moved to exceptions      |
| `START_NFC_ERROR`             |                             | Moved to exceptions      |
| `EXTENDED_APDU_NOT_SUPPORTED` | `APDU_ERROR`                |       |
| `Transmission Error`          | `GENERIC_ERROR`             |       |

