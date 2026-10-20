import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from './app.module.js';
import { HttpExceptionFilter } from './core/filters/http-exception.filter.js';
import { TransformInterceptor } from './core/interceptors/transform.interceptor.js';

interface ProcessWithLoadEnv {
  loadEnvFile?: (path: string) => void;
}

if (
  'loadEnvFile' in process &&
  typeof (process as ProcessWithLoadEnv).loadEnvFile === 'function'
) {
  const envCandidates = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), 'apps/api/.env'),
  ];
  for (const envPath of envCandidates) {
    if (fs.existsSync(envPath)) {
      try {
        (process as Required<ProcessWithLoadEnv>).loadEnvFile(envPath);
        break;
      } catch {
        // Fallback gracefully
      }
    }
  }
}

async function bootstrap() {
  const logger = new Logger('StorefrontApiBootstrap');
  const app = await NestFactory.create(AppModule);

  app.enableShutdownHooks();

  // HTTP Security Headers
  app.use(helmet());

  // Strict CORS Whitelist Configuration
  const isProd = process.env.NODE_ENV === 'production';

  // Production Security Verification
  if (isProd) {
    const defaultSecret = 'nida_store_customer_jwt_secret_key_2026_luxury_apparel';
    const secret = process.env.JWT_CUSTOMER_SECRET;
    if (!secret || secret === defaultSecret || secret.length < 32) {
      logger.error(
        'SECURITY CRITICAL: JWT_CUSTOMER_SECRET must be configured with a cryptographically random string (min 32 chars) in production!',
      );
      throw new Error(
        'SECURITY MISCONFIGURATION: Weak or default JWT_CUSTOMER_SECRET detected on production.',
      );
    }
  }

  const rawOrigins = [
    ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : []),
    process.env.STORE_FRONTEND_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ];

  const allowedOrigins = Array.from(
    new Set(
      rawOrigins
        .filter((o): o is string => Boolean(o && typeof o === 'string'))
        .map((o) => o.trim().replace(/\/+$/, '')),
    ),
  );

  app.enableCors({
    origin: (
      requestOrigin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!requestOrigin || !isProd) {
        return callback(null, true);
      }
      const normalizedRequest = requestOrigin.replace(/\/+$/, '');
      let isAllowed = allowedOrigins.includes(normalizedRequest);
      if (!isAllowed) {
        try {
          const reqHost = new URL(normalizedRequest).hostname;
          isAllowed = reqHost.endsWith('.vercel.app');
        } catch {
          isAllowed = false;
        }
      }

      if (isAllowed) {
        return callback(null, true);
      }
      logger.warn(`CORS rejected for origin: ${requestOrigin}`);
      return callback(null, false);
    },
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger Documentation: Guarded against public access in production
  if (!isProd) {
    const config = new DocumentBuilder()
      .setTitle('Nida Storefront Customer API')
      .setDescription(
        'Customer API for Nida E-Commerce Storefront (Catalog, Customer OTP Auth, Orders & Checkout, Tracking)',
      )
      .setVersion('1.0')
      .addTag('Storefront Auth', 'Customer OTP login, verification and profile')
      .addTag(
        'Storefront Catalog',
        'Public product catalog and live inventory availability',
      )
      .addTag(
        'Storefront Orders',
        'Order placement with atomic stock deduction and tracking',
      )
      .addTag('Health', 'Liveness and readiness probes')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    logger.log('Storefront Swagger Documentation: /api/docs');
  }

  const port = Number(process.env.STORE_API_PORT ?? process.env.PORT ?? 4001);
  await app.listen(port);

  const url = await app.getUrl();
  logger.log(`Storefront API is running on: ${url}`);
}

await bootstrap();
