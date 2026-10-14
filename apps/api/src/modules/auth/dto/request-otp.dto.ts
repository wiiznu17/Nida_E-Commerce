import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import type { RequestOtpInput } from '@repo/validators';

export class RequestOtpDto implements RequestOtpInput {
  @ApiProperty({ example: 'customer@example.com', description: 'Customer email for OTP verification' })
  @IsEmail({}, { message: 'Invalid email address format' })
  @IsNotEmpty({ message: 'Email address is required' })
  email!: string;
}
