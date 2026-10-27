import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import type { CustomerChangePasswordInput } from '@repo/validators';

export class CustomerChangePasswordDto implements CustomerChangePasswordInput {
  @ApiProperty({
    example: 'OldPass1234',
    description: 'Current password for verification',
  })
  @IsString()
  @IsNotEmpty({ message: 'Current password is required' })
  currentPassword!: string;

  @ApiProperty({
    example: 'NewPass1234',
    description: 'New password (min 6 characters)',
  })
  @IsString()
  @MinLength(6, { message: 'New password must be at least 6 characters' })
  newPassword!: string;
}
