import { NativeEventEmitter, NativeModules, Platform } from 'react-native';
import { IoReactNativeCie } from '../native';
import {
  type AttributesSuccessHandler,
  type NfcErrorHandler,
  type NfcEventHandler,
  type SuccessHandler,
} from './types';

const EVENT_LISTENER_NAME = 'onEvent';
const ERROR_LISTENER_NAME = 'onError';
const ATTRIBUTES_SUCCESS_LISTENER_NAME = 'onAttributesSuccess';
const SUCCESS_LISTENER_NAME = 'onReadSuccess';

const DEFAULT_TIMEOUT = 10000;

const eventHandlers: NfcEventHandler[] = [];
const errorHandlers: NfcErrorHandler[] = [];
const attributesSuccessHandlers: AttributesSuccessHandler[] = [];
const successHandlers: SuccessHandler[] = [];

const eventEmitter =
  Platform.OS === 'android'
    ? new NativeEventEmitter() // On Android, NativeEventEmitter constructor does not take arguments
    : new NativeEventEmitter(NativeModules.IoReactNativeCie); // On iOS, it requires the native module

eventEmitter.addListener(EVENT_LISTENER_NAME, (event) => {
  eventHandlers.forEach((handler) => handler(event));
});
eventEmitter.addListener(ERROR_LISTENER_NAME, (event) => {
  errorHandlers.forEach((handler) => handler(event));
});
eventEmitter.addListener(ATTRIBUTES_SUCCESS_LISTENER_NAME, (attributes) => {
  attributesSuccessHandlers.forEach((handler) => handler(attributes));
});
eventEmitter.addListener(SUCCESS_LISTENER_NAME, (attributes) => {
  successHandlers.forEach((handler) => handler(attributes));
});

/**
 * Adds an event listener for NFC events.
 * The listener will be called when an NFC event occurs.
 * @example
 * ```javascript
 * import { CieManager } from '@pagopa/io-react-native-cie';
 *
 * const handleNfcEvent = (event) => {
 *   console.log('NFC Event:', event);
 * };
 *
 * CieManager.addEventListener(handleNfcEvent);
 * ```
 */
const addEventListener = (listener: NfcEventHandler) => {
  if (!eventHandlers.includes(listener)) {
    eventHandlers.push(listener);
  }
};

/**
 * Adds an error listener for NFC operations.
 * The listener will be called when an error occurs during NFC operations.
 * @example
 * ```javascript
 * import { CieManager } from '@pagopa/io-react-native-cie';
 *
 * const handleError = (error) => {
 *   console.error('NFC Error:', error);
 * };
 *
 * CieManager.addErrorListener(handleError);
 * ```
 */
const addErrorListener = (listener: NfcErrorHandler) => {
  if (!errorHandlers.includes(listener)) {
    errorHandlers.push(listener);
  }
};

/**
 * Adds a listener for successful attribute reading.
 * The listener will be called when attributes are successfully read from the CIE.
 * @example
 * ```javascript
 * import { CieManager } from '@pagopa/io-react-native-cie';
 *
 * const handleAttributesSuccess = (attributes) => {
 *   console.log('Attributes Read Successfully:', attributes);
 * };
 *
 * CieManager.addAttributesSuccessListener(handleAttributesSuccess);
 * ```
 */
const addAttributesSuccessListener = (listener: AttributesSuccessHandler) => {
  if (!attributesSuccessHandlers.includes(listener)) {
    attributesSuccessHandlers.push(listener);
  }
};

/**
 * Adds a listener for successful CIE reading (authentication).
 * The listener will be called when the CIE reading and authentication process is successful.
 * @example
 * ```javascript
 * import { CieManager } from '@pagopa/io-react-native-cie';
 *
 * const handleCieReadSuccess = (result) => {
 *   console.log('CIE Read Successfully:', result);
 * };
 *
 * CieManager.addSuccessListener(handleCieReadSuccess);
 * ```
 */
const addSuccessListener = (listener: SuccessHandler) => {
  if (!successHandlers.includes(listener)) {
    successHandlers.push(listener);
  }
};

/**
 * Removes all registered event, error, attributes success, and CIE success listeners.
 * @example
 * ```javascript
 * import { CieManager } from '@pagopa/io-react-native-cie';
 *
 * CieManager.removeAllListeners();
 * ```
 */
