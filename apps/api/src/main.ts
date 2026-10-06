import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { HttpExceptionFilter } from './core/filters/http-exception.filter.js';
import { TransformInterceptor } from './core/interceptors/transform.interceptor.js';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  app.enableShutdownHooks();
  app.enableCors();
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
    .setTitle('Nida E-Commerce API')
    .setDescription(
      'API documentation for Nida Modern Classic Apparel & Lifestyle Platform (Storefront & Admin)',
    )
    .setVersion('1.0')
    .addTag('Catalog', 'Categories, Products, Variants & Pre-order')
    .addTag(
      'Coupons & Checkout',
      'Coupon validation, Pro-rata discount distribution & Checkout calculations',
    )
    .addTag('Orders & Shipments', 'Order placement, Payments & Tracking')
    .addTag(
      'Admin Back-Office',
      'Back-office operations, Inventory restock & Order fulfillment',
    )
    .addTag('Health', 'Liveness and readiness probes')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 4000;
  await app.listen(port);

  const url = await app.getUrl();
  logger.log(`Application is running on: ${url}`);
  logger.log(`Swagger Documentation available at: ${url}/api/docs`);
}

await bootstrap();
