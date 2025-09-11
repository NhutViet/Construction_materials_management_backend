export declare class StockInItemDto {
    materialId: string;
    materialName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    unit: string;
    supplier?: string;
}
export declare class CreateStockInDto {
    items: StockInItemDto[];
    subtotal: number;
    taxRate?: number;
    taxAmount?: number;
    discountRate?: number;
    discountAmount?: number;
    totalAmount: number;
    supplier?: string;
    supplierPhone?: string;
    supplierAddress?: string;
    notes?: string;
    receivedDate?: string;
}
export declare class UpdateStockInDto {
    items?: StockInItemDto[];
    subtotal?: number;
    taxRate?: number;
    taxAmount?: number;
    discountRate?: number;
    discountAmount?: number;
    totalAmount?: number;
    supplier?: string;
    supplierPhone?: string;
    supplierAddress?: string;
    notes?: string;
    receivedDate?: string;
    remainingAmount?: number;
}
export declare class UpdatePaymentStatusDto {
    paymentStatus: 'unpaid' | 'partial' | 'paid';
    paidAmount: number;
}
export declare class UpdateStockInStatusDto {
    status: 'pending' | 'approved' | 'rejected';
}
export declare class StockInQueryDto {
    search?: string;
    paymentStatus?: 'unpaid' | 'partial' | 'paid';
    status?: 'pending' | 'approved' | 'rejected';
    supplier?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}
