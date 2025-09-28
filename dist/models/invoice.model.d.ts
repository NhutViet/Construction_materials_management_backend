import { Document, Types } from 'mongoose';
import { PaymentMethod } from '../constants/payment.constants';
export interface InvoiceItem {
    materialId: Types.ObjectId;
    materialName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    unit: string;
    deliveredQuantity?: number;
    deliveryStatus?: 'pending' | 'partial' | 'delivered';
    deliveredAt?: Date;
    deliveredBy?: Types.ObjectId;
}
export declare class Invoice extends Document {
    invoiceNumber: string;
    customerId: Types.ObjectId;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    items: InvoiceItem[];
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    discountRate: number;
    discountAmount: number;
    totalAmount: number;
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
    paymentMethod: PaymentMethod;
    paymentStatus: 'unpaid' | 'partial' | 'paid';
    paidAmount: number;
    remainingAmount: number;
    notes: string;
    deliveryDate: Date;
    createdBy: Types.ObjectId;
    approvedBy: Types.ObjectId;
    approvedAt: Date;
    isDeleted: boolean;
}
export declare const InvoiceSchema: import("mongoose").Schema<Invoice, import("mongoose").Model<Invoice, any, any, any, Document<unknown, any, Invoice, any, {}> & Invoice & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Invoice, Document<unknown, {}, import("mongoose").FlatRecord<Invoice>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Invoice> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
