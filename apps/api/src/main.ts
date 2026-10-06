import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { HttpExceptionFilter } from './core/filters/http-exception.filter.js';
import { TransformInterceptor } from './core/interceptors/transform.interceptor.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  // Global API Prefix — ทุก endpoint จะเริ่มด้วย /api/v1
  app.setGlobalPrefix('api/v1');

  // Global Validation Pipe — auto-validate DTO ด้วย class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // ตัด field ที่ไม่ได้ประกาศใน DTO ออก
      forbidNonWhitelisted: true, // error ถ้าส่ง field แปลกมา
      transform: true, // auto-transform query params เป็น type ที่ถูกต้อง
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global Exception Filter — จัดรูปแบบ error response ให้สม่ำเสมอ
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global Interceptor — ครอบ response ด้วย { success: true, data: ... }
  app.useGlobalInterceptors(new TransformInterceptor());

  // Configure Swagger OpenAPI Documentation
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
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 4000);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(
    `Swagger Documentation available at: ${await app.getUrl()}/api/docs`,
  );
}
await bootstrap();
