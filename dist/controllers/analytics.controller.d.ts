import { AnalyticsService } from '../services/analytics.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    private readonly logger;
    constructor(analyticsService: AnalyticsService);
    getRevenueAnalytics(user: any, startDate?: string, endDate?: string): Promise<{
        totalRevenue: any;
        revenueByMonth: any[];
        averageOrderValue: any;
        revenueGrowth: {
            current: any;
            previous: any;
            growthRate: number;
            growthAmount: number;
        };
        paymentMethodRevenue: any[];
    }>;
    getPaymentAnalytics(user: any, startDate?: string, endDate?: string): Promise<{
        paymentStatusStats: any[];
        debtAnalysis: any;
        paymentMethodStats: any[];
        overdueInvoices: any;
    }>;
    getInventoryAnalytics(user: any): Promise<{
        inventoryOverview: any;
        lowStockItems: (import("mongoose").Document<unknown, {}, import("../models/material.model").MaterialDocument, {}, {}> & import("../models/material.model").Material & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        })[];
        topSellingMaterials: any[];
        slowMovingItems: any[];
        categoryAnalysis: any[];
        inventoryValue: any;
    }>;
    getCustomerAnalytics(user: any, startDate?: string, endDate?: string): Promise<{
        customerOverview: any;
        topCustomers: any[];
        customerSegments: any[];
        customerRetention: {
            retentionRate: number;
            newCustomers: number;
            returningCustomers: number;
        };
        newVsReturningCustomers: {
            newCustomers: number;
            returningCustomers: number;
        };
        customerDetails: any[];
        customerPaymentAnalysis: any[];
        summary: {
            totalCustomers: number;
            totalRevenue: any;
            totalDebt: any;
            avgCustomerValue: number;
        };
    }>;
    getCustomerList(user: any, startDate?: string, endDate?: string, sortBy?: 'totalSpent' | 'invoiceCount' | 'lastOrderDate' | 'totalDebt', sortOrder?: 'asc' | 'desc', limit?: number): Promise<{
        customers: any[];
        pagination: {
            total: any;
            limit: number;
            page: number;
            hasMore: boolean;
        };
        summary: {
            totalCustomers: any;
            totalRevenue: any;
            totalDebt: any;
            avgCustomerValue: number;
        };
    }>;
    getCustomerRegionAnalytics(user: any, startDate?: string, endDate?: string): Promise<{
        regionStats: any[];
        topRegions: any[];
        regionRevenue: any[];
        regionGrowth: {
            region: any;
            currentCustomers: any;
            previousCustomers: any;
            customerGrowth: number;
            currentRevenue: any;
            previousRevenue: any;
            revenueGrowth: number;
        }[];
        summary: {
            totalRegions: number;
            totalCustomers: any;
            totalRevenue: any;
            avgCustomersPerRegion: number;
        };
    }>;
    getCustomerListByRegion(user: any, region?: string, startDate?: string, endDate?: string, sortBy?: 'customerCount' | 'totalRevenue' | 'totalOrders', sortOrder?: 'asc' | 'desc', limit?: number): Promise<{
        regions: any[];
        pagination: {
            total: any;
            limit: number;
            page: number;
            hasMore: boolean;
        };
        summary: {
            totalRegions: any;
            totalCustomers: any;
            totalRevenue: any;
            avgCustomersPerRegion: number;
        };
    }>;
    getStockInAnalytics(user: any, startDate?: string, endDate?: string): Promise<{
        stockInOverview: any;
        supplierAnalysis: any[];
        paymentStatusAnalysis: any[];
        processingTimeAnalysis: any[];
    }>;
    getTimeBasedAnalytics(user: any, startDate?: string, endDate?: string): Promise<{
        dailyTrends: any[];
        weeklyTrends: any[];
        monthlyTrends: any[];
        seasonalAnalysis: any[];
        yearOverYearComparison: {
            currentYear: any;
            lastYear: any;
            revenueGrowth: number;
            orderGrowth: number;
        };
    }>;
    getDashboardData(user: any, startDate?: string, endDate?: string): Promise<{
        financialSummary: {
            totalRevenue: any;
            totalOrders: number;
            averageOrderValue: any;
        };
        inventorySummary: {
            totalItems: number;
            lowStockCount: number;
            totalValue: any;
        };
        customerSummary: {
            totalCustomers: number;
            newCustomers: number;
        };
        stockInSummary: {
            totalStockIns: number;
            pendingCount: number;
            totalAmount: any;
        };
        alerts: {
            lowStockItems: (import("mongoose").Document<unknown, {}, import("../models/material.model").MaterialDocument, {}, {}> & import("../models/material.model").Material & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
                _id: unknown;
            }> & {
                __v: number;
            })[];
            overdueInvoices: (import("mongoose").Document<unknown, {}, import("../models/invoice.model").Invoice, {}, {}> & import("../models/invoice.model").Invoice & Required<{
                _id: unknown;
            }> & {
                __v: number;
            })[];
            pendingStockIns: (import("mongoose").Document<unknown, {}, import("../models/stock-in.model").StockInDocument, {}, {}> & import("../models/stock-in.model").StockIn & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
                _id: unknown;
            }> & {
                __v: number;
            })[];
            totalAlerts: number;
        };
        lastUpdated: Date;
    }>;
    getFinancialReport(user: any, startDate?: string, endDate?: string, format?: 'json' | 'csv'): Promise<{
        totalRevenue: any;
        revenueByMonth: any[];
        averageOrderValue: any;
        revenueGrowth: {
            current: any;
            previous: any;
            growthRate: number;
            growthAmount: number;
        };
        paymentMethodRevenue: any[];
    }>;
    getInventoryReport(user: any, format?: 'json' | 'csv'): Promise<{
        inventoryOverview: any;
        lowStockItems: (import("mongoose").Document<unknown, {}, import("../models/material.model").MaterialDocument, {}, {}> & import("../models/material.model").Material & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        })[];
        topSellingMaterials: any[];
        slowMovingItems: any[];
        categoryAnalysis: any[];
        inventoryValue: any;
    }>;
    getCustomerReport(user: any, startDate?: string, endDate?: string, format?: 'json' | 'csv'): Promise<{
        customerOverview: any;
        topCustomers: any[];
        customerSegments: any[];
        customerRetention: {
            retentionRate: number;
            newCustomers: number;
            returningCustomers: number;
        };
        newVsReturningCustomers: {
            newCustomers: number;
            returningCustomers: number;
        };
        customerDetails: any[];
        customerPaymentAnalysis: any[];
        summary: {
            totalCustomers: number;
            totalRevenue: any;
            totalDebt: any;
            avgCustomerValue: number;
        };
    }>;
    getStockInReport(user: any, startDate?: string, endDate?: string, format?: 'json' | 'csv'): Promise<{
        stockInOverview: any;
        supplierAnalysis: any[];
        paymentStatusAnalysis: any[];
        processingTimeAnalysis: any[];
    }>;
    getQuickStats(user: any): Promise<{
        financialSummary: {
            totalRevenue: any;
            totalOrders: number;
            averageOrderValue: any;
        };
        inventorySummary: {
            totalItems: number;
            lowStockCount: number;
            totalValue: any;
        };
        customerSummary: {
            totalCustomers: number;
            newCustomers: number;
        };
        stockInSummary: {
            totalStockIns: number;
            pendingCount: number;
            totalAmount: any;
        };
        alerts: {
            lowStockItems: (import("mongoose").Document<unknown, {}, import("../models/material.model").MaterialDocument, {}, {}> & import("../models/material.model").Material & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
                _id: unknown;
            }> & {
                __v: number;
            })[];
            overdueInvoices: (import("mongoose").Document<unknown, {}, import("../models/invoice.model").Invoice, {}, {}> & import("../models/invoice.model").Invoice & Required<{
                _id: unknown;
            }> & {
                __v: number;
            })[];
            pendingStockIns: (import("mongoose").Document<unknown, {}, import("../models/stock-in.model").StockInDocument, {}, {}> & import("../models/stock-in.model").StockIn & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
                _id: unknown;
            }> & {
                __v: number;
            })[];
            totalAlerts: number;
        };
        lastUpdated: Date;
    }>;
    getAlerts(user: any): Promise<{
        lowStockItems: (import("mongoose").Document<unknown, {}, import("../models/material.model").MaterialDocument, {}, {}> & import("../models/material.model").Material & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        })[];
        overdueInvoices: (import("mongoose").Document<unknown, {}, import("../models/invoice.model").Invoice, {}, {}> & import("../models/invoice.model").Invoice & Required<{
            _id: unknown;
        }> & {
            __v: number;
        })[];
        pendingStockIns: (import("mongoose").Document<unknown, {}, import("../models/stock-in.model").StockInDocument, {}, {}> & import("../models/stock-in.model").StockIn & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        })[];
        totalAlerts: number;
    }>;
}
