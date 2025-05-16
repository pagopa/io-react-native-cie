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

### Events

| `io-cie-sdk`                  | `io-react-native-cie`       | Notes |
| :---------------------------- | :-------------------------- | :---- |
| `ON_TAG_DISCOVERED_NOT_CIE`   | `ON_TAG_DISCOVERED_NOT_CIE` |       |
| `TAG_ERROR_NFC_NOT_SUPPORTED` |                             |       |
| `ON_TAG_DISCOVERED`           |                             |       |
| `ON_TAG_LOST`                 |                             |       |
| `ON_CARD_PIN_LOCKED`          |                             |       |
| `PIN Locked`                  |                             |       |
| `ON_PIN_ERROR`                |                             |       |
| `PIN_INPUT_ERROR`             |                             |       |
| `CERTIFICATE_EXPIRED`         |                             |       |
| `CERTIFICATE_REVOKED`         |                             |       |
| `AUTHENTICATION_ERROR`        |                             |       |
| `ON_NO_INTERNET_CONNECTION`   |                             |       |
| `STOP_NFC_ERROR`              |                             |       |
| `START_NFC_ERROR`             |                             |       |
| `EXTENDED_APDU_NOT_SUPPORTED` |                             |       |
| `Transmission Error`          |                             |       |

### Errors

TBD

### Usage

TBD
