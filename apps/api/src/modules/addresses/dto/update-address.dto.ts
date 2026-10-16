import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateAddressDto } from './create-address.dto.js';
import type { UpdateAddressDto as IUpdateAddressDto } from '@repo/types';

export class UpdateAddressDto
  extends PartialType(CreateAddressDto)
  implements IUpdateAddressDto {}
