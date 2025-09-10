import { Model } from 'mongoose';
import { StockIn, StockInDocument } from '../models/stock-in.model';
import { Material, MaterialDocument } from '../models/material.model';
import { CreateStockInDto, UpdateStockInDto, UpdatePaymentStatusDto, UpdateStockInStatusDto, StockInQueryDto } from '../dto/stock-in.dto';
export declare class StockInService {
    private stockInModel;
    private materialModel;
    constructor(stockInModel: Model<StockInDocument>, materialModel: Model<MaterialDocument>);
    createStockIn(createStockInDto: CreateStockInDto, userId: string): Promise<StockIn>;
    getStockIns(query: StockInQueryDto, userId: string): Promise<{
        data: StockIn[];
        total: number;
        page: number;
        limit: number;
    }>;
    getStockInById(id: string, userId: string): Promise<StockIn>;
    updateStockIn(id: string, updateStockInDto: UpdateStockInDto, userId: string): Promise<StockIn>;
    updatePaymentStatus(id: string, updatePaymentStatusDto: UpdatePaymentStatusDto, userId: string): Promise<StockIn>;
    updateStatus(id: string, updateStatusDto: UpdateStockInStatusDto, userId: string): Promise<StockIn>;
    deleteStockIn(id: string, userId: string): Promise<void>;
    getMaterialsForSelection(userId: string): Promise<Material[]>;
    private updateMaterialQuantities;
    private generateStockInNumber;
    getStockInStats(userId: string, startDate?: string, endDate?: string): Promise<any>;
}
