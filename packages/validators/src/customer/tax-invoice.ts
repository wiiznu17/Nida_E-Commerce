import { z } from 'zod';

/**
 * Validates a 13-digit Thai National ID or Tax ID using Mod 11 checksum algorithm.
 */
export function validateThaiIdChecksum(id: string): boolean {
  const cleaned = id.replace(/[\s-]/g, '');
  if (!/^\d{13}$/.test(cleaned)) {
    return false;
  }

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned.charAt(i), 10) * (13 - i);
  }

  const check = (11 - (sum % 11)) % 10;
  return check === parseInt(cleaned.charAt(12), 10);
}

export const taxInvoiceRequestSchema = z
  .object({
    payerType: z.enum(['PERSONAL', 'COMPANY']),
    taxId: z
      .string()
      .trim()
      .min(1, { message: 'Tax ID or ID number is required' })
      .max(20),
    name: z
      .string()
      .trim()
      .min(2, { message: 'Full name or company name is required' })
      .max(255),
    branchType: z.enum(['HEADQUARTERS', 'BRANCH']).optional().nullable(),
    branchCode: z.string().trim().max(10).optional().nullable(),
    address: z
      .string()
      .trim()
      .min(10, { message: 'Address must be at least 10 characters' }),
  })
  .superRefine((data, ctx) => {
    // 1. Company rules
    if (data.payerType === 'COMPANY') {
      const cleaned = data.taxId.replace(/[\s-]/g, '');
      if (!/^\d{13}$/.test(cleaned)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Company tax ID must be exactly 13 digits',
          path: ['taxId'],
        });
      } else if (!validateThaiIdChecksum(cleaned)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Invalid 13-digit tax ID checksum',
          path: ['taxId'],
        });
      }

      if (!data.branchType) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Branch type (Headquarters or Branch) is required for companies',
          path: ['branchType'],
        });
      }

      if (data.branchType === 'BRANCH') {
        const cleanedBranch = (data.branchCode ?? '').trim();
        if (!/^\d{5}$/.test(cleanedBranch)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Branch code must be a 5-digit number (e.g. 00001)',
            path: ['branchCode'],
          });
        }
      }
    } else {
      // 2. Personal rules: 13-digit Thai ID or Passport
      const cleaned = data.taxId.replace(/[\s-]/g, '');
      if (/^\d{13}$/.test(cleaned)) {
        if (!validateThaiIdChecksum(cleaned)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Invalid 13-digit national ID checksum',
            path: ['taxId'],
          });
        }
      } else if (!/^[A-Za-z0-9]{7,15}$/.test(cleaned)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'National ID must be 13 digits, or a valid Passport number (7-15 alphanumeric characters)',
          path: ['taxId'],
        });
      }
    }
  });

export type TaxInvoiceRequestInput = z.infer<typeof taxInvoiceRequestSchema>;

