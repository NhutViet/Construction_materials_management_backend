import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StockInController } from '../controllers/stock-in.controller';
import { StockInService } from '../services/stock-in.service';
import { StockIn, StockInSchema } from '../models/stock-in.model';
import { Material, MaterialSchema } from '../models/material.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StockIn.name, schema: StockInSchema },
      { name: Material.name, schema: MaterialSchema },
    ]),
  ],
  controllers: [StockInController],
  providers: [StockInService],
  exports: [StockInService],
})
export class StockInModule {}
