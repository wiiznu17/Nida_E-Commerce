import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AdminLoginDto {
  @IsNotEmpty({ message: 'กรุณากรอกชื่อผู้ใช้หรืออีเมล' })
  @IsString()
  identifier!: string;

  @IsNotEmpty({ message: 'กรุณากรอกรหัสผ่าน' })
  @IsString()
  password!: string;
}

export class RefreshTokenDto {
  @IsNotEmpty({ message: 'Refresh token is required' })
  @IsString()
  refreshToken!: string;
}

export class SetupPasswordDto {
  @IsNotEmpty({ message: 'Token is required' })
  @IsString()
  token!: string;

  @IsNotEmpty({ message: 'กรุณาระบุรหัสผ่าน' })
  @MinLength(8, { message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร' })
  @IsString()
  password!: string;
}

export class ForgotPasswordDto {
  @IsNotEmpty({ message: 'กรุณาระบุอีเมล' })
  @IsString()
  email!: string;
}

export class ResetPasswordDto {
  @IsNotEmpty({ message: 'Token is required' })
  @IsString()
  token!: string;

  @IsNotEmpty({ message: 'กรุณาระบุรหัสผ่านใหม่' })
  @MinLength(8, { message: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร' })
  @IsString()
  password!: string;
}
