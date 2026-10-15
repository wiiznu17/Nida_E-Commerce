import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class InviteAdminUserDto {
  @ApiProperty({
    description: 'Admin staff full name',
    example: 'Kanyarat Wongsuwan',
  })
  @IsNotEmpty({ message: 'กรุณากรอกชื่อ-นามสกุล' })
  @IsString()
  fullName!: string;

  @ApiProperty({
    description: 'Corporate email address for login and invitation link',
    example: 'kanyarat@nida.com',
  })
  @IsNotEmpty({ message: 'กรุณากรอกอีเมล' })
  @IsEmail({}, { message: 'รูปแบบอีเมลไม่ถูกต้อง' })
  email!: string;

  @ApiProperty({
    description: 'Target Role UUID (e.g. Catalog Manager, Order Specialist)',
    example: 'f87a8f33-1c25-4c09-9524-7476839352e0',
  })
  @IsNotEmpty({ message: 'กรุณาเลือกบทบาท' })
  @IsUUID('all', { message: 'รหัสบทบาทไม่ถูกต้อง' })
  roleId!: string;

  @ApiPropertyOptional({
    description: 'Assigned department code (WOMEN, MEN, BAGS, etc.)',
    example: 'WOMEN',
  })
  @IsOptional()
  @IsString()
  department?: string;
}
