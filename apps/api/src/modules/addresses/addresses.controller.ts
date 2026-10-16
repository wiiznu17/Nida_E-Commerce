import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CustomerAddressesService } from './addresses.service.js';
import { CreateAddressDto } from './dto/create-address.dto.js';
import { UpdateAddressDto } from './dto/update-address.dto.js';
import { CustomerJwtGuard } from '../auth/guards/customer-jwt.guard.js';
import type { ApiAddress } from '@repo/types';

interface AuthenticatedCustomerRequest {
  user: {
    id: string;
    email: string;
  };
}

@ApiTags('Storefront Customer Addresses')
@Controller(['users/addresses', 'store/users/addresses'])
@UseGuards(CustomerJwtGuard)
@ApiBearerAuth()
export class CustomerAddressesController {
  constructor(
    private readonly addressesService: CustomerAddressesService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'List saved shipping addresses for current customer',
    description:
      'Returns all saved shipping addresses ordered with the default address first.',
  })
  @ApiResponse({ status: 200, description: 'List of customer addresses' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAddresses(
    @Req() req: AuthenticatedCustomerRequest,
  ): Promise<ApiAddress[]> {
    return this.addressesService.getAddresses(req.user.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new shipping address',
    description:
      'Adds a new shipping address to the customer profile. Automatically set as default if first address or requested.',
  })
  @ApiResponse({ status: 201, description: 'Address created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createAddress(
    @Req() req: AuthenticatedCustomerRequest,
    @Body() dto: CreateAddressDto,
  ): Promise<ApiAddress> {
    return this.addressesService.createAddress(req.user.id, dto);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update an existing shipping address',
    description: 'Updates address details for the authenticated customer.',
  })
  @ApiResponse({ status: 200, description: 'Address updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Address not found' })
  async updateAddress(
    @Req() req: AuthenticatedCustomerRequest,
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
  ): Promise<ApiAddress> {
    return this.addressesService.updateAddress(req.user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a shipping address',
    description:
      'Removes a shipping address from the customer profile. Automatically reassigns default if necessary.',
  })
  @ApiResponse({ status: 200, description: 'Address deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Address not found' })
  async deleteAddress(
    @Req() req: AuthenticatedCustomerRequest,
    @Param('id') id: string,
  ): Promise<{ success: boolean }> {
    return this.addressesService.deleteAddress(req.user.id, id);
  }

  @Patch(':id/default')
  @ApiOperation({
    summary: 'Set address as default shipping address',
    description:
      'Marks the specified address as default and unmarks all other addresses.',
  })
  @ApiResponse({ status: 200, description: 'Default address updated' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Address not found' })
  async setDefaultAddress(
    @Req() req: AuthenticatedCustomerRequest,
    @Param('id') id: string,
  ): Promise<ApiAddress> {
    return this.addressesService.setDefaultAddress(req.user.id, id);
  }
}
