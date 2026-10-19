import { Injectable, Logger, BadRequestException } from '@nestjs/common';

export interface TurnstileVerificationResult {
  success: boolean;
  'error-codes'?: string[];
}

@Injectable()
export class TurnstileService {
  private readonly logger = new Logger(TurnstileService.name);

  async verifyToken(token?: string, remoteIp?: string): Promise<boolean> {
    const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;

    // In development or when unconfigured, bypass verification
    if (!secretKey || process.env.NODE_ENV !== 'production') {
      return true;
    }

    if (!token) {
      throw new BadRequestException(
        'การตรวจสอบความปลอดภัยไม่ผ่าน กรุณาลองใหม่อีกครั้ง (Missing bot verification token)',
      );
    }

    try {
      const formData = new URLSearchParams();
      formData.append('secret', secretKey);
      formData.append('response', token);
      if (remoteIp && remoteIp !== 'unknown') {
        formData.append('remoteip', remoteIp);
      }

      const res = await fetch(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData.toString(),
        },
      );

      const data = (await res.json()) as TurnstileVerificationResult;
      if (!data.success) {
        this.logger.warn(
          `Cloudflare Turnstile verification rejected: ${JSON.stringify(data['error-codes'] ?? [])}`,
        );
        throw new BadRequestException(
          'การตรวจสอบความปลอดภัยไม่ผ่าน กรุณาลองใหม่อีกครั้ง (Bot verification failed)',
        );
      }

      return true;
    } catch (err: unknown) {
      if (err instanceof BadRequestException) {
        throw err;
      }
      this.logger.error(
        `Turnstile API unreachable: ${err instanceof Error ? err.message : String(err)}`,
      );
      // Fail open when remote cloud verification service is unreachable to prevent business interruption
      return true;
    }
  }
}
