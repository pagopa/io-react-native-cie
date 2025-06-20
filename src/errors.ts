/**
 * Error codes returned by the iOS module.
 */
type CieErrorCodesIOS =
  | 'PIN_REGEX_NOT_VALID'
  | 'INVALID_AUTH_URL'
  | 'THREADING_ERROR'
  | 'UNKNOWN_EXCEPTION';

/**
 * Error codes returned by the Android side.
 */
type CieErrorCodesAndroid =
  | 'PIN_REGEX_NOT_VALID'
  | 'INVALID_AUTH_URL'
  | 'UNKNOWN_EXCEPTION';

/**
 * All error codes that the module could return.
 */
export type CieErrorCodes = CieErrorCodesAndroid | CieErrorCodesIOS;

/**
 * Error type returned by a rejected promise.
 *
 * If additional error information are available,
 * they are stored in the {@link CieError["userInfo"]} field.
 */
export type CieError = {
  message: CieErrorCodes;
  userInfo: Record<string, string>;
};
