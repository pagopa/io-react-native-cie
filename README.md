[![npm version](https://img.shields.io/npm/v/@pagopa/io-react-native-cie.svg)](https://www.npmjs.com/package/@pagopa/io-react-native-cie) [![MIT License](https://img.shields.io/github/license/pagopa/io-react-native-cie)](LICENSE)

# @pagopa/io-react-native-cie

Module to handle CIE (Electronic Identity Card) operations natively in React Native apps.

## Table of Contents

- [Installation](#installation)
- [Example App](#example-app)
- [API](#api)
- [Usage](#usage)
  - [Check NFC Status](#check-nfc-status)
  - [Reading CIE Data](#reading-cie-data)
    - [Reading Attributes](#reading-attributes)
    - [Authentication](#authentication)
  - [Event System](#event-system)
    - [NFC read events](#nfc-read-events)
    - [NFC error events](#nfc-error-events)
    - [Available Event Listeners](#available-event-listeners)
    - [Example Usage](#example-usage)
  - [Alert Messages](#alert-messages)
    - [Available Alert Messages](#available-alert-messages)
- [NFC Events](#nfc-events)
  - [iOS](#ios)
  - [Android](#android)
- [NFC Errors](#nfc-errors)
  - [iOS](#ios-1)
  - [Android](#android-1)
- [Types](#types)
- [Errors](#errors)
- [Contributing](#contributing)
- [License](#license)

## Installation

```sh
npm install @pagopa/io-react-native-cie
# or
yarn add @pagopa/io-react-native-cie
```

## Example App

A fully working example app demonstrating how to use this package is available in the [example](./example) directory.

To run the example app, follow the instructions in [example/README.md](./example/README.md).

## API

List of available functions

| Function                                                                      | Return             | Descrizione                                                   |
| :---------------------------------------------------------------------------- | :----------------- | :------------------------------------------------------------ |
| `hasNFCFeature()`                                                             | `Promise<boolean>` | (Android) Checks if the device supports NFC feature           |
| `isNfcEnabled()`                                                              | `Promise<boolean>` | (Android) Checks if the NFC is currently enabled              |
| `isCieAuthenticationSupported()`                                              | `Promise<boolean>` | (Android) Checks if the device supports CIE autentication     |
| `openNfcSettings()`                                                           | `Promise<void>`    | (Android) Opens NFC system settings page                      |
| `addEventListener(listener: (event: NfcEvent) => void)`                       | `() => void`       | Adds a NFC event listener                                     |
| `addErrorListener(listener: (error: NfcError) => void)`                       | `() => void`       | Adds a NFC error listener                                     |
| `addAttributesSuccessListener(listener: (attributes: CieAttributes) => void)` | `() => void`       | Adds a CIE attributes read success listener                   |
| `addSuccessListener(listener: (uri: string) => void)`                         | `() => void`       | Adds a CIE authentication success listener                    |
| `removeAllListeners()`                                                        | `void`             | Removes all registered listeners                              |
| `setCustomIdpUrl(url: string)`                                                | `void`             | Updates IDP url                                               |
| `setAlertMessage(key: AlertMessageKey, value: string)`                        | `void`             | (iOS) Updates iOS NFC modal alert message                     |
| `setCurrentAlertMessage(value: string)`                                       | `void`             | (iOS) Updates currently displayed iOS NFC modal alert message |
| `startReadingAttributes(timeout: number)`                                     | `Promise<void`     | Start the CIE attributes reading process                      |
| `startReading(pin: string, authenticationUrl: string, timeout: number)`       | `Promise<void`     | Start the CIE reading process fro authentication              |
| `stopReading()`                                                               | `Promise<void`     | (Android) Stops all reading process                           |

## Usage

The package is split into two modules:

- [CieUtils](/src/utils): Provides functions to check the NFC status of the device.
- [CieManager](/src/manager): Provides CIE read and authentication capabilities.

### Check NFC Status

**Note:** These methods are applicable only for Android devices, as iOS devices always have NFC available.

```typescript
import { CieUtils } from '@pagopa/io-react-native-cie';

// Check if the device has NFC
await CieUtils.hasNfcFeature();
// Check if NFC is enabled
await CieUtils.isNfcEnabled();
// Convenient method to check if CIE authentication is supported
await CieUtils.isCieAuthenticationSupported();
```

### Reading CIE Data

#### Reading Attributes

Read CIE attributes (card type and base64-encoded data):

```typescript
import { CieManager } from '@pagopa/io-react-native-cie';

// Start reading with optional timeout (Android only)
CieManager.startReadingAttributes(timeout?: number)
  .then(() => console.log('Reading started'))
  .catch(error => console.error('Error:', error));
```

#### Authentication

Start the CIE authentication process:

```typescript
CieManager.startReading(
  pin: string,           // CIE card PIN
  authenticationUrl: string,  // Service URL
  timeout?: number       // Optional timeout (Android only)
)
  .then(() => console.log('Authentication started'))
  .catch(error => console.error('Error:', error));
```

### Event System

The library uses an event-driven approach for NFC operations. Events are emitted to notify your application about progress, success, or failure. Each listener method returns a cleanup function that should be called when the operation is complete or when your component unmounts.

#### NFC read events

List of events that are emitted during CIE reading process

<details>
  <summary>iOS</summary>

| Event                       | Description                                                |
| --------------------------- | ---------------------------------------------------------- |
| ON_TAG_DISCOVERED           | Tag has been discovered                                    |
| ON_TAG_DISCOVERED_NOT_CIE   | Discovered tag is not a CIE                                |
| CONNECTED                   | Connected to tag                                           |
| GET_SERVICE_ID              | Get CIE serviceId                                          |
| SELECT_IAS                  | Select IAS Application                                     |
| SELECT_CIE                  | Select CIE Application                                     |
| DH_INIT_GET_G               | Get DiffieHellman G parameter                              |
| DH_INIT_GET_P               | Get DiffieHellman P parameter                              |
| DH_INIT_GET_Q               | Get DiffieHellman Q parameter                              |
| READ_CHIP_PUBLIC_KEY        | Retrive internal authentication key                        |
| SELECT_FOR_READ_FILE        | Select file                                                |
| READ_FILE                   | Read file                                                  |
| GET_D_H_EXTERNAL_PARAMETERS | Retrive Diffie Hellman external authenticationl parameters |
| SET_D_H_PUBLIC_KEY          | Set Diffie Hellman internal key                            |
| GET_ICC_PUBLIC_KEY          | Retrive ICC Public Key                                     |
| CHIP_SET_KEY                | Select key for certificate validation                      |
| CHIP_VERIFY_CERTIFICATE     | Certificate validation                                     |
| CHIP_SET_CAR                | Select key for external authentication                     |
| CHIP_GET_CHALLENGE          | Get challenge for external authentication                  |
| CHIP_ANSWER_CHALLENGE       | Responds to challenge for external authentication          |
| SELECT_KEY                  | Select key                                                 |
| VERIFY_PIN                  | Verify CIE Pin                                             |
| SIGN                        | Sign data                                                  |
| READ_CERTIFICATE            | Read CIE User Certificate                                  |
| SELECT_ROOT                 | Select Root Application                                    |

</details>

<details>

  <summary>Android</summary>

| Event                         | Description                                            |
| ----------------------------- | ------------------------------------------------------ |
| ON_TAG_DISCOVERED             | Tag has been discovered                                |
| ON_TAG_DISCOVERED_NOT_CIE     | Discovered tag is not a CIE                            |
| CONNECTED                     | Connected to tag                                       |
| SELECT_IAS_SERVICE_ID         | Selects internal authentication service for service ID |
| SELECT_CIE_SERVICE_ID         | Selects CIE service ID                                 |
| SELECT_READ_FILE_SERVICE_ID   | Selects read file service ID                           |
| READ_FILE_SERVICE_ID_RESPONSE | Reads file service ID response                         |
| SELECT_IAS                    | Selects internal authentication service                |
| SELECT_CIE                    | Selects CIE application                                |
| DH_INIT_GET_G                 | Gets G for Diffie-Hellman initialization               |
| DH_INIT_GET_P                 | Gets P for Diffie-Hellman initialization               |
| DH_INIT_GET_Q                 | Gets Q for Diffie-Hellman initialization               |
| SELECT_FOR_READ_FILE          | Selects for reading a file                             |
| READ_FILE                     | Reads a file                                           |
| INIT_EXTERNAL_AUTHENTICATION  | Initializes external authentication                    |
| SET_MSE                       | Sets MSE                                               |
| D_H_KEY_EXCHANGE_GET_DATA     | Exchanges Diffie-Hellman data                          |
| SIGN1_SELECT                  | Selects SIGN1 message                                  |
| SIGN1_VERIFY_CERT             | Verifies SIGN1 certificate                             |
| SET_CHALLENGE_RESPONSE        | Sets challenge response                                |
| GET_CHALLENGE_RESPONSE        | Gets challenge response                                |
| EXTERNAL_AUTHENTICATION       | Performs external authentication                       |
| INTERNAL_AUTHENTICATION       | Performs internal authentication                       |
| GIVE_RANDOM                   | Provides random data                                   |
| VERIFY_PIN                    | Verifies PIN                                           |
| READ_FILE_SM                  | Reads file with secure messaging                       |
| SIGN                          | Signs data                                             |
| SIGN_WITH_CIPHER              | Signs with cipher                                      |
| SELECT_ROOT                   | Selects root                                           |

</details>

#### NFC error events

List of error event that may be emitted during CIE reading process

<details>
  <summary>iOS</summary>

| Error                                           | Description                                   |
| ----------------------------------------------- | --------------------------------------------- |
| scanNotSupported                                | This device doesn't support tag scanning      |
| responseError(let apduStatus)                   | apduStatus.description                        |
| invalidTag                                      | Error reading tag                             |
| sendCommandForResponse                          | Send command to read response                 |
| missingAuthenticationUrl                        | Missing authentication url                    |
| emptyPin                                        | Empty pin                                     |
| missingDeepLinkParameters                       | Missing deeplink parameters                   |
| errorBuildingApdu                               | Error building apdu                           |
| errorDecodingAsn1                               | Error decoding asn1                           |
| secureMessagingHashMismatch                     | Secure messaging hash mismatch                |
| secureMessagingRequired                         | Secure messaging required                     |
| chipAuthenticationFailed                        | Chip authentication failed                    |
| commonCryptoError(let status, let functionName) | Error in \(functionName) \(status)            |
| sslError(let status, let functionName)          | Error in \(functionName) \(status)            |
| tlsUnsupportedAlgorithm                         | TLS Unsupported Algorithm                     |
| tlsHashingFailed                                | Failed to hash                                |
| idpEmptyBody                                    | Idp Empty response                            |
| idpCodeNotFound                                 | Idp Code not found                            |
| wrongPin(let remainingTries)                    | Wrong pin. Remaining tries: \(remainingTries) |
| cardBlocked                                     | Card blocked                                  |
| genericError                                    | Generic error                                 |

</details>

<details>
  <summary>Android</summary>

| Error                        | Description                                     |
| ---------------------------- | ----------------------------------------------- |
| NOT_A_CIE                    | The tag is not a CIE card                       |
| PIN_REGEX_NOT_VALID          | The PIN format is not valid                     |
| PIN_BLOCKED                  | The PIN is blocked                              |
| WRONG_PIN                    | The PIN entered is incorrect                    |
| APDU_ERROR                   | An APDU error occurred                          |
| VERIFY_SM_DATA_OBJECT_LENGTH | Secure messaging data object has invalid length |
| VERIFY_SM_MAC_LENGTH         | Secure messaging MAC has invalid length         |
| VERIFY_SM_NOT_SAME_MAC       | Secure messaging MAC does not match             |
| NOT_EXPECTED_SM_TAG          | Unexpected secure messaging tag                 |
| CHIP_AUTH_ERROR              | Chip authentication failed                      |
| EXTENDED_APDU_NOT_SUPPORTED  | Extended APDU is not supported                  |
| FAIL_TO_CONNECT_WITH_TAG     | Failed to connect with the tag                  |
| TAG_LOST                     | The tag was lost during the operation           |
| STOP_NFC_ERROR               | Error occurred while stopping NFC               |
| SELECT_ROOT_EXCEPTION        | Exception occurred while selecting root         |
| GENERAL_EXCEPTION            | A general exception occurred                    |
| ASN_1_NOT_RIGHT_LENGTH       | ASN.1 data has incorrect length                 |
| ASN_1_NOT_VALID              | ASN.1 data is not valid                         |

</details>

#### Event Listeners

| Listener Type                  | Description                |
| ------------------------------ | -------------------------- |
| `addEventListener`             | General NFC events         |
| `addErrorListener`             | NFC error events           |
| `addSuccessListener`           | Authentication success     |
| `addAttributesSuccessListener` | Successful attribute reads |

#### Example Usage

```typescript
import { CieManager } from '@pagopa/io-react-native-cie';
import { useEffect } from 'react';

// ...

useEffect(() => {
  // Register all event listeners
  const cleanup = [
    CieManager.addEventListener((event) => {
      console.info('NFC Event', event);
    }),
    CieManager.addErrorListener((error) => {
      console.error('NFC Error', error);
    }),
    CieManager.addSuccessListener((url) => {
      console.log('Auth url:', url);
    }),
  ];

  // Cleanup all listeners on unmount
  return () => cleanup.forEach((remove) => remove());
}, []);
```

To remove all listeners at once:

```typescript
CieManager.removeAllListeners();
```

### Alert Messages

**Note:** This feature is iOS-only; Android does not support alert messages.

<img src="https://github.com/user-attachments/assets/eaebf481-f5db-476e-977e-25653606ab8f" width="200" />
<img src="https://github.com/user-attachments/assets/dc7c5a81-954e-43dc-a468-6a2c17620eb1" width="200" />
<img src="https://github.com/user-attachments/assets/f473b67f-c5a5-4954-9e85-f2b414db53f2" width="200" />

Customize the NFC dialog messages using `CieManager.setAlertMessage(key, value)`:

```typescript
CieManager.setAlertMessage(
  'readingInstructions',
  'Hold your iPhone near your CIE card to begin scanning.'
);
```

You can update the currently displayed alert message (for example, during the reading process) using `CieManager.setCurrentAlertMessage(value)`:

```typescript
CieManager.setCurrentAlertMessage('Reading in progress, 80% completed');
```

#### Available Alert Messages

| Key                    | Description              | Default Message                                                                                   |
| ---------------------- | ------------------------ | ------------------------------------------------------------------------------------------------- |
| `readingInstructions`  | Pre-scan instructions    | "Tieni la tua carta d'identità elettronica sul retro dell'iPhone, nella parte in alto."           |
| `moreTags`             | Multiple tags detected   | "Sono stati individuate più carte NFC. Per favore avvicina una carta alla volta."                 |
| `readingInProgress`    | Reading status           | "Lettura in corso, tieni ferma la carta ancora per qualche secondo..."                            |
| `readingSuccess`       | Success message          | "Lettura avvenuta con successo. Puoi rimuovere la carta mentre completiamo la verifica dei dati." |
| `invalidCard`          | Invalid card error       | "La carta utilizzata non sembra essere una Carta di Identità Elettronica (CIE)."                  |
| `tagLost`              | Card removed error       | "Hai rimosso la carta troppo presto."                                                             |
| `cardLocked`           | Card locked error        | "Carta CIE bloccata"                                                                              |
| `wrongPin1AttemptLeft` | PIN warning (1 attempt)  | "PIN errato, hai ancora 1 tentativo"                                                              |
| `wrongPin2AttemptLeft` | PIN warning (2 attempts) | "PIN errato, hai ancora 2 tentativi"                                                              |
| `genericError`         | Generic error            | "Qualcosa è andato storto"                                                                        |

## Types

```typescript
type CieAttributes = {
  type: string;
  base64: string;
};
```

Contains the CIE type (NFC manufacturer) and the attributres in base64 encoded string format.
CIE type can be one of the following: `NXP`, `GEMALTO`, `GEMALTO_2`, `ACTALIS`, `ST`, `UNKNOWN`

```typescript
type NfcEvent = {
  name: string;
  progress: number;
};
```

Event sent during the CIE reading process. Contains the name of the event and the progress associated. Event names and order may vary based on the platform.

```typescript
type NfcError = {
  name: string;
  message?: string;
};
```

Error event that may be sent during the CIE reading process. Contains the name of the error and an optional message. Error names and order may vary based on the platform.

## Errors

The CIE reading function may throw exceptions if the reading process cannot be initiated. These exceptions indicate issues with input validation or system compatibility.
Below is a comprehensive list of possible exceptions that may be thrown during initialization:

| Error Code            | Platform    | Description        |
| --------------------- | ----------- | ------------------ |
| `PIN_REGEX_NOT_VALID` | Android     | Invalid PIN format |
| `THREADING_ERROR`     | iOS         | Unexpected error   |
| `UNKNOWN_EXCEPTION`   | iOS/Android | Unexpected error   |

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
