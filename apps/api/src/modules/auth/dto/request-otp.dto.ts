import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty, IsOptional } from 'class-validator';
import type { RequestOtpInput } from '@repo/validators';

export class RequestOtpDto implements RequestOtpInput {
  @ApiProperty({
    example: 'customer@example.com',
    description: 'Customer email for OTP verification',
  })
  @IsEmail({}, { message: 'Invalid email address format' })
  @IsNotEmpty({ message: 'Email address is required' })
  email!: string;

  @ApiPropertyOptional({
    example: 'signin',
    enum: ['signin', 'signup'],
    description: 'Authentication intent mode',
  })
  @IsOptional()
  @IsIn(['signin', 'signup'], { message: 'Intent must be signin or signup' })
  intent?: 'signin' | 'signup';
}
