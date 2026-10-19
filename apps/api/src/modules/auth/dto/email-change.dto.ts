import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Length, Matches } from 'class-validator';
import type {
  RequestEmailChangeInput,
  VerifyEmailChangeInput,
} from '@repo/validators';

export class RequestEmailChangeDto implements RequestEmailChangeInput {
  @ApiProperty({
    example: 'new.email@example.com',
    description: 'New email address to update to',
  })
  @IsEmail({}, { message: 'Invalid email address format' })
  @IsNotEmpty({ message: 'New email address is required' })
  newEmail!: string;
}

export class VerifyEmailChangeDto implements VerifyEmailChangeInput {
  @ApiProperty({
    example: 'new.email@example.com',
    description: 'New email address to verify',
  })
  @IsEmail({}, { message: 'Invalid email address format' })
  @IsNotEmpty({ message: 'New email address is required' })
  newEmail!: string;

  @ApiProperty({
    example: '123456',
    description: '6-digit OTP verification code sent to new email',
  })
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  @Matches(/^\d{6}$/, { message: 'OTP must consist of digits only' })
  otpCode!: string;
}
