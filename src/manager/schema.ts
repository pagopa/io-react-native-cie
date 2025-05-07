import { z } from 'zod';

export const CieAttributesSchema = z.object({
  atr: z.string(),
  base64: z.string(),
});

export type CieAttributes = z.infer<typeof CieAttributesSchema>;
