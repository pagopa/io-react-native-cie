import { z } from 'zod';

/**
 * Represent the log mode for the CIE SDK
 *
 * - `localFile`: Logs are saved to a local file on the device for later retrieval.
 * - `console`: Logs are output to the console for real-time monitoring.
 * - `disabled`: Disables all logging
 *
 * **Note**: Logging is only supported on iOS. On Android, setting the log mode will throw an error.
 */
export const LogMode = z.enum(['localFile', 'console', 'disabled']);

export type LogMode = z.infer<typeof LogMode>;
