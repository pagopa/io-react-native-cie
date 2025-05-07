import { IoReactNativeCie } from '../native';

/**
 * Checks if the device has NFC hardware capabilities.
 * @returns A promise that resolves to true if the device supports NFC, false otherwise.
 */
export const hasNfcFeature = async () => {
  return IoReactNativeCie.hasNfcFeature();
};

/**
 * Checks if NFC is currently enabled on the device.
 * @returns A promise that resolves to true if NFC is enabled, false otherwise.
 */
export const isNfcEnabled = async () => {
  return IoReactNativeCie.isNfcEnabled();
};

/**
 * Verifies if the device supports CIE (Electronic Identity Card) authentication.
 * @returns A promise that resolves to true if CIE authentication is supported, false otherwise.
 */
export const isCieAuthenticationSupported = async () => {
  return IoReactNativeCie.isCieAuthenticationSupported();
};

/**
 * Opens the device's NFC settings page, allowing users to enable or disable NFC.
 * @returns A promise that resolves when the settings page is opened.
 */
export const openNfcSettings = async () => {
  return IoReactNativeCie.openNfcSettings();
};
