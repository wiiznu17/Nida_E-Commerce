const REDACTED_KEYS = new Set([
  'password',
  'newpassword',
  'currentpassword',
  'confirmpassword',
  'oldpassword',
  'otpcode',
  'code',
  'token',
  'secret',
  'refreshtoken',
  'accesstoken',
  'cardnumber',
  'cvv',
  'securitycode',
  'omisestoken',
  'omisetoken',
]);

export function maskEmail(email: string): string {
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return email;
  }
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  const visible = local.length > 2 ? local.substring(0, 2) : local.substring(0, 1);
  return `${visible}***@${domain}`;
}

export function maskPhone(phone: string): string {
  if (!phone || typeof phone !== 'string' || phone.length < 8) {
    return phone;
  }
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 10) {
    return `${clean.substring(0, 3)}-***-${clean.substring(6)}`;
  }
  return `${phone.substring(0, 3)}***${phone.substring(phone.length - 2)}`;
}

export function sanitizeData<T = unknown>(data: T, seen = new WeakSet<object>()): T {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data !== 'object') {
    return data;
  }

  if (data instanceof Date || data instanceof RegExp) {
    return data;
  }

  if (seen.has(data)) {
    return '[Circular]' as unknown as T;
  }
  seen.add(data);

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeData(item, seen)) as unknown as T;
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    if (REDACTED_KEYS.has(lowerKey)) {
      result[key] = '***REDACTED***';
    } else if (lowerKey === 'email' && typeof value === 'string') {
      result[key] = maskEmail(value);
    } else if ((lowerKey === 'phone' || lowerKey === 'phonenumber') && typeof value === 'string') {
      result[key] = maskPhone(value);
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitizeData(value, seen);
    } else {
      result[key] = value;
    }
  }

  return result as T;
}
