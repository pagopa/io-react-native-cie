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

const eventEmitter =
  Platform.OS === 'android'
    ? new NativeEventEmitter() // On Android, NativeEventEmitter constructor does not take arguments
    : new NativeEventEmitter(NativeModules.IoReactNativeCie); // On iOS, it requires the native module

/**
 * Adds an event listener for NFC events during CIE operations.
 *
 * @param listener - Callback invoked with NFC event data ({ name: string, progress: number })
 * @returns Function to remove the event listener
 * @example
 * ```typescript
 * const removeListener = CieManager.addEventListener(event => {
 *   console.log(event.name, event.progress);
 * });
 * // ...
 * removeListener();
 * ```
 */
const addEventListener = (listener: NfcEventHandler) => {
  const subscription = eventEmitter.addListener(EVENT_LISTENER_NAME, listener);
  return subscription.remove;
};

/**
 * Adds an error listener for NFC/CIE operations.
 *
 * @param listener - Callback invoked with error data ({ code: string, message: string })
 * @returns Function to remove the error listener
 * @example
 * ```typescript
 * const removeError = CieManager.addErrorListener(error => {
 *   console.error(error.code, error.message);
 * });
 * // ...
 * removeError();
 * ```
 */
const addErrorListener = (listener: NfcErrorHandler) => {
  const subscription = eventEmitter.addListener(ERROR_LISTENER_NAME, listener);
  return subscription.remove;
};

/**
 * Adds a listener for successful attribute reading from the CIE card.
 *
 * @param listener - Callback invoked with the attributes object
 * @returns Function to remove the attributes success listener
 * @example
 * ```typescript
 * const removeAttr = CieManager.addAttributesSuccessListener(attrs => {
 *   console.log(attrs);
 * });
 * // ...
 * removeAttr();
 * ```
 */
const addAttributesSuccessListener = (listener: AttributesSuccessHandler) => {
  const subscription = eventEmitter.addListener(
    ATTRIBUTES_SUCCESS_LISTENER_NAME,
    listener
  );
  return subscription.remove;
};

/**
 * Adds a listener for successful CIE reading/authentication.
 *
 * @param listener - Callback invoked with authentication result data
 * @returns Function to remove the success listener
 * @example
 * ```typescript
 * const removeSuccess = CieManager.addSuccessListener(result => {
 *   console.log(result);
 * });
 * // ...
 * removeSuccess();
 * ```
 */
const addSuccessListener = (listener: SuccessHandler) => {
  const subscription = eventEmitter.addListener(
    SUCCESS_LISTENER_NAME,
    listener
  );
  return subscription.remove;
};

/**
 * Removes all registered event, error, and success listeners for CIE operations.
 *
 * @example
 * ```typescript
 * CieManager.removeAllListeners();
 * ```
 */
const removeAllListeners = () => {
  eventEmitter.removeAllListeners(EVENT_LISTENER_NAME);
  eventEmitter.removeAllListeners(ERROR_LISTENER_NAME);
  eventEmitter.removeAllListeners(ATTRIBUTES_SUCCESS_LISTENER_NAME);
  eventEmitter.removeAllListeners(SUCCESS_LISTENER_NAME);
};

/**
 * Sets a custom Identity Provider (IDP) URL for authentication.
 *
 * @param url - The custom IDP URL to use
 * @example
 * ```typescript
 * CieManager.setCustomIdpUrl('https://custom.idp.com/auth');
 * ```
 */
const setCustomIdpUrl = (url: string) => {
  return IoReactNativeCie.setCustomIdpUrl(url);
};

/**
 * Starts the process of reading attributes from the CIE card.
 *
 * @param timeout - Optional timeout in milliseconds (default: 10000)
 * @returns Promise<void>
 * @throws {CieError} If reading attributes fails
 * @example
 * ```typescript
 * await CieManager.startReadingAttributes();
 * // or with custom timeout
 * await CieManager.startReadingAttributes(15000);
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
 * @param pin - The CIE card PIN code
 * @param authenticationUrl - The authentication service URL
 * @param timeout - Optional timeout in milliseconds (default: 10000)
 * @returns Promise<void>
 * @throws {CieError} If could not start reading for authentication
 * @example
 * ```typescript
 * await CieManager.startReading('12345678', 'https://idserver.example.com/auth');
 * // or with custom timeout
 * await CieManager.startReading('12345678', 'https://idserver.example.com/auth', 20000);
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
 *
 * @returns Promise<void>
 * @example
 * ```typescript
 * await CieManager.stopReading();
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
