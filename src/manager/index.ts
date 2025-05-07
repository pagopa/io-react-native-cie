import { NativeEventEmitter, NativeModules, Platform } from 'react-native';
import { IoReactNativeCie } from '../native';
import type {
  AttributesSuccessHandler,
  NfcErrorHandler,
  NfcEventHandler,
} from './types';

class CieManager {
  private static readonly EVENT_LISTENER_NAME = 'onEvent';
  private static readonly ERROR_LISTENER_NAME = 'onError';
  private static readonly ATTRIBUTES_SUCCESS_LISTENER_NAME =
    'onAttributesSuccess';
  private static readonly SUCCESS_LISTENER_NAME = 'onReadSuccess';

  private static readonly DEFAULT_TIMEOUT = 10000;

  private _eventHandlers: NfcEventHandler[] = [];
  private _errorHandlers: NfcErrorHandler[] = [];
  private _attributesSuccessHandlers: AttributesSuccessHandler[] = [];
  private _successHandlers: NfcEventHandler[] = [];

  constructor() {
    this._eventHandlers = [];
    this._errorHandlers = [];
    this._attributesSuccessHandlers = [];
    this._successHandlers = [];

    console.log('NativeModules', NativeModules.IoReactNativeCie);

    const eventEmitter =
      Platform.OS === 'android'
        ? new NativeEventEmitter()
        : new NativeEventEmitter(NativeModules.IoReactNativeCie);
    eventEmitter.addListener(CieManager.EVENT_LISTENER_NAME, (event) => {
      this._eventHandlers.forEach((handler) => handler(event));
    });
    eventEmitter.addListener(CieManager.ERROR_LISTENER_NAME, (event) => {
      this._errorHandlers.forEach((handler) => handler(event));
    });
    eventEmitter.addListener(
      CieManager.ATTRIBUTES_SUCCESS_LISTENER_NAME,
      (attributes) => {
        this._attributesSuccessHandlers.forEach((handler) =>
          handler(attributes)
        );
      }
    );
    eventEmitter.addListener(CieManager.SUCCESS_LISTENER_NAME, (attributes) => {
      this._successHandlers.forEach((handler) => handler(attributes));
    });
  }

  addEventListener(listener: NfcEventHandler) {
    if (this._eventHandlers.indexOf(listener) >= 0) {
      return;
    }
    this._eventHandlers = [...this._eventHandlers, listener];
  }

  addErrorListener(listener: NfcErrorHandler) {
    if (this._errorHandlers.indexOf(listener) >= 0) {
      return;
    }
    this._errorHandlers = [...this._errorHandlers, listener];
  }

  addAttributesSuccessListener(listener: AttributesSuccessHandler) {
    if (this._attributesSuccessHandlers.indexOf(listener) >= 0) {
      return;
    }
    this._attributesSuccessHandlers = [
      ...this._attributesSuccessHandlers,
      listener,
    ];
  }

  addSuccessListener(listener: NfcEventHandler) {
    if (this._successHandlers.indexOf(listener) >= 0) {
      return;
    }
    this._successHandlers = [...this._successHandlers, listener];
  }

  setCustomIdpUrl = (url: string) => {
    IoReactNativeCie.setCustomIdpUrl(url);
  };

  removeAllListeners = () => {
    this._eventHandlers.length = 0;
    this._errorHandlers.length = 0;
    this._attributesSuccessHandlers.length = 0;
    this._successHandlers.length = 0;
  };

  startReadingAttributes = async (
    timeout: number = CieManager.DEFAULT_TIMEOUT
  ): Promise<void> => {
    IoReactNativeCie.startReadingAttributes(timeout);
  };

  startReading = async (
    pin: string,
    authenticationUrl: string,
    timeout: number = CieManager.DEFAULT_TIMEOUT
  ): Promise<void> => {
    return IoReactNativeCie.startReading(pin, authenticationUrl, timeout);
  };

  stopReading = async (): Promise<void> => {
    IoReactNativeCie.stopReading();
  };
}

export default new CieManager();
