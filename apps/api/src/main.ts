import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import express from 'express';
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

  // Trust first proxy hop (Render, Cloudflare, AWS ALB) for accurate client IP resolution
  const expressApp = app.getHttpAdapter().getInstance() as express.Application;
  expressApp.set('trust proxy', 1);
  expressApp.disable('x-powered-by');

  // Request Body Payload Size Limits (Anti-DoS / Memory Exhaustion)
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // HTTP Security Headers (Strict HSTS, MIME sniffing protection, Referrer policy)
  app.use(
    helmet({
      hsts: { // ป้องกันการโจมตี Man-in-the-middle โดยบังคับให้ใช้ HTTPS เสมอ
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      xContentTypeOptions: true, // ป้องกันการเดาชนิดข้อมูลผิดพลาด
      frameguard: { action: 'deny' }, // ป้องกัน Clickjacking
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' }, // ป้องกันการส่ง Referer ไปยังเว็บอื่น
      hidePoweredBy: true, // ซ่อน X-Powered-By
      crossOriginResourcePolicy: { policy: 'cross-origin' }, // อนุญาตให้โหลดทรัพยากรจากเว็บอื่นได้
    }),
  );

  // Response Payload Compression (Gzip/Deflate for payloads > 1KB)
  app.use(compression({ threshold: 1024 }));

  // Strict CORS Whitelist Configuration
  const isProd = process.env.NODE_ENV === 'production';

  // Production Security Verification
  if (isProd) {
    const defaultSecret =
      'nida_store_customer_jwt_secret_key_2026_luxury_apparel';
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

  const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim().replace(/\/+$/, ''))
    .filter(Boolean);

  if (isProd && allowedOrigins.length === 0) {
    logger.error(
      'SECURITY CRITICAL: ALLOWED_ORIGINS must be configured in production!',
    );
    throw new Error(
      'SECURITY MISCONFIGURATION: Missing ALLOWED_ORIGINS on production.',
    );
  }

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
