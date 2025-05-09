[![npm version](https://img.shields.io/npm/v/@pagopa/io-react-native-cie.svg)](https://www.npmjs.com/package/@pagopa/io-react-native-cie) [![MIT License](https://img.shields.io/github/license/pagopa/io-react-native-cie)](LICENSE)

# @pagopa/io-react-native-cie

Module to handle CIE (Electronic Identity Card) operations natively in React Native apps.

## Table of Contents

- [Installation](#installation)
- [Example App](#example-app)
- [Usage](#usage)
  - [Check NFC Status](#check-nfc-status)
  - [Listening for events](#listening-for-events)
  - [Update alert messages (iOS Only)](#update-alert-messages-ios-only)
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

### Listening for events

This library uses an event-driven approach to deliver information about the CIE reading and authentication process. Events are emitted to notify your application about the progress, success, or failure of NFC operations. You can subscribe to these events using the provided listener methods, and it is important to unsubscribe when the operation is complete or when your component unmounts to avoid memory leaks.

#### How it works

- **Event emission:** As the CIE reading or authentication progresses, the library emits events such as reading progress updates, successful reads, or errors.
- **Event listeners:** You can register callback functions to handle these events using methods like `addEventListener`, `addErrorListener`, `addSuccessListener`, and `addAttributesSuccessListener`.
- **Unsubscribing:** Each listener method returns a function that you should call to remove the listener when it is no longer needed (e.g., in a React component's cleanup function).

#### Example: Listening and unsubscribing

```typescript
import { CieManager } from '@pagopa/io-react-native-cie';
import { useEffect } from 'react';

const useCieEvents = () => {
  useEffect(() => {
    // Listen for NFC events
    const removeEventListener = CieManager.addEventListener((event) => {
      console.info('NFC Event', event);
    });

    // Listen for NFC errors
    const removeErrorListener = CieManager.addErrorListener((error) => {
      console.error('NFC Error', error);
    });

    // Listen for successful attribute reads
    const removeAttributesSuccessListener =
      CieManager.addAttributesSuccessListener((attributes) => {
        console.log('CIE Attributes:', attributes);
      });

    // Cleanup: unsubscribe from all events when the component unmounts
    return () => {
      removeEventListener();
      removeErrorListener();
      removeAttributesSuccessListener();
    };
  }, []);
};
```

You can use similar patterns for authentication events with `addSuccessListener`. Always ensure you unsubscribe from listeners to prevent memory leaks and unintended side effects.

#### Removing all listeners

If you need to remove all event listeners at once (for example, during a global cleanup or when resetting the NFC state), you can use the `CieManager.removeAllListeners()` method. This is useful when you want to ensure that no event handlers remain active, especially in scenarios where multiple listeners may have been registered.

```typescript
import { CieManager } from '@pagopa/io-react-native-cie';

// Remove all event listeners
CieManager.removeAllListeners();
```

Use this method with caution, as it will remove all registered listeners for all event types. In most cases, prefer removing only the listeners you have registered, but `removeAllListeners` can be helpful for global teardown or debugging situations.

### Update alert messages (iOS only)

On iOS, when performing NFC operations, the system presents a modal dialog to the user to guide them through the NFC reading process. This dialog can display custom alert messages to provide clear instructions, feedback, or error information during the CIE (Electronic Identity Card) reading and authentication process.

You can update these alert messages at runtime using the `CieManager.setAlertMessage(key, value)` method. This allows you to tailor the dialog content to your application's context or localization needs. **Note:** This feature is only available on iOS; on Android, alert messages are not supported and calling this method has no effect.

#### Usage Example

```typescript
import { CieManager } from '@pagopa/io-react-native-cie';

// Set a custom instruction message for the NFC dialog
CieManager.setAlertMessage(
  'readingInstructions',
  'Hold your iPhone near your CIE card to begin scanning.'
);
```

#### Available Alert Message Keys

The following keys can be used to customize specific messages shown in the iOS NFC dialog:

| Key                    | Description                                                                   |
| ---------------------- | ----------------------------------------------------------------------------- |
| `readingInstructions`  | Instructions shown before scanning starts (e.g., how to position the card).   |
| `moreTags`             | Prompt shown when multiple NFC tags are detected; asks user to remove extras. |
| `readingInProgress`    | Message shown while the card is being read.                                   |
| `readingSuccess`       | Message shown when the card has been read successfully.                       |
| `invalidCard`          | Error shown if the detected card is not valid or not supported.               |
| `tagLost`              | Error shown if the card is removed or lost during reading.                    |
| `cardLocked`           | Error shown if the card is locked (e.g., after too many wrong PIN attempts).  |
| `wrongPin1AttemptLeft` | Warning shown after a wrong PIN, with 1 attempt left.                         |
| `wrongPin2AttemptLeft` | Warning shown after a wrong PIN, with 2 attempts left.                        |
| `genericError`         | Generic error message for unexpected failures.                                |

These keys map to different stages and error conditions in the NFC reading process. Setting them appropriately ensures users receive clear, actionable feedback throughout the CIE operation.

### Read CIE Attributes

CIE attributes are key data stored on the Electronic Identity Card (CIE), such as the card type and a base64-encoded string of attributes.

Use `startReadingAttributes(timeout?)` to begin reading. The optional `timeout` parameter (in milliseconds, default: 10000) controls how long the operation will wait. If the process fails to start (e.g., NFC unavailable), it throws an error.

#### Example

```typescript
import { CieManager } from '@pagopa/io-react-native-cie';

const removeAttributesSuccessListener = CieManager.addAttributesSuccessListener(
  (attributes) => {
    console.log('CIE type:', attributes.type);
    console.log('CIE base64:', attributes.base64);
  }
);

// Start with default timeout
CieManager.startReadingAttributes()
  .then(() => {
    console.log('Attribute reading started');
  })
  .catch((error) => {
    console.error('Error starting attribute reading:', error);
  });

// When done, remove the listener
// removeAttributesSuccessListener();
```

### Start CIE Authentication

To start the CIE reading and authentication process, use `startReading(pin, authenticationUrl, timeout?)`. This function requires the CIE card PIN, the authentication service URL, and an optional timeout in milliseconds (default: 10000). It returns a Promise and throws if the process fails to start (e.g., invalid PIN format/length, NFC unavailable).

#### Example

```typescript
import { CieManager } from '@pagopa/io-react-native-cie';

// Listen for authentication success
const removeSuccessListener = CieManager.addSuccessListener((url) => {
  console.log('Authentication URL:', url);
});

// Start authentication with default timeout
CieManager.startReading('12345678', 'https://idserver.example.com/auth')
  .then(() => {
    console.log('Authentication started');
  })
  .catch((error) => {
    console.error('Error starting authentication:', error);
  });

// When done, remove the listener
// removeSuccessListener();
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
