import { Model } from 'mongoose';
import { Invoice } from '../models/invoice.model';
import { Material } from '../models/material.model';
import { CreateInvoiceDto, UpdateInvoiceDto, UpdateInvoiceStatusDto, UpdatePaymentStatusDto, InvoiceQueryDto, PaymentDto, UpdateItemDeliveryDto } from '../dto/invoice.dto';
export declare class InvoiceService {
    private invoiceModel;
    private materialModel;
    private readonly logger;
    constructor(invoiceModel: Model<Invoice>, materialModel: Model<Material>);
    private generateInvoiceNumber;
    private calculateInvoiceValues;
    private checkInventoryAvailability;
    private updateMaterialInventory;
    create(createInvoiceDto: CreateInvoiceDto, userId: string): Promise<Invoice>;
    findAll(query: InvoiceQueryDto, userId: string): Promise<{
        invoices: Invoice[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string, userId: string): Promise<Invoice>;
    findByInvoiceNumber(invoiceNumber: string, userId: string): Promise<Invoice>;
    update(id: string, updateInvoiceDto: UpdateInvoiceDto, userId: string): Promise<Invoice>;
    updateStatus(id: string, updateStatusDto: UpdateInvoiceStatusDto, userId: string): Promise<Invoice>;
    makePayment(id: string, paymentDto: PaymentDto, userId: string): Promise<Invoice>;
    updatePaymentStatus(id: string, updatePaymentDto: UpdatePaymentStatusDto, userId: string): Promise<Invoice>;
    remove(id: string, userId: string): Promise<void>;
    getStatistics(userId: string, startDate?: string, endDate?: string): Promise<{
        totalInvoices: number;
        totalRevenue: any;
        pendingInvoices: number;
        confirmedInvoices: number;
        deliveredInvoices: number;
        cancelledInvoices: number;
        unpaidInvoices: number;
        paidInvoices: number;
        paymentMethods: {};
    }>;
    updateItemDelivery(invoiceId: string, itemIndex: number, updateDeliveryDto: UpdateItemDeliveryDto, userId: string): Promise<Invoice>;
    getDeliveryStatus(invoiceId: string, userId: string): Promise<{
        totalItems: number;
        deliveredItems: number;
        partialItems: number;
        pendingItems: number;
        totalQuantity: number;
        deliveredQuantity: number;
        remainingQuantity: number;
        items: {
            index: number;
            materialName: string;
            quantity: number;
            deliveredQuantity: number;
            remainingQuantity: number;
            deliveryStatus: "pending" | "partial" | "delivered";
            deliveredAt: Date | undefined;
            unit: string;
        }[];
    }>;
    getDeliveredAmount(invoiceId: string, userId: string): Promise<{
        invoiceId: unknown;
        invoiceNumber: string;
        customerName: string;
        totalOrderedAmount: number;
        deliveredAmount: number;
        remainingAmount: number;
        totalOrderedQuantity: number;
        totalDeliveredQuantity: number;
        deliveryPercentage: number;
        deliveredAmountPercentage: number;
        deliveredItems: any[];
        summary: {
            totalItems: number;
            deliveredItems: number;
            pendingItems: number;
            partialItems: number;
            fullyDeliveredItems: number;
        };
    }>;
}
