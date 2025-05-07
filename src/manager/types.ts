/**
 * Represent an NFC event emitted during the CIE reading process
 * It contains the name of the event and the progress of the reading up to that point
 */
export type NfcEvent = {
  name: string;
  progress: number;
};

/**
 * Represent an NFC error emitted during the CIE reading process
 * It contains the name of the error, the message and the number of attempts
 */
export type NfcError = {
  name: string;
  message?: string;
  attempts?: number;
};

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

/**
 * Represent the CIE attributues containing the CIE type
 */
export type CieAttributes = {
  atr: string;
  base64: string;
};
