import { InvoiceService } from '../services/invoice.service';
import { CreateInvoiceDto, UpdateInvoiceDto, UpdateInvoiceStatusDto, UpdatePaymentStatusDto, InvoiceQueryDto } from '../dto/invoice.dto';
import { PaymentMethod } from '../constants/payment.constants';
export declare class InvoiceController {
    private readonly invoiceService;
    private readonly logger;
    constructor(invoiceService: InvoiceService);
    create(createInvoiceDto: CreateInvoiceDto, user: any): Promise<import("../models/invoice.model").Invoice>;
    findAll(query: InvoiceQueryDto, user: any): Promise<{
        invoices: import("../models/invoice.model").Invoice[];
        total: number;
        page: number;
        limit: number;
    }>;
    getStatistics(user: any, startDate?: string, endDate?: string): Promise<{
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
    findByInvoiceNumber(invoiceNumber: string, user: any): Promise<import("../models/invoice.model").Invoice>;
    findPending(user: any): Promise<{
        invoices: import("../models/invoice.model").Invoice[];
        total: number;
        page: number;
        limit: number;
    }>;
    findConfirmed(user: any): Promise<{
        invoices: import("../models/invoice.model").Invoice[];
        total: number;
        page: number;
        limit: number;
    }>;
    findDelivered(user: any): Promise<{
        invoices: import("../models/invoice.model").Invoice[];
        total: number;
        page: number;
        limit: number;
    }>;
    findUnpaid(user: any): Promise<{
        invoices: import("../models/invoice.model").Invoice[];
        total: number;
        page: number;
        limit: number;
    }>;
    findPaid(user: any): Promise<{
        invoices: import("../models/invoice.model").Invoice[];
        total: number;
        page: number;
        limit: number;
    }>;
    findByPaymentMethod(method: string, user: any): Promise<{
        invoices: import("../models/invoice.model").Invoice[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string, user: any): Promise<import("../models/invoice.model").Invoice>;
    update(id: string, updateInvoiceDto: UpdateInvoiceDto, user: any): Promise<import("../models/invoice.model").Invoice>;
    updateStatus(id: string, updateStatusDto: UpdateInvoiceStatusDto, user: any): Promise<import("../models/invoice.model").Invoice>;
    updatePaymentStatus(id: string, updatePaymentDto: UpdatePaymentStatusDto, user: any): Promise<import("../models/invoice.model").Invoice>;
    remove(id: string, user: any): Promise<void>;
    getInvoiceForPrint(id: string, user: any): Promise<import("../models/invoice.model").Invoice>;
    sendInvoiceByEmail(id: string, emailData: {
        email: string;
    }): {
        message: string;
    };
    exportInvoiceToPDF(id: string): {
        message: string;
    };
}
