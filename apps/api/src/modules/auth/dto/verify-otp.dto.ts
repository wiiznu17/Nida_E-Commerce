import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Length, Matches } from 'class-validator';
import type { VerifyOtpInput } from '@repo/validators';

export class VerifyOtpDto implements VerifyOtpInput {
  @ApiProperty({
    example: 'customer@example.com',
    description: 'Customer email',
  })
  @IsEmail({}, { message: 'Invalid email address format' })
  @IsNotEmpty({ message: 'Email address is required' })
  email!: string;

  @ApiProperty({
    example: '123456',
    description: '6-digit OTP verification code',
  })
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  @Matches(/^\d{6}$/, { message: 'OTP must consist of digits only' })
  otpCode!: string;
}
