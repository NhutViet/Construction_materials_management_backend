import { Model } from 'mongoose';
import { Invoice } from '../models/invoice.model';
import { Material } from '../models/material.model';
import { CreateInvoiceDto, UpdateInvoiceDto, UpdateInvoiceStatusDto, UpdatePaymentStatusDto, InvoiceQueryDto } from '../dto/invoice.dto';
export declare class InvoiceService {
    private invoiceModel;
    private materialModel;
    private readonly logger;
    constructor(invoiceModel: Model<Invoice>, materialModel: Model<Material>);
    private generateInvoiceNumber;
    private calculateInvoiceValues;
    create(createInvoiceDto: CreateInvoiceDto, userId: string): Promise<Invoice>;
    findAll(query: InvoiceQueryDto): Promise<{
        invoices: Invoice[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<Invoice>;
    findByInvoiceNumber(invoiceNumber: string): Promise<Invoice>;
    update(id: string, updateInvoiceDto: UpdateInvoiceDto): Promise<Invoice>;
    updateStatus(id: string, updateStatusDto: UpdateInvoiceStatusDto, userId: string): Promise<Invoice>;
    updatePaymentStatus(id: string, updatePaymentDto: UpdatePaymentStatusDto): Promise<Invoice>;
    remove(id: string): Promise<void>;
    getStatistics(startDate?: string, endDate?: string): Promise<{
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
}
