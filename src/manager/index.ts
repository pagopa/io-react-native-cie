import { NativeEventEmitter, NativeModules, Platform } from 'react-native';
import { IoReactNativeCie } from '../native';
import {
  type AttributesSuccessHandler,
  type NfcErrorHandler,
  type NfcEventHandler,
} from './types';

const EVENT_LISTENER_NAME = 'onEvent';
const ERROR_LISTENER_NAME = 'onError';
const ATTRIBUTES_SUCCESS_LISTENER_NAME = 'onAttributesSuccess';
const SUCCESS_LISTENER_NAME = 'onReadSuccess';

const DEFAULT_TIMEOUT = 10000;

const eventHandlers: NfcEventHandler[] = [];
const errorHandlers: NfcErrorHandler[] = [];
const attributesSuccessHandlers: AttributesSuccessHandler[] = [];
const successHandlers: NfcEventHandler[] = [];

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

const addEventListener = (listener: NfcEventHandler) => {
  if (!eventHandlers.includes(listener)) {
    eventHandlers.push(listener);
  }
};

const addErrorListener = (listener: NfcErrorHandler) => {
  if (!errorHandlers.includes(listener)) {
    errorHandlers.push(listener);
  }
};

const addAttributesSuccessListener = (listener: AttributesSuccessHandler) => {
  if (!attributesSuccessHandlers.includes(listener)) {
    attributesSuccessHandlers.push(listener);
  }
};

const addSuccessListener = (listener: NfcEventHandler) => {
  if (!successHandlers.includes(listener)) {
    successHandlers.push(listener);
  }
};

const removeAllListeners = () => {
  eventHandlers.length = 0;
  errorHandlers.length = 0;
  attributesSuccessHandlers.length = 0;
  successHandlers.length = 0;
};

const setCustomIdpUrl = async (url: string) => {
  return IoReactNativeCie.setCustomIdpUrl(url);
};

const startReadingAttributes = async (
  timeout: number = DEFAULT_TIMEOUT
): Promise<void> => {
  return IoReactNativeCie.startReadingAttributes(timeout);
};

const startReading = async (
  pin: string,
  authenticationUrl: string,
  timeout: number = DEFAULT_TIMEOUT
): Promise<void> => {
  return IoReactNativeCie.startReading(pin, authenticationUrl, timeout);
};

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
