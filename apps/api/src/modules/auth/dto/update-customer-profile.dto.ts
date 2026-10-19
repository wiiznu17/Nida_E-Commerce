import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import type { UpdateCustomerProfileInput } from '@repo/validators';

export class UpdateCustomerProfileDto implements UpdateCustomerProfileInput {
  @ApiPropertyOptional({
    example: 'John',
    description: 'First name of the customer',
  })
  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  firstName?: string;

  @ApiPropertyOptional({
    example: 'Doe',
    description: 'Last name of the customer',
  })
  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  lastName?: string;

  @ApiPropertyOptional({
    example: '0812345678',
    description: 'Phone number of the customer',
  })
  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  phone?: string;
}
