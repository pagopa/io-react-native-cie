import { NativeEventEmitter } from 'react-native';
import { IoReactNativeCie } from '../native';
import {
  AlertMessageKey,
  type CieEvent,
  type CieEventHandlers,
  type ResultEncoding,
} from './types';
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
 * @param resultEncoding - The encoding of the result byte arrays, either 'base64', 'base64url' or 'hex' (default: 'base64')
 * @param timeout - Optional timeout in milliseconds (default: 10000) (**Note**: Android only)
 * @returns A promise that resolves when the authentication process has ended.
 */
const startInternalAuthentication = async (
  challenge: string,
  resultEncoding: ResultEncoding = 'base64',
  timeout: number = DEFAULT_TIMEOUT
): Promise<void> => {
  return IoReactNativeCie.startInternalAuthentication(
    challenge,
    resultEncoding,
    timeout
  );
};

/**
 * Initiates a PACE (Password Authenticated Connection Establishment) reading
 * session on a CIE (Carta d'Identità Elettronica) using the provided CAN (Card
 * Access Number) to read the MRTD information.
 *
 * The operation is asynchronous; Since the Promise resolves
 * with `void`, any resulting data or errors are expected to be surfaced through
 * native events.
 *
 * @param can The 6‑digit Card Access Number printed on the CIE, used to
 *            bootstrap the PACE secure messaging protocol. Must be a numeric
 *            string; validation (if any) occurs in the native layer.
 * @param resultEncoding The encoding format expected for any binary payloads
 *                       produced during the reading process. Defaults to
 *                       `'base64'`. Use `'hex'` if downstream consumers require
 *                       hexadecimal representation.
 * @param timeout Maximum time (in milliseconds) allowed for the PACE reading
 *                session before it is aborted. Defaults to `DEFAULT_TIMEOUT`.
 *                A larger value may be required on older devices or in
 *                environments with slower NFC interactions.
 *
 * @returns Promise that resolves when the reading process has started.
 *
 * @throws May reject with:
 * - Invalid input (e.g., malformed CAN).
 * - NFC subsystem unavailable or disabled.
 * - Operation timeout exceeded.
 * - Native module internal errors.
 *
 * @example
 * await startPaceReading("123456"); // Uses base64 encoding and default timeout.
 *
 * @example
 * await startPaceReading("654321", "hex", 15000);
 *
 * @remarks
 * Ensure NFC is enabled and the user has positioned the CIE correctly before
 * calling this function to minimize timeouts and improve reliability.
 *
 * Once the MRTD reading with PACE flow has been initiated, a Promise resolves,
 * while when the reading process produces data, the `'onSuccess'` event has been called.
 * The `'onError'` event is called if an error occurs during the reading process.
 * The `'onEvent'` event is called to provide progress updates.
 */
const startMRTDReading = async (
  can: string,
  resultEncoding: ResultEncoding = 'base64',
  timeout: number = DEFAULT_TIMEOUT
): Promise<void> => {
  return IoReactNativeCie.startMRTDReading(can, resultEncoding, timeout);
};

/**
 * Initiates a combined reading session on a CIE (Carta d'Identità Elettronica)
 * that performs both Internal Authentication and MRTD reading using PACE.
 *
 * The operation is asynchronous; Since the Promise resolves
 * with `void`, any resulting data or errors are expected to be surfaced through
 * native events.
 *
 * @param can The 6‑digit Card Access Number printed on the CIE, used to
 *            bootstrap the PACE secure messaging protocol. Must be a numeric
 *            string; validation (if any) occurs in the native layer.
 * @param challenge The challenge string to be used for Internal Authentication.
 * @param resultEncoding The encoding format expected for any binary payloads
 *                       produced during the reading process. Defaults to
 *                       `'base64'`. Use `'hex'` if downstream consumers require
 *                       hexadecimal representation.
 * @param timeout Maximum time (in milliseconds) allowed for the combined reading
 *                session before it is aborted. Defaults to `DEFAULT_TIMEOUT`.
 *                A larger value may be required on older devices or in
 *                environments with slower NFC interactions.
 *
 * @returns Promise that resolves when the reading process has started.
 *
 * @throws May reject with:
 * - Invalid input (e.g., malformed CAN or challenge).
 * - NFC subsystem unavailable or disabled.
 * - Operation timeout exceeded.
 * - Native module internal errors.
 *
 * @example
 * await startInternalAuthAndMRTDReading("123456", "challengeString");
 *
 * @example
 * await startInternalAuthAndMRTDReading("654321", "challengeString", "hex", 15000);
 *
 * @remarks
 * Ensure NFC is enabled and the user has positioned the CIE correctly before
 * calling this function to minimize timeouts and improve reliability.
 *
 * Once the Internal Authentication and MRTD reading with PACE flow has been initiated,
 * a Promise resolves, while when the reading process produces data,
 * the `'onSuccess'` event has been called.
 * The `'onError'` event is called if an error occurs during the reading process.
 * The `'onEvent'` event is called to provide progress updates.
 */
const startInternalAuthAndMRTDReading = async (
  can: string,
  challenge: string,
  resultEncoding: ResultEncoding = 'base64',
  timeout: number = DEFAULT_TIMEOUT
): Promise<void> => {
  return IoReactNativeCie.startInternalAuthAndMRTDReading(
    can,
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
const startReadingCertificate = async (
  pin: string,
  timeout: number = DEFAULT_TIMEOUT
): Promise<void> => {
  return IoReactNativeCie.startReadingCertificate(pin, timeout);
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
  startMRTDReading,
  startInternalAuthAndMRTDReading,
  startReading,
  startReadingCertificate,
  stopReading,
};
