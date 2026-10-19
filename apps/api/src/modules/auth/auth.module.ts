import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { CustomerAuthController } from './auth.controller.js';
import { CustomerAuthService } from './auth.service.js';
import { CustomerJwtStrategy } from './strategies/customer-jwt.strategy.js';
import {
  CustomerJwtGuard,
  OptionalCustomerJwtGuard,
} from './guards/customer-jwt.guard.js';
import { TurnstileService } from '../../core/security/turnstile.service.js';


@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'customer-jwt' }),
    JwtModule.register({
      secret:
        process.env.JWT_CUSTOMER_SECRET ??
        'nida_store_customer_jwt_secret_key_2026_luxury_apparel',
      signOptions: { expiresIn: '900s' },
    }),
  ],
  controllers: [CustomerAuthController],
  providers: [
    CustomerAuthService,
    CustomerJwtStrategy,
    CustomerJwtGuard,
    OptionalCustomerJwtGuard,
    TurnstileService,
  ],
  exports: [
    CustomerAuthService,
    CustomerJwtGuard,
    OptionalCustomerJwtGuard,
    TurnstileService,
    PassportModule,
    JwtModule,
  ],
})

export class CustomerAuthModule {}
