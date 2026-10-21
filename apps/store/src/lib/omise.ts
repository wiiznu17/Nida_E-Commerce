export interface CreateOmiseCardInput {
  name: string;
  number: string;
  expirationMonth: number;
  expirationYear: number;
  securityCode: string;
}

export interface OmiseTokenResult {
  id: string;
  card: {
    id: string;
    brand: string;
    last_digits: string;
    name: string;
    expiration_month: number;
    expiration_year: number;
  };
}

/**
 * Tokenize credit/debit card information directly against the Omise Vault API.
 * The card number and security code are sent directly to Omise and NEVER touch our application server,
 * ensuring complete PCI-DSS Level 1 compliance.
 */
export async function createOmiseCardToken(
  cardInput: CreateOmiseCardInput,
): Promise<OmiseTokenResult> {
  const publicKey =
    process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY || 'pkey_test_69cysqv99emi7z8tqsi';

  if (!publicKey) {
    throw new Error('Omise public key is not configured');
  }

  const authHeader = `Basic ${btoa(`${publicKey}:`)}`;

  const bodyParams = new URLSearchParams({
    'card[name]': cardInput.name,
    'card[number]': cardInput.number.replace(/\s+/g, ''),
    'card[expiration_month]': cardInput.expirationMonth.toString(),
    'card[expiration_year]': cardInput.expirationYear.toString(),
    'card[security_code]': cardInput.securityCode,
  });

  const response = await fetch('https://vault.omise.co/tokens', {
    method: 'POST',
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: bodyParams.toString(),
  });

  const data = (await response.json()) as {
    object?: string;
    id?: string;
    card?: OmiseTokenResult['card'];
    message?: string;
    code?: string;
  };

  if (!response.ok || !data.id || !data.card) {
    const errorMsg =
      data.message ||
      'ข้อมูลบัตรเครดิตไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง';
    throw new Error(errorMsg);
  }

  return {
    id: data.id,
    card: data.card,
  };
}
