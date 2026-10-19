import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import type { CustomerRefreshTokenInput } from '@repo/validators';

export class CustomerRefreshTokenDto implements CustomerRefreshTokenInput {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Cryptographic UUID refresh token',
  })
  @IsString({ message: 'Refresh token must be a string' })
  @IsNotEmpty({ message: 'Refresh token is required' })
  refreshToken!: string;
}
