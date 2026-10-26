import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  MinLength,
} from 'class-validator';
import type {
  CustomerForgotPasswordInput,
  CustomerResetPasswordInput,
  CustomerResendOtpInput,
} from '@repo/validators';

export class CustomerForgotPasswordDto implements CustomerForgotPasswordInput {
  @ApiProperty({
    example: 'customer@example.com',
    description: 'Customer email address for password reset',
  })
  @IsEmail({}, { message: 'Invalid email address format' })
  @IsNotEmpty({ message: 'Email address is required' })
  email!: string;
}

export class CustomerResetPasswordDto implements CustomerResetPasswordInput {
  @ApiProperty({
    example: 'customer@example.com',
    description: 'Customer email address',
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

  @ApiProperty({
    example: 'NewSecurePass123',
    description: 'New password (min 6 characters)',
  })
  @IsString()
  @MinLength(6, { message: 'New password must be at least 6 characters' })
  newPassword!: string;
}

export class CustomerResendOtpDto implements CustomerResendOtpInput {
  @ApiProperty({
    example: 'customer@example.com',
    description: 'Customer email address for OTP resend',
  })
  @IsEmail({}, { message: 'Invalid email address format' })
  @IsNotEmpty({ message: 'Email address is required' })
  email!: string;
}
