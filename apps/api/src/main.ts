import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  // Configure Swagger OpenAPI Documentation
  const config = new DocumentBuilder()
    .setTitle('Nida E-Commerce API')
    .setDescription(
      'API documentation for Nida Modern Classic Apparel & Lifestyle Platform (Storefront & Admin)',
    )
    .setVersion('1.0')
    .addTag('Catalog', 'Categories, Products, Variants & Pre-order')
    .addTag(
      'Cart & Checkout',
      'Cart items, Coupon redemption & Checkout calculations',
    )
    .addTag('Orders & Fulfillment', 'Order placement, Payments & Tracking')
    .addTag(
      'Returns & Refunds',
      'Lightweight return requests & Partial refunds',
    )
    .addTag('Admin', 'Back-office operations, Inventory restock & Marketing')
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
