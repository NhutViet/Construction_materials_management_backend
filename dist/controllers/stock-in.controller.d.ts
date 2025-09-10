import { StockInService } from '../services/stock-in.service';
import { CreateStockInDto, UpdateStockInDto, UpdatePaymentStatusDto, UpdateStockInStatusDto, StockInQueryDto } from '../dto/stock-in.dto';
export declare class StockInController {
    private readonly stockInService;
    constructor(stockInService: StockInService);
    createStockIn(createStockInDto: CreateStockInDto, req: any): Promise<import("../models/stock-in.model").StockIn>;
    getStockIns(query: StockInQueryDto, req: any): Promise<{
        data: import("../models/stock-in.model").StockIn[];
        total: number;
        page: number;
        limit: number;
    }>;
    getMaterialsForSelection(req: any): Promise<import("../models/material.model").Material[]>;
    getStockInStats(startDate?: string, endDate?: string, req?: any): Promise<any>;
    getStockInById(id: string, req: any): Promise<import("../models/stock-in.model").StockIn>;
    updateStockIn(id: string, updateStockInDto: UpdateStockInDto, req: any): Promise<import("../models/stock-in.model").StockIn>;
    updatePaymentStatus(id: string, updatePaymentStatusDto: UpdatePaymentStatusDto, req: any): Promise<import("../models/stock-in.model").StockIn>;
    updateStatus(id: string, updateStatusDto: UpdateStockInStatusDto, req: any): Promise<import("../models/stock-in.model").StockIn>;
    deleteStockIn(id: string, req: any): Promise<void>;
}
