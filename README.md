# @pagopa/io-react-native-cie

Module to handle CIE (Electronic Identity Card) operations natively in React Native apps.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Check NFC Status](#check-nfc-status)
  - [Read CIE Attributes](#read-cie-attributes)
  - [Start CIE Authentication](#start-cie-authentication)
- [Types](#types)
- [Error Codes](#error-codes)
- [Contributing](#contributing)
- [License](#license)

## Installation

```sh
npm install @pagopa/io-react-native-cie
# or
yarn add @pagopa/io-react-native-cie
```

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

### Read CIE Attributes

```typescript
import { CieManager } from '@pagopa/io-react-native-cie';

// Start listening for NFC events
CieManager.addEventListener((event) => {
  console.info('NFC Event', event);
});
// Start listening for NFC error events
CieManager.addErrorListener((error) => {
  console.info('NFC Error', error);
});
// Start listening for attribute read success
CieManager.addAttributesSuccessListener((attributes) => {
  console.log('CIE type:', attributes.type);
});

// Start reading CIE attributes
CieManager.startReadingAttributes().then(() => {
  console.log('Attribute reading started');
});

// Stop reading when finished
CieManager.stopReading().then(() => {
  console.log('Attribute reading stopped');
});
```

### Start CIE Authentication

```typescript
import { CieManager } from '@pagopa/io-react-native-cie';

// Start listening for NFC events
CieManager.addEventListener((event) => {
  console.info('NFC Event', event);
});
// Start listening for NFC error events
CieManager.addErrorListener((error) => {
  console.info('NFC Error', error);
});
// Start listening for authentication success
CieManager.addSuccessListener((url) => {
  console.log('Authentication URL:', url);
});

// Start reading CIE for authentication
CieManager.startReading().then(() => {
  console.log('Authentication started');
});

// Stop reading when finished
CieManager.stopReading().then(() => {
  console.log('Authentication stopped');
});
```

## Types

### `CieAttributes`

Object containing the base64-encoded CIE attributes and the NFC chip type (manufacturer):

```typescript
type CieAttributes = {
  type: CieType;
  base64: string;
};
```

### `CieType`

Possible values for the NFC chip manufacturer:

| Name      |
| --------- |
| NXP       |
| GEMALTO   |
| GEMALTO_2 |
| ACTALIS   |
| ST        |
| UNKNOWN   |

### `NfcEvent`

Event emitted during the CIE reading process. Contains the event name and the associated reading progress value.

```typescript
type NfcEvent = {
  name: NfcEventName;
  progress: number;
};
```

### `NfcEventName`

List of all events emitted during the CIE reading process:

| Name                          |
| ----------------------------- |
| ON_TAG_DISCOVERED             |
| ON_TAG_DISCOVERED_NOT_CIE     |
| CONNECTED                     |
| SELECT_IAS_SERVICE_ID         |
| SELECT_CIE_SERVICE_ID         |
| SELECT_READ_FILE_SERVICE_ID   |
| READ_FILE_SERVICE_ID_RESPONSE |
| SELECT_IAS                    |
| SELECT_CIE                    |
| DH_INIT_GET_G                 |
| DH_INIT_GET_P                 |
| DH_INIT_GET_Q                 |
| SELECT_ROOT                   |
| SELECT_FOR_READ_FILE          |
| READ_FILE                     |
| INIT_EXTERNAL_AUTHENTICATION  |
| SET_MSE                       |
| D_H_KEY_EXCHANGE_GET_DATA     |
| SIGN1_SELECT                  |
| SIGN1_VERIFY_CERT             |
| SET_CHALLENGE_RESPONSE        |
| GET_CHALLENGE_RESPONSE        |
| EXTERNAL_AUTHENTICATION       |
| INTERNAL_AUTHENTICATION       |
| GIVE_RANDOM                   |
| VERIFY_PIN                    |
| READ_FILE_SM                  |
| SIGN                          |
| SIGN_WITH_CIPHER              |

### `NfcError`

Error that may be emitted during the CIE reading process. Contains the error name, an optional message, and the number of failed reading attempts (if applicable).

```typescript
type NfcError = {
  name: NfcErrorName;
  message?: string;
  attempts?: number;
};
```

### `NfcErrorName`

List of all possible errors that can be emitted:

| Error Name                   |
| ---------------------------- |
| NOT_A_CIE                    |
| PIN_REGEX_NOT_VALID          |
| PIN_BLOCKED                  |
| WRONG_PIN                    |
| APDU_ERROR                   |
| VERIFY_SM_DATA_OBJECT_LENGTH |
| VERIFY_SM_MAC_LENGTH         |
| VERIFY_SM_NOT_SAME_MAC       |
| NOT_EXPECTED_SM_TAG          |
| CHIP_AUTH_ERROR              |
| EXTENDED_APDU_NOT_SUPPORTED  |
| FAIL_TO_CONNECT_WITH_TAG     |
| TAG_LOST                     |
| STOP_NFC_ERROR               |
| SELECT_ROOT_EXCEPTION        |
| GENERAL_EXCEPTION            |
| ASN_1_NOT_RIGHT_LENGTH       |
| ASN_1_NOT_VALID              |

## Error Codes

|         Type          |  Platform   | Description                             |
| :-------------------: | :---------: | --------------------------------------- |
| `PIN_REGEX_NOT_VALID` | iOS/Android | Card PIN does not match accepted format |
|  `UNKNOWN_EXCEPTION`  | iOS/Android | Unexpected error                        |

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
