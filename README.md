[![npm version](https://img.shields.io/npm/v/@pagopa/io-react-native-cie.svg)](https://www.npmjs.com/package/@pagopa/io-react-native-cie) [![MIT License](https://img.shields.io/github/license/pagopa/io-react-native-cie)](LICENSE)

# @pagopa/io-react-native-cie

Module to handle CIE (Electronic Identity Card) operations natively in React Native apps.

## Table of Contents

- [Installation](#installation)
- [Example App](#example-app)
- [Usage](#usage)
  - [Check NFC Status](#check-nfc-status)
  - [Event System](#event-system)
  - [iOS Alert Messages](#ios-alert-messages)
  - [Reading CIE Data](#reading-cie-data)
- [Types](#types)
- [Error Handling](#error-handling)
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

### Event System

The library uses an event-driven approach for NFC operations. Events are emitted to notify your application about progress, success, or failure. Each listener method returns a cleanup function that should be called when the operation is complete or when your component unmounts.

#### Available Event Listeners

| Listener Type                  | Description                | Cleanup Method           |
| ------------------------------ | -------------------------- | ------------------------ |
| `addEventListener`             | General NFC events         | Returns cleanup function |
| `addErrorListener`             | NFC error events           | Returns cleanup function |
| `addSuccessListener`           | Authentication success     | Returns cleanup function |
| `addAttributesSuccessListener` | Successful attribute reads | Returns cleanup function |

#### Example Usage

```typescript
import { CieManager } from '@pagopa/io-react-native-cie';
import { useEffect } from 'react';

const useCieEvents = () => {
  useEffect(() => {
    // Register all event listeners
    const cleanup = [
      CieManager.addEventListener((event) => {
        console.info('NFC Event', event);
      }),
      CieManager.addErrorListener((error) => {
        console.error('NFC Error', error);
      }),
      CieManager.addAttributesSuccessListener((attributes) => {
        console.log('CIE Attributes:', attributes);
      }),
    ];

    // Cleanup all listeners on unmount
    return () => cleanup.forEach((remove) => remove());
  }, []);
};
```

To remove all listeners at once:

```typescript
CieManager.removeAllListeners();
```

### iOS Alert Messages

**Note:** This feature is iOS-only; Android does not support alert messages.

Customize the NFC dialog messages using `CieManager.setAlertMessage(key, value)`:

```typescript
CieManager.setAlertMessage(
  'readingInstructions',
  'Hold your iPhone near your CIE card to begin scanning.'
);
```

#### Available Alert Messages

| Key                    | Description              | Default Message                                     |
| ---------------------- | ------------------------ | --------------------------------------------------- |
| `readingInstructions`  | Pre-scan instructions    | "Hold your iPhone near your CIE card"               |
| `moreTags`             | Multiple tags detected   | "Multiple tags detected. Please remove all but one" |
| `readingInProgress`    | Reading status           | "Reading in progress..."                            |
| `readingSuccess`       | Success message          | "Reading completed successfully"                    |
| `invalidCard`          | Invalid card error       | "Invalid or unsupported card"                       |
| `tagLost`              | Card removed error       | "Card removed during reading"                       |
| `cardLocked`           | Card locked error        | "Card is locked"                                    |
| `wrongPin1AttemptLeft` | PIN warning (1 attempt)  | "Wrong PIN. 1 attempt remaining"                    |
| `wrongPin2AttemptLeft` | PIN warning (2 attempts) | "Wrong PIN. 2 attempts remaining"                   |
| `genericError`         | Generic error            | "An error occurred"                                 |

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

## Types

### Core Types

```typescript
type CieAttributes = {
  type: CieType;
  base64: string;
};

type CieType = 'NXP' | 'GEMALTO' | 'GEMALTO_2' | 'ACTALIS' | 'ST' | 'UNKNOWN';

type NfcEvent = {
  name: NfcEventName;
  progress: number;
};

type NfcError = {
  name: string;
  message?: string;
  attempts?: number;
};
```

## Error Handling

### Common Error Codes

| Error Code            | Platform    | Description        | Resolution                                |
| --------------------- | ----------- | ------------------ | ----------------------------------------- |
| `PIN_REGEX_NOT_VALID` | iOS/Android | Invalid PIN format | Ensure PIN matches required format        |
| `UNKNOWN_EXCEPTION`   | iOS/Android | Unexpected error   | Check device compatibility and NFC status |

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
