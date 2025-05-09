import { z } from 'zod';

/**
 * Represent the type of the CIE, which is associated to the chip manufacturer
 */
export const CieType = z.enum([
  'NXP',
  'GEMALTO',
  'GEMALTO_2',
  'ACTALIS',
  'ST',
  'UNKNOWN',
]);

export type CieType = z.infer<typeof CieType>;

/**
 * Represent the name of the event emitted during the CIE reading process
 */
export const NfcEventName = z.enum([
  'ON_TAG_DISCOVERED',
  'ON_TAG_DISCOVERED_NOT_CIE',
  'CONNECTED',
  'SELECT_IAS_SERVICE_ID',
  'SELECT_CIE_SERVICE_ID',
  'SELECT_READ_FILE_SERVICE_ID',
  'READ_FILE_SERVICE_ID_RESPONSE',
  'SELECT_IAS',
  'SELECT_CIE',
  'DH_INIT_GET_G',
  'DH_INIT_GET_P',
  'DH_INIT_GET_Q',
  'SELECT_FOR_READ_FILE',
  'READ_FILE',
  'INIT_EXTERNAL_AUTHENTICATION',
  'SET_MSE',
  'D_H_KEY_EXCHANGE_GET_DATA',
  'SIGN1_SELECT',
  'SIGN1_VERIFY_CERT',
  'SET_CHALLENGE_RESPONSE',
  'GET_CHALLENGE_RESPONSE',
  'EXTERNAL_AUTHENTICATION',
  'INTERNAL_AUTHENTICATION',
  'GIVE_RANDOM',
  'VERIFY_PIN',
  'READ_FILE_SM',
  'SIGN',
  'SIGN_WITH_CIPHER',
  'SELECT_ROOT',
]);

export type NfcEventName = z.infer<typeof NfcEventName>;

/**
 * Represent the name of the error that may occur during the CIE reading process
 */
export const NfcErrorName = z.enum([
  'NOT_A_CIE',
  'PIN_REGEX_NOT_VALID',
  'PIN_BLOCKED',
  'WRONG_PIN',
  'APDU_ERROR',
  'VERIFY_SM_DATA_OBJECT_LENGTH',
  'VERIFY_SM_MAC_LENGTH',
  'VERIFY_SM_NOT_SAME_MAC',
  'NOT_EXPECTED_SM_TAG',
  'CHIP_AUTH_ERROR',
  'EXTENDED_APDU_NOT_SUPPORTED',
  'FAIL_TO_CONNECT_WITH_TAG',
  'TAG_LOST',
  'STOP_NFC_ERROR',
  'SELECT_ROOT_EXCEPTION',
  'GENERAL_EXCEPTION',
  'ASN_1_NOT_RIGHT_LENGTH',
  'ASN_1_NOT_VALID',
]);

export type NfcErrorName = z.infer<typeof NfcErrorName>;

/**
 * Represent the key of the alert message that can be set during the CIE reading process
 *
 * **Note**: Alert messages are only available on iOS
 */
export const AlertMessageKey = z.enum([
  'readingInstructions',
  'moreTags',
  'readingInProgress',
  'readingSuccess',
  'invalidCard',
  'tagLost',
  'cardLocked',
  'wrongPin1AttemptLeft',
  'wrongPin2AttemptLeft',
  'genericError',
]);

export type AlertMessageKey = z.infer<typeof AlertMessageKey>;

/**
 * Event emitted during the CIE reading process.
 * It contains the name of the event and the progress of the reading up to that point
 */
export const NfcEvent = z.object({
  name: NfcEventName,
  progress: z.coerce.number(),
});

export type NfcEvent = z.infer<typeof NfcEvent>;

/**
 * Represent an NFC error emitted during the CIE reading process
 * It contains the name of the error, the message and the number of attempts
 */
export const NfcError = z.object({
  name: NfcErrorName,
  message: z.string().optional(),
  attempts: z.coerce.number().optional(),
});

export type NfcError = z.infer<typeof NfcError>;

/**
 * Represent the CIE attributes containing the CIE type
 */
export const CieAttributes = z.object({
  type: CieType,
  base64: z.string(),
});

export type CieAttributes = z.infer<typeof CieAttributes>;

/**
 * Events handler that can be used to handle the NFC events and errors during the
 * CIE reading process
 */
export type NfcEventHandler = (event: NfcEvent) => void;

/**
 * Events handler that can be used to handle the NFC errors during the CIE reading process
 */
export type NfcErrorHandler = (error: NfcError) => void;

/**
 * Events handler that can be used to handle the CIE attributes during the reading process
 */
export type AttributesSuccessHandler = (attributes: CieAttributes) => void;

/**
 * Events handler that can be used to handle the success of the CIE reading process
 */
export type SuccessHandler = (uri: string) => void;
