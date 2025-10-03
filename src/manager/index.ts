import { NativeEventEmitter } from 'react-native';
import { IoReactNativeCie } from '../native';
import { AlertMessageKey, type CieEvent, type CieEventHandlers } from './types';
import { getDefaultIdpUrl } from './utils';

const DEFAULT_TIMEOUT = 10000;

const eventEmitter = new NativeEventEmitter(IoReactNativeCie);

/**
 * Adds a listener for a specific CIE event.
 *
 * @param event - The event to listen to {@see CieEvent}
 * @param listener - The listener to add {@see CieEventHandler}
 * @returns Function to remove the listener
 * @example
 * ```typescript
 * const removeListener = CieManager.addListener('onEvent', event => {
 *   console.log(event.name, event.progress);
 * });
 * // ...
 * removeListener();
 */
const addListener = <E extends CieEvent>(
  event: E,
  listener: CieEventHandlers[E]
) => {
  const subscription = eventEmitter.addListener(event, listener);
  return subscription.remove;
};

/**
 * Removes a listener for a specific CIE event.
 *
 * @param event - The event to remove the listener from {@see CieEvent}
 */
const removeListener = (event: CieEvent) => {
  eventEmitter.removeAllListeners(event);
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
  eventEmitter.removeAllListeners('onEvent');
  eventEmitter.removeAllListeners('onError');
  eventEmitter.removeAllListeners('onAttributesSuccess');
  eventEmitter.removeAllListeners('onSuccess');
};

/**
 * Sets a custom Identity Provider (IDP) URL for authentication.
 * If not set or set to undefined, will be used the default IDP URL:
 * - iOS: https://idserver.servizicie.interno.gov.it/idp/Authn/SSL/Login2?
 * - Android: https://idserver.servizicie.interno.gov.it/idp/
 *
 * @param url - The custom IDP URL to use or undefined to use the default IDP URL
 * @example
 * ```typescript
 * CieManager.setCustomIdpUrl('https://custom.idp.com/auth');
 * ```
 */
const setCustomIdpUrl = (url: string | undefined) => {
  IoReactNativeCie.setCustomIdpUrl(url ?? getDefaultIdpUrl());
};

/**
 * Sets an alert message for the CIE reading process.
 *
 * **Note**: Alert messages are only available on iOS
 *
 * @param key - The key of the alert message to set
 * @param value - The value of the alert message to set
 * @example
 * ```typescript
 * CieManager.setAlertMessage('readingInstructions', 'Please scan your CIE card');
 * ```
 */
export const setAlertMessage = (key: AlertMessageKey, value: string) => {
  IoReactNativeCie.setAlertMessage(key, value);
};

/**
 * Updates the current displayed alert message for the CIE reading process.
 *
 * **Note**: Alert messages are only available on iOS
 *
 * @param value - The value of the alert message to set
 * @example
 * ```typescript
 * CieManager.setCurrentAlertMessage('Please scan your CIE card');
 * ```
 */
export const setCurrentAlertMessage = (value: string) => {
  IoReactNativeCie.setCurrentAlertMessage(value);
};

/**
 * Initiates the internal authentication process using the provided challenge and timeout.
 *
 * @param challenge - The challenge string to be used for authentication.
 * @param resultEncoding - The encoding of the result byte arrays, either 'base64' or 'hex' (default: 'base64')
 * @param timeout - Optional timeout in milliseconds (default: 10000) (**Note**: Android only)
 * @returns A promise that resolves when the authentication process has ended.
 */
const startInternalAuthentication = async (
  challenge: string,
  resultEncoding: 'base64' | 'hex' = 'base64',
  timeout: number = DEFAULT_TIMEOUT
): Promise<void> => {
  return IoReactNativeCie.startInternalAuthentication(
    challenge,
    resultEncoding,
    timeout
  );
};

/**
 * Starts the process of reading attributes from the CIE card.
 *
 * @param timeout - Optional timeout in milliseconds (default: 10000) (**Note**: Android only)
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
 * @param timeout - Optional timeout in milliseconds (default: 10000) (**Note**: Android only)
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
 * **Note:** Android only. On iOS the reading process is stopped by closing
 * the system NFC overlay
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
  addListener,
  removeListener,
  removeAllListeners,
  setCustomIdpUrl,
  startReadingAttributes,
  startInternalAuthentication,
  startReading,
  stopReading,
};
