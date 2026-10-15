import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { CustomerAuthController } from './auth.controller.js';
import { CustomerAuthService } from './auth.service.js';
import { CustomerJwtStrategy } from './strategies/customer-jwt.strategy.js';
import { CustomerJwtGuard, OptionalCustomerJwtGuard } from './guards/customer-jwt.guard.js';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'customer-jwt' }),
    JwtModule.register({
      secret:
        process.env.JWT_CUSTOMER_SECRET ??
        'nida_store_customer_jwt_secret_key_2026_luxury_apparel',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [CustomerAuthController],
  providers: [
    CustomerAuthService,
    CustomerJwtStrategy,
    CustomerJwtGuard,
    OptionalCustomerJwtGuard,
  ],
  exports: [
    CustomerAuthService,
    CustomerJwtGuard,
    OptionalCustomerJwtGuard,
    PassportModule,
    JwtModule,
  ],
})
export class CustomerAuthModule {}
