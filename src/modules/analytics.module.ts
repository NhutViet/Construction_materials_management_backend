import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsController } from '../controllers/analytics.controller';
import { AnalyticsService } from '../services/analytics.service';
import { Material, MaterialSchema } from '../models/material.model';
import { Invoice, InvoiceSchema } from '../models/invoice.model';
import { StockIn, StockInSchema } from '../models/stock-in.model';
import { User, UserSchema } from '../models/user.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Material.name, schema: MaterialSchema },
      { name: Invoice.name, schema: InvoiceSchema },
      { name: StockIn.name, schema: StockInSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
