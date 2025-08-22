import { InvoiceService } from '../services/invoice.service';
import { CreateInvoiceDto, UpdateInvoiceDto, UpdateInvoiceStatusDto, UpdatePaymentStatusDto, InvoiceQueryDto } from '../dto/invoice.dto';
import { PaymentMethod } from '../constants/payment.constants';
export declare class InvoiceController {
    private readonly invoiceService;
    private readonly logger;
    constructor(invoiceService: InvoiceService);
    create(createInvoiceDto: CreateInvoiceDto, user: any): Promise<import("../models/invoice.model").Invoice>;
    findAll(query: InvoiceQueryDto): Promise<{
        invoices: import("../models/invoice.model").Invoice[];
        total: number;
        page: number;
        limit: number;
    }>;
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
    getPaymentMethods(): {
        methods: {
            value: PaymentMethod;
            label: string;
        }[];
    };
    findByInvoiceNumber(invoiceNumber: string): Promise<import("../models/invoice.model").Invoice>;
    findPending(): Promise<{
        invoices: import("../models/invoice.model").Invoice[];
        total: number;
        page: number;
        limit: number;
    }>;
    findConfirmed(): Promise<{
        invoices: import("../models/invoice.model").Invoice[];
        total: number;
        page: number;
        limit: number;
    }>;
    findDelivered(): Promise<{
        invoices: import("../models/invoice.model").Invoice[];
        total: number;
        page: number;
        limit: number;
    }>;
    findUnpaid(): Promise<{
        invoices: import("../models/invoice.model").Invoice[];
        total: number;
        page: number;
        limit: number;
    }>;
    findPaid(): Promise<{
        invoices: import("../models/invoice.model").Invoice[];
        total: number;
        page: number;
        limit: number;
    }>;
    findByPaymentMethod(method: string): Promise<{
        invoices: import("../models/invoice.model").Invoice[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<import("../models/invoice.model").Invoice>;
    update(id: string, updateInvoiceDto: UpdateInvoiceDto): Promise<import("../models/invoice.model").Invoice>;
    updateStatus(id: string, updateStatusDto: UpdateInvoiceStatusDto, user: any): Promise<import("../models/invoice.model").Invoice>;
    updatePaymentStatus(id: string, updatePaymentDto: UpdatePaymentStatusDto): Promise<import("../models/invoice.model").Invoice>;
    remove(id: string): Promise<void>;
    getInvoiceForPrint(id: string): Promise<import("../models/invoice.model").Invoice>;
    sendInvoiceByEmail(id: string, emailData: {
        email: string;
    }): {
        message: string;
    };
    exportInvoiceToPDF(id: string): {
        message: string;
    };
}