const removeAllListeners = () => {
  eventHandlers.length = 0;
  errorHandlers.length = 0;
  attributesSuccessHandlers.length = 0;
  successHandlers.length = 0;
};

/**
 * Sets a custom Identity Provider (IDP) URL.
 * This URL is used for the authentication process.
 * @example
 * ```javascript
 * import { CieManager } from '@pagopa/io-react-native-cie';
 *
 * const customUrl = 'https://my.custom.idp.com/auth';
 * CieManager.setCustomIdpUrl(customUrl)
 *   .then(() => console.log('Custom IDP URL set successfully'))
 *   .catch(error => console.error('Error setting custom IDP URL:', error));
 * ```
 */
const setCustomIdpUrl = async (url: string) => {
  return IoReactNativeCie.setCustomIdpUrl(url);
};

/**
 * Starts the process of reading attributes from the CIE card.
 *
 * @param timeout - Optional timeout in milliseconds for the reading process. Defaults to 10000ms.
 * @throws {CieError} If cannot start reading attributes.
 * @example
 * ```javascript
 * import { CieManager } from '@pagopa/io-react-native-cie';
 *
 * CieManager.addAttributesSuccessListener(attributes => {
 *   console.log('CIE Attributes:', attributes);
 * });
 *
 * CieManager.addErrorListener(error => {
 *  console.error('Error reading attributes:', error);
 * });
 *
 * CieManager.startReadingAttributes()
 *   .then(() => console.log('Started reading attributes...'))
 *   .catch(error => console.error('Failed to start reading attributes:', error));
 *
 * // To start with a custom timeout:
 * // CieManager.startReadingAttributes(15000)
 * //  .then(() => console.log('Started reading attributes with 15s timeout...'))
 * //  .catch(error => console.error('Failed to start reading attributes:', error));
 * ```
 */
const startReadingAttributes = async (
  timeout: number = DEFAULT_TIMEOUT
): Promise<void> => {
  return IoReactNativeCie.startReadingAttributes(timeout);
};

/**
 * Starts the CIE reading and authentication process.
 *
 * @param pin - The PIN code for the CIE card.
 * @param authenticationUrl - The URL for the authentication service.
 * @param timeout - Optional timeout in milliseconds for the reading process. Defaults to 10000ms.
 * @throws {CieError} If cannot start reading.
 * @example
 * ```javascript
 * import { CieManager } from '@pagopa/io-react-native-cie';
 *
 * CieManager.addSuccessListener(result => {
 *   console.log('CIE Authentication Success:', result);
 * });
 *
 * CieManager.addErrorListener(error => {
 *  console.error('Error during CIE reading/authentication:', error);
 * });
 *
 * const userPin = '12345678'; // Replace with the actual user PIN
 * const authUrl = 'https://idserver.example.com/auth'; // Replace with your authentication URL
 *
 * CieManager.startReading(userPin, authUrl)
 *   .then(() => console.log('CIE reading process started...'))
 *   .catch(error => console.error('Failed to start CIE reading process:', error));
 *
 * // To start with a custom timeout:
 * // CieManager.startReading(userPin, authUrl, 20000)
 * //  .then(() => console.log('CIE reading process started with 20s timeout...'))
 * //  .catch(error => console.error('Failed to start CIE reading process:', error));
 * ```
 */
const startReading = async (
  pin: string,
  authenticationUrl: string,
  timeout: number = DEFAULT_TIMEOUT
): Promise<void> => {
  return IoReactNativeCie.startReading(pin, authenticationUrl, timeout);
};

/**
 * Stops any ongoing CIE reading process.
 * @example
 * ```javascript
 * import { CieManager } from '@pagopa/io-react-native-cie';
 *
 * CieManager.stopReading()
 *   .then(() => console.log('CIE reading stopped successfully'))
 *   .catch(error => console.error('Error stopping CIE reading:', error));
 * ```
 */
const stopReading = async (): Promise<void> => {
  return IoReactNativeCie.stopReading();
};

export {
  addEventListener,
  addErrorListener,
  addAttributesSuccessListener,
  addSuccessListener,
  setCustomIdpUrl,
  removeAllListeners,
  startReadingAttributes,
  startReading,
  stopReading,
};
