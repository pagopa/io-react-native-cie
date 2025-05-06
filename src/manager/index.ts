import { DeviceEventEmitter } from 'react-native';
import { IoReactNativeCie } from '../native';
import type { NfcError } from './types';
import type { NfcEvent } from './types';

type StartReadingAttributesOptions = {
  timeout?: number;
  onError?: (error: any) => void;
  onSuccess?: (data: any) => void;
};

type StartReadingOptions = {
  pin: string;
  url: string;
  timeout?: number;
  onError?: (error: any) => void;
  onSuccess?: (data: any) => void;
};

/**
 * Add an event listener for NFC events
 * @param onEvent - The event handler
 * @returns A subscription object
 */
export const addNfcEventListener = (onEvent: (event: NfcEvent) => void) =>
  DeviceEventEmitter.addListener('onNfcEvent', onEvent);

/**
 * Add an event listener for NFC errors
 * @param onError - The error handler
 * @returns A subscription object
 */
export const addNfcErrorListener = (onError: (error: NfcError) => void) =>
  DeviceEventEmitter.addListener('onNfcError', onError);

export const startReadingAttributes = ({
  timeout = 10000,
  onError = () => {},
  onSuccess = () => {},
}: StartReadingAttributesOptions) => {
  IoReactNativeCie.startReadingAttributes(timeout, onError, onSuccess);
};

export const startReading = ({
  pin,
  url,
  timeout = 10000,
  onError = () => {},
  onSuccess = () => {},
}: StartReadingOptions) => {
  IoReactNativeCie.startReading(pin, url, timeout, onError, onSuccess);
};

export const stopReading = () => {
  IoReactNativeCie.stopReading();
};
