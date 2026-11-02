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

// Automatically load .env file for Node.js process
const nodeProcess = process as unknown as {
  loadEnvFile?: (path: string) => void;
};
if (typeof nodeProcess.loadEnvFile === 'function') {
  const envCandidates = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), 'apps/admin-api/.env'),
  ];
  for (const envPath of envCandidates) {
    if (fs.existsSync(envPath)) {
      try {
        nodeProcess.loadEnvFile(envPath);
        break;
      } catch {}
    }
  }
}

async function bootstrap() {
  const logger = new Logger('Bootstrap');
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
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      xContentTypeOptions: true,
      frameguard: { action: 'deny' },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      hidePoweredBy: true,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // Response Payload Compression (Gzip/Deflate for payloads > 1KB)
  app.use(compression({ threshold: 1024 }));

  // Strict CORS Whitelist Configuration
  const isProd = process.env.NODE_ENV === 'production';

  // Production Security Verification
  if (isProd) {
    const defaultSecret =
      'nida_admin_access_jwt_secret_key_2026_luxury_apparel';
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret || secret === defaultSecret || secret.length < 32) {
      logger.error(
        'SECURITY CRITICAL: JWT_ACCESS_SECRET must be configured with a cryptographically random string (min 32 chars) in production!',
      );
      throw new Error(
        'SECURITY MISCONFIGURATION: Weak or default JWT_ACCESS_SECRET detected on production.',
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
      .setTitle('Nida E-Commerce API')
      .setDescription(
        'API documentation for Nida Modern Classic Apparel & Lifestyle Platform (Storefront & Admin)',
      )
      .setVersion('1.0')
      .addTag('Auth', 'Admin authentication, token refresh & password setup')
      .addTag('Admin Users', 'Back-office staff accounts & system roles')
      .addTag('Catalog', 'Categories, Products, Variants & Pre-order')
      .addTag(
        'Admin Back-Office',
        'Back-office operations, Inventory restock & Order fulfillment',
      )
      .addTag('Orders & Shipments', 'Order placement, Payments & Tracking')
      .addTag(
        'Coupons & Checkout',
        'Coupon validation, Pro-rata discount distribution & Checkout calculations',
      )
      .addTag(
        'Audit Logs',
        'Security audit trails & administrative operation history',
      )
      .addTag('Upload', 'Image upload & media management')
      .addTag('Health', 'Liveness and readiness probes')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    logger.log('Swagger Documentation available at: /api/docs');
  }

  const port = process.env.PORT ?? 4000;
  await app.listen(port);

  const url = await app.getUrl();
  logger.log(`Application is running on: ${url}`);
}

await bootstrap();
