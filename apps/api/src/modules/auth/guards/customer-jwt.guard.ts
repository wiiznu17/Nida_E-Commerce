import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class CustomerJwtGuard extends AuthGuard('customer-jwt') {}

@Injectable()
export class OptionalCustomerJwtGuard extends AuthGuard('customer-jwt') {
  handleRequest<TUser = unknown>(_err: unknown, user: TUser): TUser {
    return user;
  }
}
