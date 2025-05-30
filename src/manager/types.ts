import { z } from 'zod';

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
 * Event emitted during the CIE reading process with the name of the event and the progress of the reading up to that point.
 * Event names may differ based on the platform.
 */
export const NfcEvent = z.object({
  name: z.string(),
  progress: z.coerce.number(),
});

export type NfcEvent = z.infer<typeof NfcEvent>;

/**
 * Name of the error emitted during the CIE reading process
 */
export const NfcErrorName = z.enum([
  'NOT_A_CIE',
  'TAG_LOST',
  'CANCELLED_BY_USER',
  'APDU_ERROR',
  'WRONG_PIN',
  'CARD_BLOCKED',
  'NO_INTERNET_CONNECTION',
  'CERTIFICATE_EXPIRED',
  'CERTIFICATE_REVOKED',
  'AUTHENTICATION_ERROR',
  'GENERIC_ERROR',
]);

export type NfcErrorName = z.infer<typeof NfcErrorName>;

/**
 * Represent an NFC error emitted during the CIE reading process
 * It contains the name of the error, the message and the number of attempts
 */
export const NfcError = z.object({
  name: NfcErrorName,
  message: z.string().optional(),
});

export type NfcError = z.infer<typeof NfcError>;

/**
 * Represent the CIE attributes containing the CIE type
 */
export const CieAttributes = z.object({
  type: z.string(),
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
