import { Module } from '@nestjs/common';
import { TaxInvoiceService } from './tax-invoice.service.js';
import { PrismaModule } from '../../core/prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  providers: [TaxInvoiceService],
  exports: [TaxInvoiceService],
})
export class TaxInvoiceModule {}

