import { InvoiceService } from '../services/invoice.service';
import { CreateInvoiceDto, UpdateInvoiceDto, UpdateInvoiceStatusDto, UpdatePaymentStatusDto, InvoiceQueryDto, PaymentDto, UpdateItemDeliveryDto } from '../dto/invoice.dto';
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
    makePayment(id: string, paymentDto: PaymentDto, user: any): Promise<import("../models/invoice.model").Invoice>;
    debugInvoice(id: string, user: any): Promise<import("../models/invoice.model").Invoice>;
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
    updateItemDelivery(id: string, itemIndex: string, updateDeliveryDto: UpdateItemDeliveryDto, user: any): Promise<import("../models/invoice.model").Invoice>;
    getDeliveryStatus(id: string, user: any): Promise<{
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
            deliveryStatus: "pending" | "delivered" | "partial";
            deliveredAt: Date | undefined;
            unit: string;
        }[];
    }>;
    getDeliveredAmount(id: string, user: any): Promise<{
        invoiceId: unknown;
        invoiceNumber: string;
        customerName: string;
        totalOrderedAmount: number;
        originalTotalAmount: number;
        deliveredAmount: number;
        remainingAmount: number;
        totalOrderedQuantity: number;
        totalDeliveredQuantity: number;
        deliveryPercentage: number;
        deliveredAmountPercentage: number;
        deliveredItems: any[];
        priceInfo: {
            hasPriceAdjustment: boolean;
            priceAdjustmentAmount: number;
            priceAdjustmentReason: string | undefined;
            priceAdjustedAt: Date | undefined;
        };
        summary: {
            totalItems: number;
            deliveredItems: number;
            pendingItems: number;
            partialItems: number;
            fullyDeliveredItems: number;
        };
    }>;
}
