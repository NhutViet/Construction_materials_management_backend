import { Model } from 'mongoose';
import { Material, MaterialDocument } from '../models/material.model';
import { Invoice } from '../models/invoice.model';
import { StockIn, StockInDocument } from '../models/stock-in.model';
import { UserDocument } from '../models/user.model';
export declare class AnalyticsService {
    private materialModel;
    private invoiceModel;
    private stockInModel;
    private userModel;
    private readonly logger;
    constructor(materialModel: Model<MaterialDocument>, invoiceModel: Model<Invoice>, stockInModel: Model<StockInDocument>, userModel: Model<UserDocument>);
    getRevenueAnalytics(userId: string, startDate?: string, endDate?: string): Promise<{
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
    getPaymentAnalytics(userId: string, startDate?: string, endDate?: string): Promise<{
        paymentStatusStats: any[];
        debtAnalysis: any;
        paymentMethodStats: any[];
        overdueInvoices: any;
        totalPaidAmount: any;
        debtByCustomer: any[];
        paymentHistory: any[];
        summary: {
            totalDebt: any;
            totalPaid: any;
            totalRevenue: any;
            paymentRate: any;
            debtRate: number;
        };
    }>;
    getDebtAnalytics(userId: string, startDate?: string, endDate?: string): Promise<{
        debtOverview: any;
        debtByCustomer: any[];
        debtByStatus: any[];
        debtByTimeRange: any[];
        topDebtCustomers: any[];
        debtAging: any[];
        summary: {
            totalDebt: any;
            totalDebtCustomers: number;
            avgDebtPerCustomer: number;
        };
    }>;
    getPaymentHistoryAnalytics(userId: string, startDate?: string, endDate?: string): Promise<{
        paymentOverview: any;
        paymentByMethod: any[];
        paymentByTimeRange: any[];
        paymentByCustomer: any[];
        recentPayments: (import("mongoose").Document<unknown, {}, Invoice, {}, {}> & Invoice & Required<{
            _id: unknown;
        }> & {
            __v: number;
        })[];
        summary: {
            totalPaid: any;
            totalRevenue: any;
            paymentRate: any;
            totalCustomers: number;
        };
    }>;
    getOverdueDebtReport(userId: string, daysOverdue?: number): Promise<{
        overdueOverview: any;
        overdueByCustomer: any[];
        overdueByTimeRange: any[];
        criticalOverdue: (import("mongoose").Document<unknown, {}, Invoice, {}, {}> & Invoice & Required<{
            _id: unknown;
        }> & {
            __v: number;
        })[];
        summary: {
            totalOverdueAmount: any;
            totalOverdueInvoices: any;
            totalOverdueCustomers: number;
            criticalOverdueCount: number;
        };
    }>;
    getInventoryAnalytics(userId: string): Promise<{
        inventoryOverview: any;
        lowStockItems: (import("mongoose").Document<unknown, {}, MaterialDocument, {}, {}> & Material & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        })[];
        topSellingMaterials: any[];
        slowMovingItems: any[];
        categoryAnalysis: any[];
        inventoryValue: any;
    }>;
    getCustomerAnalytics(userId: string, startDate?: string, endDate?: string): Promise<{
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
    getCustomerList(userId: string, startDate?: string, endDate?: string, sortBy?: 'totalSpent' | 'invoiceCount' | 'lastOrderDate' | 'totalDebt', sortOrder?: 'asc' | 'desc', limit?: number): Promise<{
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
    getStockInAnalytics(userId: string, startDate?: string, endDate?: string): Promise<{
        stockInOverview: any;
        supplierAnalysis: any[];
        paymentStatusAnalysis: any[];
        processingTimeAnalysis: any[];
        paymentSummary: {
            summary: {
                totalAmount: any;
                totalPaid: any;
                totalRemaining: any;
                totalCount: any;
                paymentRate: number;
                debtRate: number;
                avgAmount: any;
                avgPaid: any;
                avgRemaining: any;
            };
            paid: {
                amount: any;
                count: any;
                avgAmount: any;
                percentage: number;
            };
            unpaid: {
                amount: any;
                count: any;
                avgAmount: any;
                percentage: number;
            };
            partial: {
                amount: any;
                paidAmount: any;
                remainingAmount: any;
                count: any;
                avgAmount: any;
                avgPaid: any;
                avgRemaining: any;
                percentage: number;
            };
            trends: any[];
        };
    }>;
    getTimeBasedAnalytics(userId: string, startDate?: string, endDate?: string): Promise<{
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
    getDashboardData(userId: string, startDate?: string, endDate?: string): Promise<{
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
            lowStockItems: (import("mongoose").Document<unknown, {}, MaterialDocument, {}, {}> & Material & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
                _id: unknown;
            }> & {
                __v: number;
            })[];
            overdueInvoices: (import("mongoose").Document<unknown, {}, Invoice, {}, {}> & Invoice & Required<{
                _id: unknown;
            }> & {
                __v: number;
            })[];
            pendingStockIns: (import("mongoose").Document<unknown, {}, StockInDocument, {}, {}> & StockIn & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
                _id: unknown;
            }> & {
                __v: number;
            })[];
            totalAlerts: number;
        };
        lastUpdated: Date;
    }>;
    getCustomerRegionAnalytics(userId: string, startDate?: string, endDate?: string): Promise<{
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
    getCustomerListByRegion(userId: string, region?: string, startDate?: string, endDate?: string, sortBy?: 'customerCount' | 'totalRevenue' | 'totalOrders', sortOrder?: 'asc' | 'desc', limit?: number): Promise<{
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
    getStockInPaymentSummary(userId: string, startDate?: string, endDate?: string): Promise<{
        summary: {
            totalAmount: any;
            totalPaid: any;
            totalRemaining: any;
            totalCount: any;
            paymentRate: number;
            debtRate: number;
            avgAmount: any;
            avgPaid: any;
            avgRemaining: any;
        };
        paid: {
            amount: any;
            count: any;
            avgAmount: any;
            percentage: number;
        };
        unpaid: {
            amount: any;
            count: any;
            avgAmount: any;
            percentage: number;
        };
        partial: {
            amount: any;
            paidAmount: any;
            remainingAmount: any;
            count: any;
            avgAmount: any;
            avgPaid: any;
            avgRemaining: any;
            percentage: number;
        };
        trends: any[];
    }>;
    private buildDateFilter;
    private getRevenueGrowth;
    private getTopSellingMaterials;
    private getSlowMovingMaterials;
    private getCustomerSegments;
    private getCustomerRetention;
    private getNewVsReturningCustomers;
    private getProcessingTimeAnalysis;
    private getStockInPaymentSummaryData;
    private getDailyTrends;
    private getWeeklyTrends;
    private getMonthlyTrends;
    private getSeasonalAnalysis;
    private getYearOverYearComparison;
    private getFinancialSummary;
    private getInventorySummary;
    private getCustomerSummary;
    private getStockInSummary;
    private getAlerts;
    private getRegionGrowth;
    private getDebtAging;
    private processRegionData;
}
