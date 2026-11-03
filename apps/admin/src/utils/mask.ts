/**
 * Utility functions for masking Personally Identifiable Information (PII) on the UI.
 * Strictly intended for display formatting; never feed masked strings into form inputs or API mutation payloads.
 */

/**
 * Masks an email address: preserves first 2 chars of the username, adds asterisks, and keeps domain intact.
 * e.g., "customer@domain.com" -> "cu***@domain.com"
 * e.g., "a@b.com" -> "a***@b.com"
 */
export function maskEmail(email: string | null | undefined): string {
  if (!email || typeof email !== 'string') return '-';
  const trimmed = email.trim();
  const atIndex = trimmed.indexOf('@');
  if (atIndex <= 0) return trimmed;

  const username = trimmed.slice(0, atIndex);
  const domain = trimmed.slice(atIndex);

  if (username.length <= 2) {
    return `${username.charAt(0)}***${domain}`;
  }
  return `${username.slice(0, 2)}***${domain}`;
}

/**
 * Masks a phone number: keeps prefix and suffix while masking the middle portion.
 * e.g., "0812345678" -> "081-***-5678"
 * e.g., "081-234-5678" -> "081-***-5678"
 * e.g., "+66812345678" -> "+66***78"
 */
export function maskPhone(phone: string | null | undefined): string {
  if (!phone || typeof phone !== 'string') return '-';
  const clean = phone.replace(/[^0-9+]/g, '');

  if (clean.length === 10 && clean.startsWith('0')) {
    return `${clean.substring(0, 3)}-***-${clean.substring(6)}`;
  }

  if (clean.length === 9 && clean.startsWith('0')) {
    return `${clean.substring(0, 2)}-***-${clean.substring(5)}`;
  }

  if (clean.length > 7) {
    const start = clean.substring(0, 3);
    const end = clean.substring(clean.length - 2);
    return `${start}***${end}`;
  }

  return clean || '-';
}

/**
 * Masks customer or recipient name to protect privacy in public/shared views.
 * e.g., "Somchai Prasert" -> "Somchai P.***"
 * e.g., "สมชาย ประเสริฐ" -> "สมชาย ป.***"
 * e.g., "Somchai" -> "Som***"
 */
export function maskCustomerName(name: string | null | undefined): string {
  if (!name || typeof name !== 'string') return '-';
  const trimmed = name.trim();
  if (!trimmed) return '-';

  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    const single = parts[0];
    if (single.length <= 3) return `${single}***`;
    return `${single.slice(0, 3)}***`;
  }

  const firstName = parts[0];
  const lastName = parts.slice(1).join(' ');
  const lastNameInitial = lastName.charAt(0);

  return `${firstName} ${lastNameInitial}.***`;
}

/**
 * Masks card number, showing only the last 4 digits (PCI-DSS compliant).
 * e.g., "4242" -> "•••• 4242"
 * e.g., "4242424242424242" -> "•••• •••• •••• 4242"
 */
export function maskCardNumber(cardNumberOrLast4: string | null | undefined): string {
  if (!cardNumberOrLast4 || typeof cardNumberOrLast4 !== 'string') return '•••• •••• •••• ••••';
  const clean = cardNumberOrLast4.replace(/\s+/g, '');
  if (!clean) return '•••• •••• •••• ••••';

  if (clean.length <= 4) {
    return `•••• ${clean}`;
  }

  const last4 = clean.slice(-4);
  return `•••• •••• •••• ${last4}`;
}

/**
 * Masks street address while preserving district/province/postal code.
 * e.g., "123/45 ซอยสุขุมวิท 55" -> "*** ซอยสุขุมวิท 55"
 */
export function maskAddressLine(addressLine: string | null | undefined): string {
  if (!addressLine || typeof addressLine !== 'string') return '-';
  const trimmed = addressLine.trim();
  if (!trimmed) return '-';

  return trimmed.replace(/^[\d\w/\\-]+(\s+)?/, '*** ');
}

