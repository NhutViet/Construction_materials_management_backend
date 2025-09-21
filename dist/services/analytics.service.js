"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AnalyticsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const material_model_1 = require("../models/material.model");
const invoice_model_1 = require("../models/invoice.model");
const stock_in_model_1 = require("../models/stock-in.model");
const user_model_1 = require("../models/user.model");
let AnalyticsService = AnalyticsService_1 = class AnalyticsService {
    materialModel;
    invoiceModel;
    stockInModel;
    userModel;
    logger = new common_1.Logger(AnalyticsService_1.name);
    constructor(materialModel, invoiceModel, stockInModel, userModel) {
        this.materialModel = materialModel;
        this.invoiceModel = invoiceModel;
        this.stockInModel = stockInModel;
        this.userModel = userModel;
    }
    async getRevenueAnalytics(userId, startDate, endDate) {
        this.logger.log(`📊 Lấy thống kê doanh thu cho user: ${userId}`);
        const filter = this.buildDateFilter(userId, startDate, endDate);
        const [totalRevenue, revenueByMonth, averageOrderValue, revenueGrowth, paymentMethodRevenue] = await Promise.all([
            this.invoiceModel.aggregate([
                { $match: { ...filter, status: { $ne: 'cancelled' } } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]),
            this.invoiceModel.aggregate([
                { $match: { ...filter, status: { $ne: 'cancelled' } } },
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' }
                        },
                        revenue: { $sum: '$totalAmount' },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ]),
            this.invoiceModel.aggregate([
                { $match: { ...filter, status: { $ne: 'cancelled' } } },
                {
                    $group: {
                        _id: null,
                        avgOrderValue: { $avg: '$totalAmount' },
                        minOrderValue: { $min: '$totalAmount' },
                        maxOrderValue: { $max: '$totalAmount' }
                    }
                }
            ]),
            this.getRevenueGrowth(userId, startDate, endDate),
            this.invoiceModel.aggregate([
                { $match: { ...filter, status: { $ne: 'cancelled' } } },
                {
                    $group: {
                        _id: '$paymentMethod',
                        totalRevenue: { $sum: '$totalAmount' },
                        count: { $sum: 1 },
                        avgValue: { $avg: '$totalAmount' }
                    }
                }
            ])
        ]);
        return {
            totalRevenue: totalRevenue[0]?.total || 0,
            revenueByMonth,
            averageOrderValue: averageOrderValue[0] || { avgOrderValue: 0, minOrderValue: 0, maxOrderValue: 0 },
            revenueGrowth,
            paymentMethodRevenue
        };
    }
    async getPaymentAnalytics(userId, startDate, endDate) {
        this.logger.log(`💰 Lấy thống kê thanh toán cho user: ${userId}`);
        const filter = this.buildDateFilter(userId, startDate, endDate);
        const [paymentStatusStats, debtAnalysis, paymentMethodStats, overdueInvoices, totalPaidAmount, debtByCustomer, paymentHistory] = await Promise.all([
            this.invoiceModel.aggregate([
                { $match: { ...filter, status: { $ne: 'cancelled' } } },
                {
                    $group: {
                        _id: '$paymentStatus',
                        count: { $sum: 1 },
                        totalAmount: { $sum: '$totalAmount' },
                        paidAmount: { $sum: '$paidAmount' },
                        remainingAmount: { $sum: '$remainingAmount' }
                    }
                }
            ]),
            this.invoiceModel.aggregate([
                { $match: { ...filter, paymentStatus: { $in: ['unpaid', 'partial'] } } },
                {
                    $group: {
                        _id: null,
                        totalDebt: { $sum: '$remainingAmount' },
                        avgDebtPerInvoice: { $avg: '$remainingAmount' },
                        maxDebt: { $max: '$remainingAmount' },
                        minDebt: { $min: '$remainingAmount' },
                        debtCount: { $sum: 1 },
                        unpaidCount: {
                            $sum: { $cond: [{ $eq: ['$paymentStatus', 'unpaid'] }, 1, 0] }
                        },
                        partialCount: {
                            $sum: { $cond: [{ $eq: ['$paymentStatus', 'partial'] }, 1, 0] }
                        }
                    }
                }
            ]),
            this.invoiceModel.aggregate([
                { $match: { ...filter, status: { $ne: 'cancelled' } } },
                {
                    $group: {
                        _id: '$paymentMethod',
                        count: { $sum: 1 },
                        totalAmount: { $sum: '$totalAmount' },
                        paidAmount: { $sum: '$paidAmount' },
                        remainingAmount: { $sum: '$remainingAmount' },
                        avgAmount: { $avg: '$totalAmount' }
                    }
                }
            ]),
            this.invoiceModel.aggregate([
                {
                    $match: {
                        ...filter,
                        paymentStatus: { $in: ['unpaid', 'partial'] },
                        createdAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                    }
                },
                {
                    $group: {
                        _id: null,
                        count: { $sum: 1 },
                        totalAmount: { $sum: '$remainingAmount' },
                        avgAmount: { $avg: '$remainingAmount' }
                    }
                }
            ]),
            this.invoiceModel.aggregate([
                { $match: { ...filter, status: { $ne: 'cancelled' } } },
                {
                    $group: {
                        _id: null,
                        totalPaid: { $sum: '$paidAmount' },
                        totalRevenue: { $sum: '$totalAmount' },
                        paymentRate: { $avg: { $divide: ['$paidAmount', '$totalAmount'] } }
                    }
                }
            ]),
            this.invoiceModel.aggregate([
                { $match: { ...filter, paymentStatus: { $in: ['unpaid', 'partial'] } } },
                {
                    $group: {
                        _id: {
                            customerId: '$customerId',
                            customerName: '$customerName',
                            customerPhone: '$customerPhone'
                        },
                        totalDebt: { $sum: '$remainingAmount' },
                        invoiceCount: { $sum: 1 },
                        avgDebt: { $avg: '$remainingAmount' },
                        maxDebt: { $max: '$remainingAmount' },
                        lastOrderDate: { $max: '$createdAt' }
                    }
                },
                { $sort: { totalDebt: -1 } },
                { $limit: 20 }
            ]),
            this.invoiceModel.aggregate([
                { $match: { ...filter, status: { $ne: 'cancelled' } } },
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' }
                        },
                        totalRevenue: { $sum: '$totalAmount' },
                        totalPaid: { $sum: '$paidAmount' },
                        totalDebt: { $sum: '$remainingAmount' },
                        invoiceCount: { $sum: 1 }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ])
        ]);
        return {
            paymentStatusStats,
            debtAnalysis: debtAnalysis[0] || {
                totalDebt: 0,
                avgDebtPerInvoice: 0,
                maxDebt: 0,
                minDebt: 0,
                debtCount: 0,
                unpaidCount: 0,
                partialCount: 0
            },
            paymentMethodStats,
            overdueInvoices: overdueInvoices[0] || { count: 0, totalAmount: 0, avgAmount: 0 },
            totalPaidAmount: totalPaidAmount[0] || { totalPaid: 0, totalRevenue: 0, paymentRate: 0 },
            debtByCustomer,
            paymentHistory,
            summary: {
                totalDebt: debtAnalysis[0]?.totalDebt || 0,
                totalPaid: totalPaidAmount[0]?.totalPaid || 0,
                totalRevenue: totalPaidAmount[0]?.totalRevenue || 0,
                paymentRate: totalPaidAmount[0]?.paymentRate || 0,
                debtRate: totalPaidAmount[0]?.totalRevenue > 0 ?
                    (debtAnalysis[0]?.totalDebt || 0) / totalPaidAmount[0].totalRevenue : 0
            }
        };
    }
    async getDebtAnalytics(userId, startDate, endDate) {
        this.logger.log(`💳 Lấy thống kê nợ chi tiết cho user: ${userId}`);
        const filter = this.buildDateFilter(userId, startDate, endDate);
        const [debtOverview, debtByCustomer, debtByStatus, debtByTimeRange, topDebtCustomers, debtAging] = await Promise.all([
            this.invoiceModel.aggregate([
                { $match: { ...filter, paymentStatus: { $in: ['unpaid', 'partial'] } } },
                {
                    $group: {
                        _id: null,
                        totalDebt: { $sum: '$remainingAmount' },
                        totalInvoices: { $sum: 1 },
                        avgDebtPerInvoice: { $avg: '$remainingAmount' },
                        maxDebt: { $max: '$remainingAmount' },
                        minDebt: { $min: '$remainingAmount' },
                        unpaidCount: {
                            $sum: { $cond: [{ $eq: ['$paymentStatus', 'unpaid'] }, 1, 0] }
                        },
                        partialCount: {
                            $sum: { $cond: [{ $eq: ['$paymentStatus', 'partial'] }, 1, 0] }
                        }
                    }
                }
            ]),
            this.invoiceModel.aggregate([
                { $match: { ...filter, paymentStatus: { $in: ['unpaid', 'partial'] } } },
                {
                    $group: {
                        _id: {
                            customerId: '$customerId',
                            customerName: '$customerName',
                            customerPhone: '$customerPhone',
                            customerAddress: '$customerAddress'
                        },
                        totalDebt: { $sum: '$remainingAmount' },
                        invoiceCount: { $sum: 1 },
                        avgDebt: { $avg: '$remainingAmount' },
                        maxDebt: { $max: '$remainingAmount' },
                        lastOrderDate: { $max: '$createdAt' },
                        firstDebtDate: { $min: '$createdAt' },
                        unpaidInvoices: {
                            $sum: { $cond: [{ $eq: ['$paymentStatus', 'unpaid'] }, 1, 0] }
                        },
                        partialInvoices: {
                            $sum: { $cond: [{ $eq: ['$paymentStatus', 'partial'] }, 1, 0] }
                        }
                    }
                },
                { $sort: { totalDebt: -1 } }
            ]),
            this.invoiceModel.aggregate([
                { $match: { ...filter, paymentStatus: { $in: ['unpaid', 'partial'] } } },
                {
                    $group: {
                        _id: '$paymentStatus',
                        totalDebt: { $sum: '$remainingAmount' },
                        invoiceCount: { $sum: 1 },
                        avgDebt: { $avg: '$remainingAmount' }
                    }
                }
            ]),
            this.invoiceModel.aggregate([
                { $match: { ...filter, paymentStatus: { $in: ['unpaid', 'partial'] } } },
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' }
                        },
                        totalDebt: { $sum: '$remainingAmount' },
                        invoiceCount: { $sum: 1 },
                        avgDebt: { $avg: '$remainingAmount' }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ]),
            this.invoiceModel.aggregate([
                { $match: { ...filter, paymentStatus: { $in: ['unpaid', 'partial'] } } },
                {
                    $group: {
                        _id: {
                            customerId: '$customerId',
                            customerName: '$customerName',
                            customerPhone: '$customerPhone'
                        },
                        totalDebt: { $sum: '$remainingAmount' },
                        invoiceCount: { $sum: 1 },
                        lastOrderDate: { $max: '$createdAt' }
                    }
                },
                { $sort: { totalDebt: -1 } },
                { $limit: 10 }
            ]),
            this.getDebtAging(userId, startDate, endDate)
        ]);
        return {
            debtOverview: debtOverview[0] || {
                totalDebt: 0,
                totalInvoices: 0,
                avgDebtPerInvoice: 0,
                maxDebt: 0,
                minDebt: 0,
                unpaidCount: 0,
                partialCount: 0
            },
            debtByCustomer,
            debtByStatus,
            debtByTimeRange,
            topDebtCustomers,
            debtAging,
            summary: {
                totalDebt: debtOverview[0]?.totalDebt || 0,
                totalDebtCustomers: debtByCustomer.length,
                avgDebtPerCustomer: debtByCustomer.length > 0 ?
                    debtByCustomer.reduce((sum, c) => sum + c.totalDebt, 0) / debtByCustomer.length : 0
            }
        };
    }
    async getPaymentHistoryAnalytics(userId, startDate, endDate) {
        this.logger.log(`💸 Lấy thống kê lịch sử thanh toán cho user: ${userId}`);
        const filter = this.buildDateFilter(userId, startDate, endDate);
        const [paymentOverview, paymentByMethod, paymentByTimeRange, paymentByCustomer, recentPayments] = await Promise.all([
            this.invoiceModel.aggregate([
                { $match: { ...filter, status: { $ne: 'cancelled' } } },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: '$totalAmount' },
                        totalPaid: { $sum: '$paidAmount' },
                        totalRemaining: { $sum: '$remainingAmount' },
                        totalInvoices: { $sum: 1 },
                        paidInvoices: {
                            $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] }
                        },
                        partialInvoices: {
                            $sum: { $cond: [{ $eq: ['$paymentStatus', 'partial'] }, 1, 0] }
                        },
                        unpaidInvoices: {
                            $sum: { $cond: [{ $eq: ['$paymentStatus', 'unpaid'] }, 1, 0] }
                        },
                        avgPaymentRate: { $avg: { $divide: ['$paidAmount', '$totalAmount'] } }
                    }
                }
            ]),
            this.invoiceModel.aggregate([
                { $match: { ...filter, status: { $ne: 'cancelled' } } },
                {
                    $group: {
                        _id: '$paymentMethod',
                        totalRevenue: { $sum: '$totalAmount' },
                        totalPaid: { $sum: '$paidAmount' },
                        totalRemaining: { $sum: '$remainingAmount' },
                        invoiceCount: { $sum: 1 },
                        avgPaymentRate: { $avg: { $divide: ['$paidAmount', '$totalAmount'] } }
                    }
                },
                { $sort: { totalPaid: -1 } }
            ]),
            this.invoiceModel.aggregate([
                { $match: { ...filter, status: { $ne: 'cancelled' } } },
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' }
                        },
                        totalRevenue: { $sum: '$totalAmount' },
                        totalPaid: { $sum: '$paidAmount' },
                        totalRemaining: { $sum: '$remainingAmount' },
                        invoiceCount: { $sum: 1 },
                        paymentRate: { $avg: { $divide: ['$paidAmount', '$totalAmount'] } }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ]),
            this.invoiceModel.aggregate([
                { $match: { ...filter, status: { $ne: 'cancelled' } } },
                {
                    $group: {
                        _id: {
                            customerId: '$customerId',
                            customerName: '$customerName',
                            customerPhone: '$customerPhone'
                        },
                        totalRevenue: { $sum: '$totalAmount' },
                        totalPaid: { $sum: '$paidAmount' },
                        totalRemaining: { $sum: '$remainingAmount' },
                        invoiceCount: { $sum: 1 },
                        avgPaymentRate: { $avg: { $divide: ['$paidAmount', '$totalAmount'] } },
                        lastPaymentDate: { $max: '$createdAt' }
                    }
                },
                { $sort: { totalPaid: -1 } },
                { $limit: 20 }
            ]),
            this.invoiceModel.find({
                ...filter,
                status: { $ne: 'cancelled' },
                paidAmount: { $gt: 0 }
            })
                .sort({ createdAt: -1 })
                .limit(10)
                .select('invoiceNumber customerName totalAmount paidAmount remainingAmount paymentStatus createdAt')
        ]);
        return {
            paymentOverview: paymentOverview[0] || {
                totalRevenue: 0,
                totalPaid: 0,
                totalRemaining: 0,
                totalInvoices: 0,
                paidInvoices: 0,
                partialInvoices: 0,
                unpaidInvoices: 0,
                avgPaymentRate: 0
            },
            paymentByMethod,
            paymentByTimeRange,
            paymentByCustomer,
            recentPayments,
            summary: {
                totalPaid: paymentOverview[0]?.totalPaid || 0,
                totalRevenue: paymentOverview[0]?.totalRevenue || 0,
                paymentRate: paymentOverview[0]?.avgPaymentRate || 0,
                totalCustomers: paymentByCustomer.length
            }
        };
    }
    async getOverdueDebtReport(userId, daysOverdue = 30) {
        this.logger.log(`⚠️ Lấy báo cáo nợ quá hạn cho user: ${userId}`);
        const cutoffDate = new Date(Date.now() - daysOverdue * 24 * 60 * 60 * 1000);
        const [overdueOverview, overdueByCustomer, overdueByTimeRange, criticalOverdue] = await Promise.all([
            this.invoiceModel.aggregate([
                {
                    $match: {
                        createdBy: new mongoose_2.Types.ObjectId(userId),
                        isDeleted: false,
                        paymentStatus: { $in: ['unpaid', 'partial'] },
                        createdAt: { $lt: cutoffDate }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalOverdueAmount: { $sum: '$remainingAmount' },
                        totalOverdueInvoices: { $sum: 1 },
                        avgOverdueAmount: { $avg: '$remainingAmount' },
                        maxOverdueAmount: { $max: '$remainingAmount' },
                        minOverdueAmount: { $min: '$remainingAmount' }
                    }
                }
            ]),
            this.invoiceModel.aggregate([
                {
                    $match: {
                        createdBy: new mongoose_2.Types.ObjectId(userId),
                        isDeleted: false,
                        paymentStatus: { $in: ['unpaid', 'partial'] },
                        createdAt: { $lt: cutoffDate }
                    }
                },
                {
                    $group: {
                        _id: {
                            customerId: '$customerId',
                            customerName: '$customerName',
                            customerPhone: '$customerPhone',
                            customerAddress: '$customerAddress'
                        },
                        totalOverdueAmount: { $sum: '$remainingAmount' },
                        overdueInvoices: { $sum: 1 },
                        avgOverdueAmount: { $avg: '$remainingAmount' },
                        oldestOverdueDate: { $min: '$createdAt' },
                        newestOverdueDate: { $max: '$createdAt' }
                    }
                },
                { $sort: { totalOverdueAmount: -1 } }
            ]),
            this.invoiceModel.aggregate([
                {
                    $match: {
                        createdBy: new mongoose_2.Types.ObjectId(userId),
                        isDeleted: false,
                        paymentStatus: { $in: ['unpaid', 'partial'] },
                        createdAt: { $lt: cutoffDate }
                    }
                },
                {
                    $addFields: {
                        daysOverdue: {
                            $divide: [
                                { $subtract: [new Date(), '$createdAt'] },
                                1000 * 60 * 60 * 24
                            ]
                        }
                    }
                },
                {
                    $bucket: {
                        groupBy: '$daysOverdue',
                        boundaries: [30, 60, 90, 180, 365, Infinity],
                        default: 'Over 1 year',
                        output: {
                            count: { $sum: 1 },
                            totalAmount: { $sum: '$remainingAmount' },
                            avgAmount: { $avg: '$remainingAmount' }
                        }
                    }
                }
            ]),
            this.invoiceModel.find({
                createdBy: new mongoose_2.Types.ObjectId(userId),
                isDeleted: false,
                paymentStatus: { $in: ['unpaid', 'partial'] },
                createdAt: { $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
            })
                .sort({ createdAt: 1 })
                .limit(20)
                .select('invoiceNumber customerName totalAmount remainingAmount paymentStatus createdAt')
        ]);
        return {
            overdueOverview: overdueOverview[0] || {
                totalOverdueAmount: 0,
                totalOverdueInvoices: 0,
                avgOverdueAmount: 0,
                maxOverdueAmount: 0,
                minOverdueAmount: 0
            },
            overdueByCustomer,
            overdueByTimeRange,
            criticalOverdue,
            summary: {
                totalOverdueAmount: overdueOverview[0]?.totalOverdueAmount || 0,
                totalOverdueInvoices: overdueOverview[0]?.totalOverdueInvoices || 0,
                totalOverdueCustomers: overdueByCustomer.length,
                criticalOverdueCount: criticalOverdue.length
            }
        };
    }
    async getInventoryAnalytics(userId) {
        this.logger.log(`📦 Lấy thống kê tồn kho cho user: ${userId}`);
        const [inventoryOverview, lowStockItems, topSellingMaterials, slowMovingItems, categoryAnalysis, inventoryValue] = await Promise.all([
            this.materialModel.aggregate([
                { $match: { userId: new mongoose_2.Types.ObjectId(userId), isActive: true } },
                {
                    $group: {
                        _id: null,
                        totalItems: { $sum: 1 },
                        totalQuantity: { $sum: '$quantity' },
                        avgQuantity: { $avg: '$quantity' },
                        totalValue: { $sum: { $multiply: ['$quantity', '$price'] } }
                    }
                }
            ]),
            this.materialModel.find({
                userId: new mongoose_2.Types.ObjectId(userId),
                isActive: true,
                quantity: { $lt: 10 }
            }).sort({ quantity: 1 }),
            this.getTopSellingMaterials(userId),
            this.getSlowMovingMaterials(userId),
            this.materialModel.aggregate([
                { $match: { userId: new mongoose_2.Types.ObjectId(userId), isActive: true } },
                {
                    $group: {
                        _id: '$category',
                        count: { $sum: 1 },
                        totalQuantity: { $sum: '$quantity' },
                        totalValue: { $sum: { $multiply: ['$quantity', '$price'] } },
                        avgPrice: { $avg: '$price' }
                    }
                },
                { $sort: { totalValue: -1 } }
            ]),
            this.materialModel.aggregate([
                { $match: { userId: new mongoose_2.Types.ObjectId(userId), isActive: true } },
                {
                    $group: {
                        _id: null,
                        totalInventoryValue: { $sum: { $multiply: ['$quantity', '$price'] } }
                    }
                }
            ])
        ]);
        return {
            inventoryOverview: inventoryOverview[0] || { totalItems: 0, totalQuantity: 0, avgQuantity: 0, totalValue: 0 },
            lowStockItems,
            topSellingMaterials,
            slowMovingItems,
            categoryAnalysis,
            inventoryValue: inventoryValue[0]?.totalInventoryValue || 0
        };
    }
    async getCustomerAnalytics(userId, startDate, endDate) {
        this.logger.log(`👥 Lấy thống kê khách hàng cho user: ${userId}`);
        const filter = this.buildDateFilter(userId, startDate, endDate);
        const [customerOverview, topCustomers, customerSegments, customerRetention, newVsReturningCustomers, customerDetails, customerPaymentAnalysis] = await Promise.all([
            this.invoiceModel.aggregate([
                { $match: { ...filter, status: { $ne: 'cancelled' } } },
                {
                    $group: {
                        _id: null,
                        totalCustomers: { $addToSet: '$customerId' },
                        totalInvoices: { $sum: 1 },
                        avgInvoicesPerCustomer: { $avg: 1 }
                    }
                },
                {
                    $project: {
                        totalCustomers: { $size: '$totalCustomers' },
                        totalInvoices: 1,
                        avgInvoicesPerCustomer: 1
                    }
                }
            ]),
            this.invoiceModel.aggregate([
                { $match: { ...filter, status: { $ne: 'cancelled' } } },
                {
                    $group: {
                        _id: {
                            customerId: '$customerId',
                            customerName: '$customerName',
                            customerPhone: '$customerPhone',
                            customerAddress: '$customerAddress'
                        },
                        totalSpent: { $sum: '$totalAmount' },
                        invoiceCount: { $sum: 1 },
                        avgOrderValue: { $avg: '$totalAmount' },
                        lastOrderDate: { $max: '$createdAt' },
                        firstOrderDate: { $min: '$createdAt' },
                        totalPaid: { $sum: '$paidAmount' },
                        totalDebt: { $sum: '$remainingAmount' }
                    }
                },
                { $sort: { totalSpent: -1 } },
                { $limit: 10 }
            ]),
            this.getCustomerSegments(userId),
            this.getCustomerRetention(userId),
            this.getNewVsReturningCustomers(userId, startDate, endDate),
            this.invoiceModel.aggregate([
                { $match: { ...filter, status: { $ne: 'cancelled' } } },
                {
                    $group: {
                        _id: {
                            customerId: '$customerId',
                            customerName: '$customerName',
                            customerPhone: '$customerPhone',
                            customerAddress: '$customerAddress'
                        },
                        totalSpent: { $sum: '$totalAmount' },
                        invoiceCount: { $sum: 1 },
                        avgOrderValue: { $avg: '$totalAmount' },
                        lastOrderDate: { $max: '$createdAt' },
                        firstOrderDate: { $min: '$createdAt' },
                        totalPaid: { $sum: '$paidAmount' },
                        totalDebt: { $sum: '$remainingAmount' },
                        unpaidInvoices: {
                            $sum: { $cond: [{ $eq: ['$paymentStatus', 'unpaid'] }, 1, 0] }
                        },
                        partialInvoices: {
                            $sum: { $cond: [{ $eq: ['$paymentStatus', 'partial'] }, 1, 0] }
                        },
                        paidInvoices: {
                            $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] }
                        }
                    }
                },
                { $sort: { totalSpent: -1 } }
            ]),
            this.invoiceModel.aggregate([
                { $match: { ...filter, status: { $ne: 'cancelled' } } },
                {
                    $group: {
                        _id: '$customerId',
                        totalDebt: { $sum: '$remainingAmount' },
                        avgDebt: { $avg: '$remainingAmount' },
                        maxDebt: { $max: '$remainingAmount' },
                        debtInvoices: {
                            $sum: { $cond: [{ $in: ['$paymentStatus', ['unpaid', 'partial']] }, 1, 0] }
                        }
                    }
                },
                { $match: { totalDebt: { $gt: 0 } } },
                { $sort: { totalDebt: -1 } }
            ])
        ]);
        return {
            customerOverview: customerOverview[0] || { totalCustomers: 0, totalInvoices: 0, avgInvoicesPerCustomer: 0 },
            topCustomers,
            customerSegments,
            customerRetention,
            newVsReturningCustomers,
            customerDetails,
            customerPaymentAnalysis,
            summary: {
                totalCustomers: customerDetails.length,
                totalRevenue: customerDetails.reduce((sum, c) => sum + c.totalSpent, 0),
                totalDebt: customerDetails.reduce((sum, c) => sum + c.totalDebt, 0),
                avgCustomerValue: customerDetails.length > 0 ? customerDetails.reduce((sum, c) => sum + c.totalSpent, 0) / customerDetails.length : 0
            }
        };
    }
    async getCustomerList(userId, startDate, endDate, sortBy = 'totalSpent', sortOrder = 'desc', limit = 50) {
        this.logger.log(`📋 Lấy danh sách khách hàng cho user: ${userId}`);
        const filter = this.buildDateFilter(userId, startDate, endDate);
        const sortField = sortBy === 'lastOrderDate' ? 'lastOrderDate' : sortBy;
        const sortDirection = sortOrder === 'asc' ? 1 : -1;
        const customers = await this.invoiceModel.aggregate([
            { $match: { ...filter, status: { $ne: 'cancelled' } } },
            {
                $group: {
                    _id: {
                        customerId: '$customerId',
                        customerName: '$customerName',
                        customerPhone: '$customerPhone',
                        customerAddress: '$customerAddress'
                    },
                    totalSpent: { $sum: '$totalAmount' },
                    invoiceCount: { $sum: 1 },
                    avgOrderValue: { $avg: '$totalAmount' },
                    lastOrderDate: { $max: '$createdAt' },
                    firstOrderDate: { $min: '$createdAt' },
                    totalPaid: { $sum: '$paidAmount' },
                    totalDebt: { $sum: '$remainingAmount' },
                    unpaidInvoices: {
                        $sum: { $cond: [{ $eq: ['$paymentStatus', 'unpaid'] }, 1, 0] }
                    },
                    partialInvoices: {
                        $sum: { $cond: [{ $eq: ['$paymentStatus', 'partial'] }, 1, 0] }
                    },
                    paidInvoices: {
                        $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] }
                    }
                }
            },
            { $sort: { [sortField]: sortDirection } },
            { $limit: limit }
        ]);
        const totalCustomers = await this.invoiceModel.aggregate([
            { $match: { ...filter, status: { $ne: 'cancelled' } } },
            { $group: { _id: '$customerId' } },
            { $count: 'total' }
        ]);
        return {
            customers,
            pagination: {
                total: totalCustomers[0]?.total || 0,
                limit,
                page: 1,
                hasMore: customers.length === limit
            },
            summary: {
                totalCustomers: totalCustomers[0]?.total || 0,
                totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
                totalDebt: customers.reduce((sum, c) => sum + c.totalDebt, 0),
                avgCustomerValue: customers.length > 0 ? customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length : 0
            }
        };
    }
    async getStockInAnalytics(userId, startDate, endDate) {
        this.logger.log(`📥 Lấy thống kê nhập hàng cho user: ${userId}`);
        const filter = this.buildDateFilter(userId, startDate, endDate, 'stockIn');
        const [stockInOverview, supplierAnalysis, paymentStatusAnalysis, processingTimeAnalysis, paymentSummary] = await Promise.all([
            this.stockInModel.aggregate([
                { $match: { ...filter, isDeleted: false, status: { $ne: 'rejected' } } },
                {
                    $group: {
                        _id: null,
                        totalStockIns: { $sum: 1 },
                        totalAmount: { $sum: '$totalAmount' },
                        paidAmount: { $sum: '$paidAmount' },
                        remainingAmount: { $sum: '$remainingAmount' },
                        avgAmount: { $avg: '$totalAmount' }
                    }
                }
            ]),
            this.stockInModel.aggregate([
                { $match: { ...filter, isDeleted: false, status: { $ne: 'rejected' }, supplier: { $exists: true, $ne: null } } },
                {
                    $group: {
                        _id: '$supplier',
                        count: { $sum: 1 },
                        totalAmount: { $sum: '$totalAmount' },
                        avgAmount: { $avg: '$totalAmount' },
                        lastOrderDate: { $max: '$createdAt' }
                    }
                },
                { $sort: { totalAmount: -1 } }
            ]),
            this.stockInModel.aggregate([
                { $match: { ...filter, isDeleted: false, status: { $ne: 'rejected' } } },
                {
                    $group: {
                        _id: '$paymentStatus',
                        count: { $sum: 1 },
                        totalAmount: { $sum: '$totalAmount' },
                        paidAmount: { $sum: '$paidAmount' },
                        remainingAmount: { $sum: '$remainingAmount' }
                    }
                }
            ]),
            this.getProcessingTimeAnalysis(userId, startDate, endDate),
            this.getStockInPaymentSummaryData(userId, startDate, endDate)
        ]);
        return {
            stockInOverview: stockInOverview[0] || { totalStockIns: 0, totalAmount: 0, paidAmount: 0, remainingAmount: 0, avgAmount: 0 },
            supplierAnalysis,
            paymentStatusAnalysis,
            processingTimeAnalysis,
            paymentSummary
        };
    }
    async getTimeBasedAnalytics(userId, startDate, endDate) {
        this.logger.log(`📈 Lấy thống kê theo thời gian cho user: ${userId}`);
        const [dailyTrends, weeklyTrends, monthlyTrends, seasonalAnalysis, yearOverYearComparison] = await Promise.all([
            this.getDailyTrends(userId, startDate, endDate),
            this.getWeeklyTrends(userId, startDate, endDate),
            this.getMonthlyTrends(userId, startDate, endDate),
            this.getSeasonalAnalysis(userId),
            this.getYearOverYearComparison(userId)
        ]);
        return {
            dailyTrends,
            weeklyTrends,
            monthlyTrends,
            seasonalAnalysis,
            yearOverYearComparison
        };
    }
    async getDashboardData(userId, startDate, endDate) {
        this.logger.log(`🎯 Lấy dữ liệu dashboard cho user: ${userId}`);
        const [financialSummary, inventorySummary, customerSummary, stockInSummary, alerts] = await Promise.all([
            this.getFinancialSummary(userId, startDate, endDate),
            this.getInventorySummary(userId),
            this.getCustomerSummary(userId, startDate, endDate),
            this.getStockInSummary(userId, startDate, endDate),
            this.getAlerts(userId)
        ]);
        return {
            financialSummary,
            inventorySummary,
            customerSummary,
            stockInSummary,
            alerts,
            lastUpdated: new Date()
        };
    }
    async getCustomerRegionAnalytics(userId, startDate, endDate) {
        this.logger.log(`🗺️ Lấy thống kê khách hàng theo khu vực cho user: ${userId}`);
        const baseFilter = this.buildDateFilter(userId, startDate, endDate);
        const regionFilter = {
            createdBy: baseFilter.createdBy,
            isDeleted: baseFilter.isDeleted,
            status: { $ne: 'cancelled' },
            customerAddress: { $exists: true, $ne: '' }
        };
        if (baseFilter.createdAt) {
            regionFilter.createdAt = baseFilter.createdAt;
        }
        const [regionStats, topRegions, regionRevenue, regionGrowth] = await Promise.all([
            this.invoiceModel.aggregate([
                { $match: regionFilter },
                {
                    $group: {
                        _id: {
                            region: { $toUpper: { $substr: ['$customerAddress', 0, 50] } }
                        },
                        customerCount: { $addToSet: '$customerId' },
                        totalRevenue: { $sum: '$totalAmount' },
                        totalOrders: { $sum: 1 },
                        avgOrderValue: { $avg: '$totalAmount' },
                        totalPaid: { $sum: '$paidAmount' },
                        totalDebt: { $sum: '$remainingAmount' }
                    }
                },
                {
                    $project: {
                        region: '$_id.region',
                        customerCount: { $size: '$customerCount' },
                        totalRevenue: 1,
                        totalOrders: 1,
                        avgOrderValue: 1,
                        totalPaid: 1,
                        totalDebt: 1,
                        _id: 0
                    }
                },
                { $sort: { customerCount: -1 } }
            ]),
            this.invoiceModel.aggregate([
                { $match: regionFilter },
                {
                    $group: {
                        _id: {
                            region: { $toUpper: { $substr: ['$customerAddress', 0, 50] } }
                        },
                        uniqueCustomers: { $addToSet: '$customerId' }
                    }
                },
                {
                    $project: {
                        region: '$_id.region',
                        customerCount: { $size: '$uniqueCustomers' },
                        _id: 0
                    }
                },
                { $sort: { customerCount: -1 } },
                { $limit: 10 }
            ]),
            this.invoiceModel.aggregate([
                { $match: regionFilter },
                {
                    $group: {
                        _id: {
                            region: { $toUpper: { $substr: ['$customerAddress', 0, 50] } }
                        },
                        totalRevenue: { $sum: '$totalAmount' },
                        totalOrders: { $sum: 1 },
                        avgOrderValue: { $avg: '$totalAmount' }
                    }
                },
                {
                    $project: {
                        region: '$_id.region',
                        totalRevenue: 1,
                        totalOrders: 1,
                        avgOrderValue: 1,
                        _id: 0
                    }
                },
                { $sort: { totalRevenue: -1 } }
            ]),
            this.getRegionGrowth(userId, startDate, endDate)
        ]);
        const processedRegionStats = this.processRegionData(regionStats);
        const processedTopRegions = this.processRegionData(topRegions);
        const processedRegionRevenue = this.processRegionData(regionRevenue);
        return {
            regionStats: processedRegionStats,
            topRegions: processedTopRegions,
            regionRevenue: processedRegionRevenue,
            regionGrowth,
            summary: {
                totalRegions: processedRegionStats.length,
                totalCustomers: processedRegionStats.reduce((sum, region) => sum + region.customerCount, 0),
                totalRevenue: processedRegionStats.reduce((sum, region) => sum + region.totalRevenue, 0),
                avgCustomersPerRegion: processedRegionStats.length > 0 ?
                    processedRegionStats.reduce((sum, region) => sum + region.customerCount, 0) / processedRegionStats.length : 0
            }
        };
    }
    async getCustomerListByRegion(userId, region, startDate, endDate, sortBy = 'customerCount', sortOrder = 'desc', limit = 50) {
        this.logger.log(`📋 Lấy danh sách khách hàng theo khu vực cho user: ${userId}`);
        const baseFilter = this.buildDateFilter(userId, startDate, endDate);
        const regionFilter = {
            createdBy: baseFilter.createdBy,
            isDeleted: baseFilter.isDeleted,
            status: { $ne: 'cancelled' },
            customerAddress: region ?
                { $regex: region, $options: 'i' } :
                { $exists: true, $ne: '' }
        };
        if (baseFilter.createdAt) {
            regionFilter.createdAt = baseFilter.createdAt;
        }
        const sortField = sortBy === 'customerCount' ? 'customerCount' : sortBy;
        const sortDirection = sortOrder === 'asc' ? 1 : -1;
        const regions = await this.invoiceModel.aggregate([
            { $match: regionFilter },
            {
                $group: {
                    _id: {
                        region: { $toUpper: { $substr: ['$customerAddress', 0, 50] } }
                    },
                    customerCount: { $addToSet: '$customerId' },
                    totalRevenue: { $sum: '$totalAmount' },
                    totalOrders: { $sum: 1 },
                    avgOrderValue: { $avg: '$totalAmount' },
                    totalPaid: { $sum: '$paidAmount' },
                    totalDebt: { $sum: '$remainingAmount' },
                    lastOrderDate: { $max: '$createdAt' },
                    firstOrderDate: { $min: '$createdAt' }
                }
            },
            {
                $project: {
                    region: '$_id.region',
                    customerCount: { $size: '$customerCount' },
                    totalRevenue: 1,
                    totalOrders: 1,
                    avgOrderValue: 1,
                    totalPaid: 1,
                    totalDebt: 1,
                    lastOrderDate: 1,
                    firstOrderDate: 1,
                    _id: 0
                }
            },
            { $sort: { [sortField]: sortDirection } },
            { $limit: limit }
        ]);
        const totalRegions = await this.invoiceModel.aggregate([
            { $match: regionFilter },
            { $group: { _id: { $toUpper: { $substr: ['$customerAddress', 0, 50] } } } },
            { $count: 'total' }
        ]);
        const processedRegions = this.processRegionData(regions);
        return {
            regions: processedRegions,
            pagination: {
                total: totalRegions[0]?.total || 0,
                limit,
                page: 1,
                hasMore: regions.length === limit
            },
            summary: {
                totalRegions: totalRegions[0]?.total || 0,
                totalCustomers: processedRegions.reduce((sum, region) => sum + region.customerCount, 0),
                totalRevenue: processedRegions.reduce((sum, region) => sum + region.totalRevenue, 0),
                avgCustomersPerRegion: processedRegions.length > 0 ?
                    processedRegions.reduce((sum, region) => sum + region.customerCount, 0) / processedRegions.length : 0
            }
        };
    }
    async getStockInPaymentSummary(userId, startDate, endDate) {
        this.logger.log(`💰 Lấy thống kê thanh toán nhập hàng cho user: ${userId}`);
        return this.getStockInPaymentSummaryData(userId, startDate, endDate);
    }
    buildDateFilter(userId, startDate, endDate, type = 'invoice') {
        const filter = {
            [type === 'invoice' ? 'createdBy' : 'userId']: new mongoose_2.Types.ObjectId(userId),
            isDeleted: false
        };
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate)
                filter.createdAt.$gte = new Date(startDate);
            if (endDate)
                filter.createdAt.$lte = new Date(endDate);
        }
        return filter;
    }
    async getRevenueGrowth(userId, startDate, endDate) {
        const currentPeriod = await this.invoiceModel.aggregate([
            { $match: this.buildDateFilter(userId, startDate, endDate) },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const previousPeriod = await this.invoiceModel.aggregate([
            { $match: this.buildDateFilter(userId, startDate, endDate) },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const current = currentPeriod[0]?.total || 0;
        const previous = previousPeriod[0]?.total || 0;
        const growthRate = previous > 0 ? ((current - previous) / previous) * 100 : 0;
        return {
            current,
            previous,
            growthRate,
            growthAmount: current - previous
        };
    }
    async getTopSellingMaterials(userId) {
        const filter = this.buildDateFilter(userId);
        return this.invoiceModel.aggregate([
            { $match: { ...filter, status: { $ne: 'cancelled' } } },
            { $unwind: '$items' },
            {
                $group: {
                    _id: {
                        materialId: '$items.materialId',
                        materialName: '$items.materialName'
                    },
                    totalQuantity: { $sum: '$items.quantity' },
                    totalRevenue: { $sum: '$items.totalPrice' },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { totalRevenue: -1 } },
            { $limit: 10 }
        ]);
    }
    async getSlowMovingMaterials(userId) {
        const filter = this.buildDateFilter(userId);
        return this.invoiceModel.aggregate([
            { $match: { ...filter, status: { $ne: 'cancelled' } } },
            { $unwind: '$items' },
            {
                $group: {
                    _id: {
                        materialId: '$items.materialId',
                        materialName: '$items.materialName'
                    },
                    totalQuantity: { $sum: '$items.quantity' },
                    totalRevenue: { $sum: '$items.totalPrice' },
                    orderCount: { $sum: 1 },
                    lastOrderDate: { $max: '$createdAt' }
                }
            },
            { $sort: { totalRevenue: 1 } },
            { $limit: 10 }
        ]);
    }
    async getCustomerSegments(userId) {
        const filter = this.buildDateFilter(userId);
        return this.invoiceModel.aggregate([
            { $match: { ...filter, status: { $ne: 'cancelled' } } },
            {
                $group: {
                    _id: '$customerId',
                    totalSpent: { $sum: '$totalAmount' },
                    orderCount: { $sum: 1 },
                    avgOrderValue: { $avg: '$totalAmount' }
                }
            },
            {
                $bucket: {
                    groupBy: '$totalSpent',
                    boundaries: [0, 1000000, 5000000, 10000000, Infinity],
                    default: 'High Value',
                    output: {
                        count: { $sum: 1 },
                        avgSpent: { $avg: '$totalSpent' },
                        avgOrders: { $avg: '$orderCount' }
                    }
                }
            }
        ]);
    }
    async getCustomerRetention(userId) {
        const filter = this.buildDateFilter(userId);
        const customers = await this.invoiceModel.aggregate([
            { $match: { ...filter, status: { $ne: 'cancelled' } } },
            {
                $group: {
                    _id: '$customerId',
                    orderCount: { $sum: 1 },
                    firstOrder: { $min: '$createdAt' },
                    lastOrder: { $max: '$createdAt' }
                }
            }
        ]);
        const totalCustomers = customers.length;
        const returningCustomers = customers.filter(c => c.orderCount > 1).length;
        const newCustomers = customers.filter(c => c.orderCount === 1).length;
        const retentionRate = totalCustomers > 0 ? (returningCustomers / totalCustomers) * 100 : 0;
        return {
            retentionRate: Math.round(retentionRate * 100) / 100,
            newCustomers,
            returningCustomers
        };
    }
    async getNewVsReturningCustomers(userId, startDate, endDate) {
        const filter = this.buildDateFilter(userId, startDate, endDate);
        const customers = await this.invoiceModel.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: '$customerId',
                    firstOrder: { $min: '$createdAt' },
                    orderCount: { $sum: 1 }
                }
            }
        ]);
        const newCustomers = customers.filter(c => c.orderCount === 1).length;
        const returningCustomers = customers.filter(c => c.orderCount > 1).length;
        return { newCustomers, returningCustomers };
    }
    async getProcessingTimeAnalysis(userId, startDate, endDate) {
        return this.stockInModel.aggregate([
            { $match: this.buildDateFilter(userId, startDate, endDate, 'stockIn') },
            {
                $project: {
                    processingTime: {
                        $divide: [
                            { $subtract: ['$approvedAt', '$createdAt'] },
                            1000 * 60 * 60 * 24
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    avgProcessingTime: { $avg: '$processingTime' },
                    minProcessingTime: { $min: '$processingTime' },
                    maxProcessingTime: { $max: '$processingTime' }
                }
            }
        ]);
    }
    async getStockInPaymentSummaryData(userId, startDate, endDate) {
        const filter = this.buildDateFilter(userId, startDate, endDate, 'stockIn');
        const [totalSummary, paidSummary, unpaidSummary, partialSummary, paymentTrends] = await Promise.all([
            this.stockInModel.aggregate([
                { $match: { ...filter, isDeleted: false, status: { $ne: 'rejected' } } },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: '$totalAmount' },
                        totalPaid: { $sum: '$paidAmount' },
                        totalRemaining: { $sum: '$remainingAmount' },
                        totalCount: { $sum: 1 },
                        avgAmount: { $avg: '$totalAmount' },
                        avgPaid: { $avg: '$paidAmount' },
                        avgRemaining: { $avg: '$remainingAmount' }
                    }
                }
            ]),
            this.stockInModel.aggregate([
                { $match: { ...filter, isDeleted: false, status: { $ne: 'rejected' }, paymentStatus: 'paid' } },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: '$totalAmount' },
                        totalPaid: { $sum: '$paidAmount' },
                        count: { $sum: 1 },
                        avgAmount: { $avg: '$totalAmount' }
                    }
                }
            ]),
            this.stockInModel.aggregate([
                { $match: { ...filter, isDeleted: false, status: { $ne: 'rejected' }, paymentStatus: 'unpaid' } },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: '$totalAmount' },
                        totalRemaining: { $sum: '$remainingAmount' },
                        count: { $sum: 1 },
                        avgAmount: { $avg: '$totalAmount' }
                    }
                }
            ]),
            this.stockInModel.aggregate([
                { $match: { ...filter, isDeleted: false, status: { $ne: 'rejected' }, paymentStatus: 'partial' } },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: '$totalAmount' },
                        totalPaid: { $sum: '$paidAmount' },
                        totalRemaining: { $sum: '$remainingAmount' },
                        count: { $sum: 1 },
                        avgAmount: { $avg: '$totalAmount' },
                        avgPaid: { $avg: '$paidAmount' },
                        avgRemaining: { $avg: '$remainingAmount' }
                    }
                }
            ]),
            this.stockInModel.aggregate([
                { $match: { ...filter, isDeleted: false, status: { $ne: 'rejected' } } },
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' }
                        },
                        totalAmount: { $sum: '$totalAmount' },
                        totalPaid: { $sum: '$paidAmount' },
                        totalRemaining: { $sum: '$remainingAmount' },
                        count: { $sum: 1 },
                        paidCount: {
                            $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] }
                        },
                        unpaidCount: {
                            $sum: { $cond: [{ $eq: ['$paymentStatus', 'unpaid'] }, 1, 0] }
                        },
                        partialCount: {
                            $sum: { $cond: [{ $eq: ['$paymentStatus', 'partial'] }, 1, 0] }
                        }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ])
        ]);
        const total = totalSummary[0] || { totalAmount: 0, totalPaid: 0, totalRemaining: 0, totalCount: 0, avgAmount: 0, avgPaid: 0, avgRemaining: 0 };
        const paid = paidSummary[0] || { totalAmount: 0, totalPaid: 0, count: 0, avgAmount: 0 };
        const unpaid = unpaidSummary[0] || { totalAmount: 0, totalRemaining: 0, count: 0, avgAmount: 0 };
        const partial = partialSummary[0] || { totalAmount: 0, totalPaid: 0, totalRemaining: 0, count: 0, avgAmount: 0, avgPaid: 0, avgRemaining: 0 };
        const paymentRate = total.totalAmount > 0 ? (total.totalPaid / total.totalAmount) * 100 : 0;
        const debtRate = total.totalAmount > 0 ? (total.totalRemaining / total.totalAmount) * 100 : 0;
        return {
            summary: {
                totalAmount: total.totalAmount,
                totalPaid: total.totalPaid,
                totalRemaining: total.totalRemaining,
                totalCount: total.totalCount,
                paymentRate: Math.round(paymentRate * 100) / 100,
                debtRate: Math.round(debtRate * 100) / 100,
                avgAmount: total.avgAmount,
                avgPaid: total.avgPaid,
                avgRemaining: total.avgRemaining
            },
            paid: {
                amount: paid.totalAmount,
                count: paid.count,
                avgAmount: paid.avgAmount,
                percentage: total.totalAmount > 0 ? Math.round((paid.totalAmount / total.totalAmount) * 100 * 100) / 100 : 0
            },
            unpaid: {
                amount: unpaid.totalAmount,
                count: unpaid.count,
                avgAmount: unpaid.avgAmount,
                percentage: total.totalAmount > 0 ? Math.round((unpaid.totalAmount / total.totalAmount) * 100 * 100) / 100 : 0
            },
            partial: {
                amount: partial.totalAmount,
                paidAmount: partial.totalPaid,
                remainingAmount: partial.totalRemaining,
                count: partial.count,
                avgAmount: partial.avgAmount,
                avgPaid: partial.avgPaid,
                avgRemaining: partial.avgRemaining,
                percentage: total.totalAmount > 0 ? Math.round((partial.totalAmount / total.totalAmount) * 100 * 100) / 100 : 0
            },
            trends: paymentTrends
        };
    }
    async getDailyTrends(userId, startDate, endDate) {
        return this.invoiceModel.aggregate([
            { $match: this.buildDateFilter(userId, startDate, endDate) },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' }
                    },
                    revenue: { $sum: '$totalAmount' },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]);
    }
    async getWeeklyTrends(userId, startDate, endDate) {
        return this.invoiceModel.aggregate([
            { $match: this.buildDateFilter(userId, startDate, endDate) },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        week: { $week: '$createdAt' }
                    },
                    revenue: { $sum: '$totalAmount' },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.week': 1 } }
        ]);
    }
    async getMonthlyTrends(userId, startDate, endDate) {
        return this.invoiceModel.aggregate([
            { $match: this.buildDateFilter(userId, startDate, endDate) },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    revenue: { $sum: '$totalAmount' },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);
    }
    async getSeasonalAnalysis(userId) {
        const filter = this.buildDateFilter(userId);
        return this.invoiceModel.aggregate([
            { $match: { ...filter, status: { $ne: 'cancelled' } } },
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    revenue: { $sum: '$totalAmount' },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { '_id': 1 } }
        ]);
    }
    async getYearOverYearComparison(userId) {
        const currentYear = new Date().getFullYear();
        const lastYear = currentYear - 1;
        const [currentYearData, lastYearData] = await Promise.all([
            this.invoiceModel.aggregate([
                {
                    $match: {
                        createdBy: new mongoose_2.Types.ObjectId(userId),
                        createdAt: {
                            $gte: new Date(`${currentYear}-01-01`),
                            $lt: new Date(`${currentYear + 1}-01-01`)
                        },
                        status: { $ne: 'cancelled' },
                        isDeleted: false
                    }
                },
                {
                    $group: {
                        _id: null,
                        revenue: { $sum: '$totalAmount' },
                        orders: { $sum: 1 }
                    }
                }
            ]),
            this.invoiceModel.aggregate([
                {
                    $match: {
                        createdBy: new mongoose_2.Types.ObjectId(userId),
                        createdAt: {
                            $gte: new Date(`${lastYear}-01-01`),
                            $lt: new Date(`${currentYear}-01-01`)
                        },
                        status: { $ne: 'cancelled' },
                        isDeleted: false
                    }
                },
                {
                    $group: {
                        _id: null,
                        revenue: { $sum: '$totalAmount' },
                        orders: { $sum: 1 }
                    }
                }
            ])
        ]);
        const current = currentYearData[0] || { revenue: 0, orders: 0 };
        const last = lastYearData[0] || { revenue: 0, orders: 0 };
        return {
            currentYear: { year: currentYear, ...current },
            lastYear: { year: lastYear, ...last },
            revenueGrowth: last.revenue > 0 ? ((current.revenue - last.revenue) / last.revenue) * 100 : 0,
            orderGrowth: last.orders > 0 ? ((current.orders - last.orders) / last.orders) * 100 : 0
        };
    }
    async getFinancialSummary(userId, startDate, endDate) {
        const filter = this.buildDateFilter(userId, startDate, endDate);
        const [revenue, orders, avgOrderValue] = await Promise.all([
            this.invoiceModel.aggregate([
                { $match: { ...filter, status: { $ne: 'cancelled' } } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]),
            this.invoiceModel.countDocuments({ ...filter, status: { $ne: 'cancelled' } }),
            this.invoiceModel.aggregate([
                { $match: { ...filter, status: { $ne: 'cancelled' } } },
                { $group: { _id: null, avg: { $avg: '$totalAmount' } } }
            ])
        ]);
        return {
            totalRevenue: revenue[0]?.total || 0,
            totalOrders: orders,
            averageOrderValue: avgOrderValue[0]?.avg || 0
        };
    }
    async getInventorySummary(userId) {
        const [totalItems, lowStockCount, totalValue] = await Promise.all([
            this.materialModel.countDocuments({ userId: new mongoose_2.Types.ObjectId(userId), isActive: true }),
            this.materialModel.countDocuments({ userId: new mongoose_2.Types.ObjectId(userId), isActive: true, quantity: { $lt: 10 } }),
            this.materialModel.aggregate([
                { $match: { userId: new mongoose_2.Types.ObjectId(userId), isActive: true } },
                { $group: { _id: null, total: { $sum: { $multiply: ['$quantity', '$price'] } } } }
            ])
        ]);
        return {
            totalItems,
            lowStockCount,
            totalValue: totalValue[0]?.total || 0
        };
    }
    async getCustomerSummary(userId, startDate, endDate) {
        const filter = this.buildDateFilter(userId, startDate, endDate);
        const [totalCustomers, newCustomers] = await Promise.all([
            this.invoiceModel.distinct('customerId', { ...filter, status: { $ne: 'cancelled' } }),
            this.invoiceModel.distinct('customerId', {
                ...filter,
                status: { $ne: 'cancelled' },
                createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            })
        ]);
        return {
            totalCustomers: totalCustomers.length,
            newCustomers: newCustomers.length
        };
    }
    async getStockInSummary(userId, startDate, endDate) {
        const filter = this.buildDateFilter(userId, startDate, endDate, 'stockIn');
        const [totalStockIns, pendingCount, totalAmount] = await Promise.all([
            this.stockInModel.countDocuments({ ...filter, isDeleted: false, status: { $ne: 'rejected' } }),
            this.stockInModel.countDocuments({ ...filter, isDeleted: false, status: 'pending' }),
            this.stockInModel.aggregate([
                { $match: { ...filter, isDeleted: false, status: { $ne: 'rejected' } } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ])
        ]);
        return {
            totalStockIns,
            pendingCount,
            totalAmount: totalAmount[0]?.total || 0
        };
    }
    async getAlerts(userId) {
        const [lowStockItems, overdueInvoices, pendingStockIns] = await Promise.all([
            this.materialModel.find({
                userId: new mongoose_2.Types.ObjectId(userId),
                isActive: true,
                quantity: { $lt: 10 }
            }).limit(5),
            this.invoiceModel.find({
                createdBy: new mongoose_2.Types.ObjectId(userId),
                paymentStatus: { $in: ['unpaid', 'partial'] },
                createdAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            }).limit(5),
            this.stockInModel.find({
                userId: new mongoose_2.Types.ObjectId(userId),
                isDeleted: false,
                status: 'pending'
            }).limit(5)
        ]);
        return {
            lowStockItems,
            overdueInvoices,
            pendingStockIns,
            totalAlerts: lowStockItems.length + overdueInvoices.length + pendingStockIns.length
        };
    }
    async getRegionGrowth(userId, startDate, endDate) {
        const baseFilter = this.buildDateFilter(userId, startDate, endDate);
        const regionFilter = {
            createdBy: baseFilter.createdBy,
            isDeleted: baseFilter.isDeleted,
            status: { $ne: 'cancelled' },
            customerAddress: { $exists: true, $ne: '' }
        };
        if (baseFilter.createdAt) {
            regionFilter.createdAt = baseFilter.createdAt;
        }
        const currentPeriod = await this.invoiceModel.aggregate([
            { $match: regionFilter },
            {
                $group: {
                    _id: { $toUpper: { $substr: ['$customerAddress', 0, 50] } },
                    customerCount: { $addToSet: '$customerId' },
                    totalRevenue: { $sum: '$totalAmount' }
                }
            },
            {
                $project: {
                    region: '$_id',
                    customerCount: { $size: '$customerCount' },
                    totalRevenue: 1,
                    _id: 0
                }
            }
        ]);
        const previousPeriod = await this.invoiceModel.aggregate([
            { $match: regionFilter },
            {
                $group: {
                    _id: { $toUpper: { $substr: ['$customerAddress', 0, 50] } },
                    customerCount: { $addToSet: '$customerId' },
                    totalRevenue: { $sum: '$totalAmount' }
                }
            },
            {
                $project: {
                    region: '$_id',
                    customerCount: { $size: '$customerCount' },
                    totalRevenue: 1,
                    _id: 0
                }
            }
        ]);
        const growthData = currentPeriod.map(current => {
            const previous = previousPeriod.find(p => p.region === current.region);
            const previousCustomers = previous?.customerCount || 0;
            const previousRevenue = previous?.totalRevenue || 0;
            const customerGrowth = previousCustomers > 0 ?
                ((current.customerCount - previousCustomers) / previousCustomers) * 100 : 0;
            const revenueGrowth = previousRevenue > 0 ?
                ((current.totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;
            return {
                region: current.region,
                currentCustomers: current.customerCount,
                previousCustomers,
                customerGrowth: Math.round(customerGrowth * 100) / 100,
                currentRevenue: current.totalRevenue,
                previousRevenue,
                revenueGrowth: Math.round(revenueGrowth * 100) / 100
            };
        });
        return growthData.sort((a, b) => b.customerGrowth - a.customerGrowth);
    }
    async getDebtAging(userId, startDate, endDate) {
        const filter = this.buildDateFilter(userId, startDate, endDate);
        return this.invoiceModel.aggregate([
            { $match: { ...filter, paymentStatus: { $in: ['unpaid', 'partial'] } } },
            {
                $addFields: {
                    daysSinceCreated: {
                        $divide: [
                            { $subtract: [new Date(), '$createdAt'] },
                            1000 * 60 * 60 * 24
                        ]
                    }
                }
            },
            {
                $bucket: {
                    groupBy: '$daysSinceCreated',
                    boundaries: [0, 30, 60, 90, 180, 365, Infinity],
                    default: 'Over 1 year',
                    output: {
                        count: { $sum: 1 },
                        totalAmount: { $sum: '$remainingAmount' },
                        avgAmount: { $avg: '$remainingAmount' },
                        invoices: {
                            $push: {
                                invoiceNumber: '$invoiceNumber',
                                customerName: '$customerName',
                                remainingAmount: '$remainingAmount',
                                daysSinceCreated: { $round: '$daysSinceCreated' }
                            }
                        }
                    }
                }
            }
        ]);
    }
    processRegionData(regions) {
        return regions.map(region => {
            let cleanRegion = region.region || '';
            cleanRegion = cleanRegion.replace(/[0-9]/g, '').trim();
            const regionMappings = {
                'TP HCM': 'Thành phố Hồ Chí Minh',
                'TP.HCM': 'Thành phố Hồ Chí Minh',
                'HO CHI MINH': 'Thành phố Hồ Chí Minh',
                'HANOI': 'Hà Nội',
                'HA NOI': 'Hà Nội',
                'DA NANG': 'Đà Nẵng',
                'DANANG': 'Đà Nẵng',
                'CAN THO': 'Cần Thơ',
                'CANTHO': 'Cần Thơ',
                'HAI PHONG': 'Hải Phòng',
                'HAIPHONG': 'Hải Phòng'
            };
            for (const [key, value] of Object.entries(regionMappings)) {
                if (cleanRegion.includes(key)) {
                    cleanRegion = value;
                    break;
                }
            }
            return {
                ...region,
                region: cleanRegion || 'Không xác định'
            };
        }).filter(region => region.region !== 'Không xác định' && region.region.length > 0);
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = AnalyticsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(material_model_1.Material.name)),
    __param(1, (0, mongoose_1.InjectModel)(invoice_model_1.Invoice.name)),
    __param(2, (0, mongoose_1.InjectModel)(stock_in_model_1.StockIn.name)),
    __param(3, (0, mongoose_1.InjectModel)(user_model_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map