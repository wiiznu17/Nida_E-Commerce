import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from './app.module.js';
import { HttpExceptionFilter } from './core/filters/http-exception.filter.js';
import { TransformInterceptor } from './core/interceptors/transform.interceptor.js';

interface ProcessWithLoadEnv {
  loadEnvFile?: (path: string) => void;
}

if ('loadEnvFile' in process && typeof (process as ProcessWithLoadEnv).loadEnvFile === 'function') {
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
  app.enableCors({
    origin: true,
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

  const config = new DocumentBuilder()
    .setTitle('Nida Storefront Customer API')
    .setDescription('Customer API for Nida E-Commerce Storefront (Catalog, Customer OTP Auth, Orders & Checkout, Tracking)')
    .setVersion('1.0')
    .addTag('Storefront Auth', 'Customer OTP login, verification and profile')
    .addTag('Storefront Catalog', 'Public product catalog and live inventory availability')
    .addTag('Storefront Orders', 'Order placement with atomic stock deduction and tracking')
    .addTag('Health', 'Liveness and readiness probes')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = Number(process.env.STORE_API_PORT ?? process.env.PORT ?? 4001);
  await app.listen(port);

  const url = await app.getUrl();
  logger.log(`Storefront API is running on: ${url}`);
  logger.log(`Storefront Swagger Documentation: ${url}/api/docs`);
}

await bootstrap();
