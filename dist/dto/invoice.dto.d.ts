import { PaymentMethod } from '../constants/payment.constants';
export declare class InvoiceItemDto {
    materialId: string;
    quantity: number;
    materialName?: string;
    unitPrice?: number;
    unit?: string;
}
export declare class CreateInvoiceItemDto {
    materialId: string;
    quantity: number;
}
export declare class CreateInvoiceDto {
    customerName: string;
    customerPhone?: string;
    customerAddress?: string;
    items: CreateInvoiceItemDto[];
    taxRate?: number;
    discountRate?: number;
    notes?: string;
    deliveryDate?: string;
    paymentMethod?: PaymentMethod;
    paymentStatus?: string;
    paidAmount?: number;
    remainingAmount?: number;
}
export declare class UpdateInvoiceDto {
    customerName?: string;
    customerPhone?: string;
    customerAddress?: string;
    items?: InvoiceItemDto[];
    taxRate?: number;
    discountRate?: number;
    notes?: string;
    deliveryDate?: string;
    paymentMethod?: PaymentMethod;
    status?: string;
    paymentStatus?: string;
    paidAmount?: number;
    remainingAmount?: number;
}
export declare class UpdateInvoiceStatusDto {
    status: string;
    notes?: string;
}
export declare class UpdatePaymentStatusDto {
    paymentStatus: string;
    paidAmount?: number;
    remainingAmount?: number;
    notes?: string;
}
export declare class PaymentDto {
    amount: number;
    notes?: string;
    paymentMethod?: PaymentMethod;
}
export declare class UpdateItemDeliveryDto {
    deliveredQuantity: number;
    notes?: string;
}
export declare class InvoiceQueryDto {
    status?: string;
    paymentStatus?: string;
    paymentMethod?: PaymentMethod;
    customerName?: string;
    invoiceNumber?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}
