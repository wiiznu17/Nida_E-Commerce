import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class AdminLoginDto {
  @ApiProperty({
    description: 'Admin username or email address',
    example: 'admin@nida.com',
  })
  @IsNotEmpty({ message: 'กรุณากรอกชื่อผู้ใช้หรืออีเมล' })
  @IsString()
  identifier!: string;

  @ApiProperty({
    description: 'Admin account password',
    example: 'Admin@123456',
  })
  @IsNotEmpty({ message: 'กรุณากรอกรหัสผ่าน' })
  @IsString()
  password!: string;
}

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Active refresh token issued during login',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsNotEmpty({ message: 'Refresh token is required' })
  @IsString()
  refreshToken!: string;
}

export class SetupPasswordDto {
  @ApiProperty({
    description: 'One-time invitation token',
    example: 'inv_abc123456789',
  })
  @IsNotEmpty({ message: 'Token is required' })
  @IsString()
  token!: string;

  @ApiProperty({
    description: 'New password (minimum 8 characters)',
    example: 'SecurePass@2026',
    minLength: 8,
  })
  @IsNotEmpty({ message: 'กรุณาระบุรหัสผ่าน' })
  @MinLength(8, { message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร' })
  @IsString()
  password!: string;
}

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Registered admin email address',
    example: 'admin@nida.com',
  })
  @IsNotEmpty({ message: 'กรุณาระบุอีเมล' })
  @IsString()
  email!: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    description: 'One-time reset password token',
    example: 'reset_abc123456789',
  })
  @IsNotEmpty({ message: 'Token is required' })
  @IsString()
  token!: string;

  @ApiProperty({
    description: 'New password (minimum 8 characters)',
    example: 'NewSecurePass@2026',
    minLength: 8,
  })
  @IsNotEmpty({ message: 'กรุณาระบุรหัสผ่านใหม่' })
  @MinLength(8, { message: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร' })
  @IsString()
  password!: string;
}

export class AdminLogoutDto {
  @ApiPropertyOptional({
    description: 'Optional refresh token to invalidate specifically',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
