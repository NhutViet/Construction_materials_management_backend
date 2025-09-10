import { Document, Types } from 'mongoose';
export interface StockInItem {
    materialId: Types.ObjectId;
    materialName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    unit: string;
    supplier?: string;
}
export declare class StockIn {
    stockInNumber: string;
    userId: Types.ObjectId;
    items: StockInItem[];
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    discountRate: number;
    discountAmount: number;
    totalAmount: number;
    paymentStatus: 'unpaid' | 'partial' | 'paid';
    paidAmount: number;
    remainingAmount: number;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    supplier: string;
    supplierPhone: string;
    supplierAddress: string;
    notes: string;
    receivedDate: Date;
    createdBy: Types.ObjectId;
    approvedBy: Types.ObjectId;
    approvedAt: Date;
    isDeleted: boolean;
}
export declare const StockInSchema: import("mongoose").Schema<StockIn, import("mongoose").Model<StockIn, any, any, any, Document<unknown, any, StockIn, any, {}> & StockIn & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, StockIn, Document<unknown, {}, import("mongoose").FlatRecord<StockIn>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<StockIn> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export type StockInDocument = StockIn & Document;
