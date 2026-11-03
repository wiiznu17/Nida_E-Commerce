import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import {
  CustomersService,
  type PaginatedCustomersResult,
} from './customers.service.js';
import { RoleBasedPiiInterceptor } from '../../core/interceptors/role-based-pii.interceptor.js';
import { ZodValidationPipe } from '../../core/pipes/zod-validation.pipe.js';
import {
  adminCustomerQuerySchema,
  updateAccountStatusSchema,
  type AdminCustomerQueryInput,
  type UpdateAccountStatusInput,
} from '@repo/validators';
import {
  RequirePermissions,
  CurrentAdmin,
} from '../auth/decorators/index.js';
import {
  AdminPermission,
  type ApiAdminUser,
  type ApiAdminCustomerDetail,
  type ApiAdminCustomerListItem,
  type ApiAdminCustomerStats,
  type ApiResponse as ApiGenericResponse,
} from '@repo/types';

@ApiTags('Admin Store Customers')
@Controller('admin/customers')
@RequirePermissions(AdminPermission.ADMIN_USERS_MANAGE)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get('stats')
  @ApiOperation({
    summary: 'Get customer overview metrics',
    description:
      'Retrieve aggregated customer counts for total, active, suspended, banned, and VIP tiers.',
  })
  @ApiResponse({ status: 200, description: 'Customer overview statistics' })
  async getStats(): Promise<ApiGenericResponse<ApiAdminCustomerStats>> {
    const data = await this.customersService.getCustomerStats();
    return {
      success: true,
      data,
    };
  }

  @Get()
  @UseInterceptors(RoleBasedPiiInterceptor)
  @ApiOperation({
    summary: 'List store customers',
    description:
      'Retrieve paginated store customers with filtering by status and tier, and search by name, email, or phone.',
  })
  @ApiResponse({ status: 200, description: 'Paginated customer list' })
  async getCustomers(
    @Query(new ZodValidationPipe(adminCustomerQuerySchema))
    query: AdminCustomerQueryInput,
  ): Promise<ApiGenericResponse<PaginatedCustomersResult>> {
    const data = await this.customersService.getCustomers(query);
    return {
      success: true,
      data,
    };
  }

  @Get(':id')
  @UseInterceptors(RoleBasedPiiInterceptor)
  @ApiOperation({
    summary: 'Get store customer detail',
    description:
      'Retrieve customer profile, saved delivery addresses, and recent order history.',
  })
  @ApiParam({ name: 'id', description: 'Customer UUID' })
  @ApiResponse({ status: 200, description: 'Customer detail' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async getCustomerById(
    @Param('id') id: string,
  ): Promise<ApiGenericResponse<ApiAdminCustomerDetail>> {
    const data = await this.customersService.getCustomerById(id);
    return {
      success: true,
      data,
    };
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Update store customer account status',
    description:
      'Suspend, ban, or reactivate store customer account, revoke active tokens, and write audit trail.',
  })
  @ApiParam({ name: 'id', description: 'Customer UUID' })
  @ApiResponse({ status: 200, description: 'Customer status updated' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async updateStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateAccountStatusSchema))
    dto: UpdateAccountStatusInput,
    @CurrentAdmin() currentAdmin: ApiAdminUser,
  ): Promise<ApiGenericResponse<ApiAdminCustomerListItem>> {
    const data = await this.customersService.updateCustomerStatus(
      currentAdmin.id,
      id,
      dto,
      currentAdmin.role?.roleCode,
    );
    return {
      success: true,
      data,
    };
  }
}

