import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class InviteAdminUserDto {
  @IsNotEmpty({ message: 'กรุณากรอกชื่อ-นามสกุล' })
  @IsString()
  fullName!: string;

  @IsNotEmpty({ message: 'กรุณากรอกอีเมล' })
  @IsEmail({}, { message: 'รูปแบบอีเมลไม่ถูกต้อง' })
  email!: string;

  @IsNotEmpty({ message: 'กรุณาเลือกบทบาท' })
  @IsUUID('all', { message: 'รหัสบทบาทไม่ถูกต้อง' })
  roleId!: string;

  @IsOptional()
  @IsString()
  department?: string;
}
