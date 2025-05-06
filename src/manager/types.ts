export type NfcEvent = {
  name: string;
  progress: number;
};

export type NfcError = {
  name: string;
  numberOfAttempts?: number;
  msg?: string;
};
