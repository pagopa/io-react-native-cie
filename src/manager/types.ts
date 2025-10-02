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
 */
export const NfcError = z.union([
  z.object({
    name: NfcErrorName.exclude(['WRONG_PIN']),
    message: z.string().optional(),
  }),
  // WRONG_PIN error also contains the number of attempts left
  z.object({
    name: NfcErrorName.extract(['WRONG_PIN']),
    message: z.string().optional(),
    attemptsLeft: z.number(),
  }),
]);

export type NfcError = z.infer<typeof NfcError>;

/**
 * Represent the CIE attributes containing the CIE type
 * All string value are Hex encoded
 */
export const InternalAuthResponseObject = z.object({
  nis: z.string(),
  publicKey: z.string(),
  sod: z.string(),
  signedChallenge: z.string(),
});

export type InternalAuthResponse = z.infer<typeof InternalAuthResponseObject>;

/**
 * Represent the CIE attributes containing the CIE type
 */
export const CieAttributes = z.object({
  type: z.string(),
  base64: z.string(),
});

export type CieAttributes = z.infer<typeof CieAttributes>;

/**
 * Event handler that can be used to handle the CIE events during the reading process
 */
export type CieEventHandlers = {
  onEvent: (event: NfcEvent) => void;
  onError: (error: NfcError) => void;
  onInternalAuthenticationSuccess: (attributes: InternalAuthResponse) => void;
  onAttributesSuccess: (attributes: CieAttributes) => void;
  onSuccess: (uri: string) => void;
};

/**
 * Possible events that can be listened to
 */
export type CieEvent = keyof CieEventHandlers;
