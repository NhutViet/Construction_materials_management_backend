export declare class AnalyticsQueryDto {
    startDate?: string;
    endDate?: string;
    format?: 'json' | 'csv';
    category?: string;
    supplier?: string;
    customerId?: string;
}
export declare class DateRangeDto {
    startDate?: string;
    endDate?: string;
}
export declare class QuickStatsDto {
    period?: 'today' | 'week' | 'month' | 'quarter' | 'year';
}
export declare class RevenueAnalyticsDto {
    totalRevenue: number;
    revenueByMonth: Array<{
        _id: {
            year: number;
            month: number;
        };
        revenue: number;
        count: number;
    }>;
    averageOrderValue: {
        avgOrderValue: number;
        minOrderValue: number;
        maxOrderValue: number;
    };
    revenueGrowth: {
        current: number;
        previous: number;
        growthRate: number;
        growthAmount: number;
    };
    paymentMethodRevenue: Array<{
        _id: string;
        totalRevenue: number;
        count: number;
        avgValue: number;
    }>;
}
export declare class PaymentAnalyticsDto {
    paymentStatusStats: Array<{
        _id: string;
        count: number;
        totalAmount: number;
        paidAmount: number;
        remainingAmount: number;
    }>;
    debtAnalysis: {
        totalDebt: number;
        avgDebtPerInvoice: number;
        maxDebt: number;
        debtCount: number;
    };
    paymentMethodStats: Array<{
        _id: string;
        count: number;
        totalAmount: number;
        avgAmount: number;
    }>;
    overdueInvoices: {
        count: number;
        totalAmount: number;
    };
}
export declare class InventoryAnalyticsDto {
    inventoryOverview: {
        totalItems: number;
        totalQuantity: number;
        avgQuantity: number;
        totalValue: number;
    };
    lowStockItems: Array<{
        _id: string;
        name: string;
        quantity: number;
        price: number;
        category: string;
    }>;
    topSellingMaterials: Array<{
        _id: {
            materialId: string;
            materialName: string;
        };
        totalQuantity: number;
        totalRevenue: number;
        orderCount: number;
    }>;
    slowMovingItems: Array<{
        _id: {
            materialId: string;
            materialName: string;
        };
        totalQuantity: number;
        totalRevenue: number;
        orderCount: number;
        lastOrderDate: Date;
    }>;
    categoryAnalysis: Array<{
        _id: string;
        count: number;
        totalQuantity: number;
        totalValue: number;
        avgPrice: number;
    }>;
    inventoryValue: number;
}
export declare class CustomerAnalyticsDto {
    customerOverview: {
        totalCustomers: number;
        totalInvoices: number;
        avgInvoicesPerCustomer: number;
    };
    topCustomers: Array<{
        _id: {
            customerId: string;
            customerName: string;
            customerPhone: string;
            customerAddress: string;
        };
        totalSpent: number;
        invoiceCount: number;
        avgOrderValue: number;
        lastOrderDate: Date;
        firstOrderDate: Date;
        totalPaid: number;
        totalDebt: number;
    }>;
    customerSegments: Array<{
        _id: string;
        count: number;
        avgSpent: number;
        avgOrders: number;
    }>;
    customerRetention: {
        retentionRate: number;
        newCustomers: number;
        returningCustomers: number;
    };
    newVsReturningCustomers: {
        newCustomers: number;
        returningCustomers: number;
    };
    customerDetails: Array<{
        _id: {
            customerId: string;
            customerName: string;
            customerPhone: string;
            customerAddress: string;
        };
        totalSpent: number;
        invoiceCount: number;
        avgOrderValue: number;
        lastOrderDate: Date;
        firstOrderDate: Date;
        totalPaid: number;
        totalDebt: number;
        unpaidInvoices: number;
        partialInvoices: number;
        paidInvoices: number;
    }>;
    customerPaymentAnalysis: Array<{
        _id: string;
        totalDebt: number;
        avgDebt: number;
        maxDebt: number;
        debtInvoices: number;
    }>;
    summary: {
        totalCustomers: number;
        totalRevenue: number;
        totalDebt: number;
        avgCustomerValue: number;
    };
}
export declare class StockInAnalyticsDto {
    stockInOverview: {
        totalStockIns: number;
        totalAmount: number;
        paidAmount: number;
        remainingAmount: number;
        avgAmount: number;
    };
    supplierAnalysis: Array<{
        _id: string;
        count: number;
        totalAmount: number;
        avgAmount: number;
        lastOrderDate: Date;
    }>;
    paymentStatusAnalysis: Array<{
        _id: string;
        count: number;
        totalAmount: number;
        paidAmount: number;
        remainingAmount: number;
    }>;
    processingTimeAnalysis: Array<{
        _id: null;
        avgProcessingTime: number;
        minProcessingTime: number;
        maxProcessingTime: number;
    }>;
}
export declare class TimeBasedAnalyticsDto {
    dailyTrends: Array<{
        _id: {
            year: number;
            month: number;
            day: number;
        };
        revenue: number;
        orders: number;
    }>;
    weeklyTrends: Array<{
        _id: {
            year: number;
            week: number;
        };
        revenue: number;
        orders: number;
    }>;
    monthlyTrends: Array<{
        _id: {
            year: number;
            month: number;
        };
        revenue: number;
        orders: number;
    }>;
    seasonalAnalysis: Array<{
        _id: number;
        revenue: number;
        orders: number;
    }>;
    yearOverYearComparison: {
        currentYear: {
            year: number;
            revenue: number;
            orders: number;
        };
        lastYear: {
            year: number;
            revenue: number;
            orders: number;
        };
        revenueGrowth: number;
        orderGrowth: number;
    };
}
export declare class DashboardDataDto {
    financialSummary: {
        totalRevenue: number;
        totalOrders: number;
        averageOrderValue: number;
    };
    inventorySummary: {
        totalItems: number;
        lowStockCount: number;
        totalValue: number;
    };
    customerSummary: {
        totalCustomers: number;
        newCustomers: number;
    };
    stockInSummary: {
        totalStockIns: number;
        pendingCount: number;
        totalAmount: number;
    };
    alerts: {
        lowStockItems: Array<any>;
        overdueInvoices: Array<any>;
        pendingStockIns: Array<any>;
        totalAlerts: number;
    };
    lastUpdated: Date;
}
