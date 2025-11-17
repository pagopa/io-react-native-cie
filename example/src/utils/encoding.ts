import type { ResultEncoding } from '@pagopa/io-react-native-cie';

const toBase64 = (decoded: string): string => {
  // Convert string to UTF-8 bytes, then to base64
  if (typeof btoa === 'function') {
    // The btoa function in JavaScript environments expects a "byte string",
    // where each character's code point is in the 0-255 range.
    // A direct call to btoa() on a string containing multi-byte Unicode characters
    // (like '€') will throw an "InvalidCharacterError".
    //
    // This encode/decode chain is a robust trick to solve this:
    // 1. `encodeURIComponent(challenge)`: Converts the string into its UTF-8
    //    percent-encoded representation (e.g., '€' becomes '%E2%82%AC').
    // 2. `decodeURIComponent(...)`: Reinterprets the percent-encoded sequences
    //    back into a string where each character's code point represents a single
    //    byte of the original UTF-8 sequence. This creates a "byte string"
    //    that is safe for btoa to consume.
    return btoa(decodeURIComponent(encodeURIComponent(decoded)));
  }
  // Fallback for environments without btoa
  throw new Error('Base64 encoding not supported in this environment');
};

/**
 * Encodes a given challenge string into the specified encoding format.
 *
 * @param challenge - The input string to be encoded.
 * @param encoding - The encoding format to use: either 'base64', 'base64url' or 'hex'.
 * @returns The encoded string in the specified format.
 */
export function encodeChallenge(
  challenge: string,
  encoding: ResultEncoding
): string {
  switch (encoding) {
    case 'base64url':
      return toBase64(challenge).replace(/\+/g, '-').replace(/\//g, '_');
    case 'base64': {
      return toBase64(challenge);
    }
    case 'hex': {
      // Hex encoding
      let hex = '';
      for (let i = 0; i < challenge.length; i++) {
        hex += challenge
          .charCodeAt(i)
          .toString(16)
          .padStart(2, '0')
          .toUpperCase();
      }
      return hex;
    }
  }
}
