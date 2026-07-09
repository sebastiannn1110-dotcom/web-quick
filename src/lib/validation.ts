import { z } from "zod";
import { allowedBomTypes, maxBomFileSize } from "./constants";

const safeText = (min = 1, max = 2000) =>
  z
    .string()
    .trim()
    .min(min)
    .max(max)
    .transform((value) => value.replace(/[<>]/g, ""));

const optionalText = (max = 200) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => value.replace(/[<>]/g, ""))
    .optional()
    .or(z.literal(""));

export const contactSchema = z.object({
  name: safeText(2, 120),
  company: safeText(2, 160),
  email: z.string().trim().email().max(180),
  phone: optionalText(80),
  country: safeText(2, 100),
  region: safeText(2, 80),
  requestType: safeText(2, 120),
  message: safeText(12, 3000),
  consent: z.coerce.boolean().refine(Boolean),
  website: optionalText(120),
});

export const rfqSchema = z.object({
  company: safeText(2, 160),
  contactName: safeText(2, 120),
  email: z.string().trim().email().max(180),
  phone: optionalText(80),
  country: safeText(2, 100),
  partNumber: safeText(2, 160),
  manufacturer: optionalText(160),
  quantity: z.coerce.number().int().positive().max(100000000),
  targetPrice: optionalText(80),
  requiredDate: optionalText(80),
  notes: optionalText(3000),
  consent: z.coerce.boolean().refine(Boolean),
  website: optionalText(120),
});

export type ContactPayload = z.infer<typeof contactSchema>;
export type RFQPayload = z.infer<typeof rfqSchema>;

export function validateBomFile(file: File | null) {
  if (!file || file.size === 0) {
    return { ok: true as const };
  }

  if (file.size > maxBomFileSize) {
    return { ok: false as const, reason: "fileSize" };
  }

  if (!allowedBomTypes.includes(file.type as (typeof allowedBomTypes)[number])) {
    return { ok: false as const, reason: "fileType" };
  }

  return {
    ok: true as const,
    file: {
      name: file.name.replace(/[<>]/g, ""),
      type: file.type,
      size: file.size,
    },
  };
}
