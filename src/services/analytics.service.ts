import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Material, MaterialDocument } from '../models/material.model';
import { Invoice } from '../models/invoice.model';
import { StockIn, StockInDocument } from '../models/stock-in.model';
import { User, UserDocument } from '../models/user.model';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectModel(Material.name) private materialModel: Model<MaterialDocument>,
    @InjectModel(Invoice.name) private invoiceModel: Model<Invoice>,
    @InjectModel(StockIn.name) private stockInModel: Model<StockInDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  // ==================== TÀI CHÍNH (FINANCIAL ANALYTICS) ====================

  /**
   * Thống kê doanh thu tổng quan
   */
  async getRevenueAnalytics(userId: string, startDate?: string, endDate?: string) {
    this.logger.log(`📊 Lấy thống kê doanh thu cho user: ${userId}`);

    const filter = this.buildDateFilter(userId, startDate, endDate);

    const [
      totalRevenue,
      revenueByMonth,
      averageOrderValue,
      revenueGrowth,
      paymentMethodRevenue
    ] = await Promise.all([
      // Tổng doanh thu
      this.invoiceModel.aggregate([
        { $match: { ...filter, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      
      // Doanh thu theo tháng
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

      // Giá trị đơn hàng trung bình
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

      // Tăng trưởng doanh thu
      this.getRevenueGrowth(userId, startDate, endDate),

      // Doanh thu theo phương thức thanh toán
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

  /**
   * Thống kê thanh toán và nợ chi tiết
   */
  async getPaymentAnalytics(userId: string, startDate?: string, endDate?: string) {
    this.logger.log(`💰 Lấy thống kê thanh toán cho user: ${userId}`);

    const filter = this.buildDateFilter(userId, startDate, endDate);

    const [
      paymentStatusStats,
      debtAnalysis,
      paymentMethodStats,
      overdueInvoices,
      totalPaidAmount,
      debtByCustomer,
      paymentHistory
    ] = await Promise.all([
      // Thống kê trạng thái thanh toán
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

      // Phân tích nợ chi tiết
      this.invoiceModel.aggregate([
        { $match: { ...filter, status: { $ne: 'cancelled' }, paymentStatus: { $in: ['unpaid', 'partial'] } } },
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

      // Thống kê phương thức thanh toán
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

      // Hóa đơn quá hạn (quá 30 ngày)
      this.invoiceModel.aggregate([
        {
          $match: {
            ...filter,
            status: { $ne: 'cancelled' },
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

      // Tổng tiền đã trả
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

      // Nợ theo khách hàng
      this.invoiceModel.aggregate([
        { $match: { ...filter, status: { $ne: 'cancelled' }, paymentStatus: { $in: ['unpaid', 'partial'] } } },
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

      // Lịch sử thanh toán theo tháng
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

  /**
   * Thống kê nợ chi tiết theo khách hàng
   */
  async getDebtAnalytics(userId: string, startDate?: string, endDate?: string) {
    this.logger.log(`💳 Lấy thống kê nợ chi tiết cho user: ${userId}`);

    const filter = this.buildDateFilter(userId, startDate, endDate);

    const [
      debtOverview,
      debtByCustomer,
      debtByStatus,
      debtByTimeRange,
      topDebtCustomers,
      debtAging
    ] = await Promise.all([
      // Tổng quan nợ
      this.invoiceModel.aggregate([
        { $match: { ...filter, status: { $ne: 'cancelled' }, paymentStatus: { $in: ['unpaid', 'partial'] } } },
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

      // Nợ theo khách hàng
      this.invoiceModel.aggregate([
        { $match: { ...filter, status: { $ne: 'cancelled' }, paymentStatus: { $in: ['unpaid', 'partial'] } } },
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

      // Nợ theo trạng thái
      this.invoiceModel.aggregate([
        { $match: { ...filter, status: { $ne: 'cancelled' }, paymentStatus: { $in: ['unpaid', 'partial'] } } },
        {
          $group: {
            _id: '$paymentStatus',
            totalDebt: { $sum: '$remainingAmount' },
            invoiceCount: { $sum: 1 },
            avgDebt: { $avg: '$remainingAmount' }
          }
        }
      ]),

      // Nợ theo khoảng thời gian
      this.invoiceModel.aggregate([
        { $match: { ...filter, status: { $ne: 'cancelled' }, paymentStatus: { $in: ['unpaid', 'partial'] } } },
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

      // Top khách hàng nợ nhiều nhất
      this.invoiceModel.aggregate([
        { $match: { ...filter, status: { $ne: 'cancelled' }, paymentStatus: { $in: ['unpaid', 'partial'] } } },
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

      // Phân tích tuổi nợ
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

  /**
   * Thống kê thanh toán chi tiết
   */
  async getPaymentHistoryAnalytics(userId: string, startDate?: string, endDate?: string) {
    this.logger.log(`💸 Lấy thống kê lịch sử thanh toán cho user: ${userId}`);

    const filter = this.buildDateFilter(userId, startDate, endDate);

    const [
      paymentOverview,
      paymentByMethod,
      paymentByTimeRange,
      paymentByCustomer,
      recentPayments
    ] = await Promise.all([
      // Tổng quan thanh toán
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

      // Thanh toán theo phương thức
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

      // Thanh toán theo thời gian
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

      // Thanh toán theo khách hàng
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

      // Thanh toán gần đây
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

  /**
   * Báo cáo nợ quá hạn
   */
  async getOverdueDebtReport(userId: string, daysOverdue: number = 30) {
    this.logger.log(`⚠️ Lấy báo cáo nợ quá hạn cho user: ${userId}`);

    const cutoffDate = new Date(Date.now() - daysOverdue * 24 * 60 * 60 * 1000);

    const [
      overdueOverview,
      overdueByCustomer,
      overdueByTimeRange,
      criticalOverdue
    ] = await Promise.all([
      // Tổng quan nợ quá hạn
      this.invoiceModel.aggregate([
        {
          $match: {
            createdBy: new Types.ObjectId(userId),
            isDeleted: false,
            status: { $ne: 'cancelled' },
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

      // Nợ quá hạn theo khách hàng
      this.invoiceModel.aggregate([
        {
          $match: {
            createdBy: new Types.ObjectId(userId),
            isDeleted: false,
            status: { $ne: 'cancelled' },
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

      // Nợ quá hạn theo khoảng thời gian
      this.invoiceModel.aggregate([
        {
          $match: {
            createdBy: new Types.ObjectId(userId),
            isDeleted: false,
            status: { $ne: 'cancelled' },
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

      // Nợ quá hạn nghiêm trọng (> 90 ngày)
      this.invoiceModel.find({
        createdBy: new Types.ObjectId(userId),
        isDeleted: false,
        status: { $ne: 'cancelled' },
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

  // ==================== VẬT LIỆU (INVENTORY ANALYTICS) ====================

  /**
   * Thống kê tồn kho và vật liệu
   */
  async getInventoryAnalytics(userId: string) {
    this.logger.log(`📦 Lấy thống kê tồn kho cho user: ${userId}`);

    const [
      inventoryOverview,
      lowStockItems,
      topSellingMaterials,
      slowMovingItems,
      categoryAnalysis,
      inventoryValue
    ] = await Promise.all([
      // Tổng quan tồn kho
      this.materialModel.aggregate([
        { $match: { userId: new Types.ObjectId(userId), isActive: true } },
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

      // Vật liệu sắp hết (giả sử < 10)
      this.materialModel.find({
        userId: new Types.ObjectId(userId),
        isActive: true,
        quantity: { $lt: 10 }
      }).sort({ quantity: 1 }),

      // Vật liệu bán chạy nhất
      this.getTopSellingMaterials(userId),

      // Vật liệu ít bán
      this.getSlowMovingMaterials(userId),

      // Phân tích theo danh mục
      this.materialModel.aggregate([
        { $match: { userId: new Types.ObjectId(userId), isActive: true } },
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

      // Giá trị tồn kho
      this.materialModel.aggregate([
        { $match: { userId: new Types.ObjectId(userId), isActive: true } },
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

  // ==================== KHÁCH HÀNG (CUSTOMER ANALYTICS) ====================

  /**
   * Thống kê khách hàng của tài khoản hiện tại
   */
  async getCustomerAnalytics(userId: string, startDate?: string, endDate?: string) {
    this.logger.log(`👥 Lấy thống kê khách hàng cho user: ${userId}`);

    const filter = this.buildDateFilter(userId, startDate, endDate);

    const [
      customerOverview,
      topCustomers,
      customerSegments,
      customerRetention,
      newVsReturningCustomers,
      customerDetails,
      customerPaymentAnalysis
    ] = await Promise.all([
      // Tổng quan khách hàng
      this.invoiceModel.aggregate([
        { $match: { ...filter, status: { $ne: 'cancelled' } } },
        {
          $group: {
            _id: null,
            totalCustomers: { 
              $addToSet: {
                customerId: '$customerId',
                customerName: '$customerName',
                customerPhone: '$customerPhone',
                customerAddress: '$customerAddress'
              }
            },
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

      // Top khách hàng theo doanh thu
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

      // Phân khúc khách hàng
      this.getCustomerSegments(userId),

      // Tỷ lệ giữ chân khách hàng
      this.getCustomerRetention(userId),

      // Khách hàng mới vs cũ
      this.getNewVsReturningCustomers(userId, startDate, endDate),

      // Chi tiết tất cả khách hàng
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

      // Phân tích thanh toán theo khách hàng
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

  /**
   * Lấy danh sách khách hàng chi tiết với phân trang và sắp xếp
   */
  async getCustomerList(
    userId: string, 
    startDate?: string, 
    endDate?: string,
    sortBy: 'totalSpent' | 'invoiceCount' | 'lastOrderDate' | 'totalDebt' = 'totalSpent',
    sortOrder: 'asc' | 'desc' = 'desc',
    limit: number = 50
  ) {
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

    // Thêm thông tin phân trang
    const totalCustomers = await this.invoiceModel.aggregate([
      { $match: { ...filter, status: { $ne: 'cancelled' } } },
      { 
        $group: { 
          _id: {
            customerId: '$customerId',
            customerName: '$customerName',
            customerPhone: '$customerPhone',
            customerAddress: '$customerAddress'
          }
        } 
      },
      { $count: 'total' }
    ]);

    return {
      customers,
      pagination: {
        total: totalCustomers[0]?.total || 0,
        limit,
        page: 1, // Có thể thêm phân trang sau
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

  // ==================== NHẬP HÀNG (STOCK-IN ANALYTICS) ====================

  /**
   * Thống kê nhập hàng và nhà cung cấp
   */
  async getStockInAnalytics(userId: string, startDate?: string, endDate?: string) {
    this.logger.log(`📥 Lấy thống kê nhập hàng cho user: ${userId}`);

    const filter = this.buildDateFilter(userId, startDate, endDate, 'stockIn');

    const [
      stockInOverview,
      supplierAnalysis,
      paymentStatusAnalysis,
      processingTimeAnalysis,
      paymentSummary
    ] = await Promise.all([
      // Tổng quan nhập hàng
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

      // Phân tích nhà cung cấp
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

      // Phân tích trạng thái thanh toán
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

      // Phân tích thời gian xử lý
      this.getProcessingTimeAnalysis(userId, startDate, endDate),

      // Tổng kết thanh toán nhập hàng
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

  // ==================== THỜI GIAN (TIME-BASED ANALYTICS) ====================

  /**
   * Thống kê theo thời gian và xu hướng
   */
  async getTimeBasedAnalytics(userId: string, startDate?: string, endDate?: string) {
    this.logger.log(`📈 Lấy thống kê theo thời gian cho user: ${userId}`);

    const [
      dailyTrends,
      weeklyTrends,
      monthlyTrends,
      seasonalAnalysis,
      yearOverYearComparison
    ] = await Promise.all([
      // Xu hướng hàng ngày
      this.getDailyTrends(userId, startDate, endDate),

      // Xu hướng hàng tuần
      this.getWeeklyTrends(userId, startDate, endDate),

      // Xu hướng hàng tháng
      this.getMonthlyTrends(userId, startDate, endDate),

      // Phân tích mùa vụ
      this.getSeasonalAnalysis(userId),

      // So sánh năm
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

  // ==================== DASHBOARD TỔNG HỢP ====================

  /**
   * Dashboard tổng hợp tất cả thống kê
   */
  async getDashboardData(userId: string, startDate?: string, endDate?: string) {
    this.logger.log(`🎯 Lấy dữ liệu dashboard cho user: ${userId}`);

    const [
      financialSummary,
      inventorySummary,
      customerSummary,
      stockInSummary,
      alerts
    ] = await Promise.all([
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

  // ==================== KHU VỰC (REGION ANALYTICS) ====================

  /**
   * Thống kê khách hàng theo khu vực dựa trên địa chỉ
   */
  async getCustomerRegionAnalytics(userId: string, startDate?: string, endDate?: string) {
    this.logger.log(`🗺️ Lấy thống kê khách hàng theo khu vực cho user: ${userId}`);

    const baseFilter = this.buildDateFilter(userId, startDate, endDate);
    const regionFilter: any = {
      createdBy: baseFilter.createdBy,
      isDeleted: baseFilter.isDeleted,
      status: { $ne: 'cancelled' },
      customerAddress: { $exists: true, $ne: '' }
    };
    
    if (baseFilter.createdAt) {
      regionFilter.createdAt = baseFilter.createdAt;
    }

    const [
      regionStats,
      topRegions,
      regionRevenue,
      regionGrowth
    ] = await Promise.all([
      // Thống kê tổng quan theo khu vực
      this.invoiceModel.aggregate([
        { $match: regionFilter },
        {
          $group: {
            _id: {
              region: { $toUpper: { $substr: ['$customerAddress', 0, 50] } } // Lấy 50 ký tự đầu để phân nhóm
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

      // Top khu vực theo số lượng khách hàng
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

      // Doanh thu theo khu vực
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

      // Tăng trưởng theo khu vực (so sánh kỳ hiện tại vs kỳ trước)
      this.getRegionGrowth(userId, startDate, endDate)
    ]);

    // Xử lý và làm sạch dữ liệu khu vực
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

  /**
   * Lấy danh sách khách hàng chi tiết theo khu vực
   */
  async getCustomerListByRegion(
    userId: string,
    region?: string,
    startDate?: string,
    endDate?: string,
    sortBy: 'customerCount' | 'totalRevenue' | 'totalOrders' = 'customerCount',
    sortOrder: 'asc' | 'desc' = 'desc',
    limit: number = 50
  ) {
    this.logger.log(`📋 Lấy danh sách khách hàng theo khu vực cho user: ${userId}`);

    const baseFilter = this.buildDateFilter(userId, startDate, endDate);
    
    // Thêm filter theo khu vực nếu có
    const regionFilter: any = {
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

    // Thêm thông tin phân trang
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

  // ==================== THỐNG KÊ THANH TOÁN NHẬP HÀNG ====================

  /**
   * Thống kê thanh toán nhập hàng chi tiết
   */
  async getStockInPaymentSummary(userId: string, startDate?: string, endDate?: string) {
    this.logger.log(`💰 Lấy thống kê thanh toán nhập hàng cho user: ${userId}`);
    return this.getStockInPaymentSummaryData(userId, startDate, endDate);
  }

  // ==================== HELPER METHODS ====================

  private buildDateFilter(userId: string, startDate?: string, endDate?: string, type: 'invoice' | 'stockIn' = 'invoice') {
    const filter: any = {
      [type === 'invoice' ? 'createdBy' : 'userId']: new Types.ObjectId(userId),
      isDeleted: false
    };

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        // Set start of day
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        filter.createdAt.$gte = start;
      }
      if (endDate) {
        // Set end of day to include the entire day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    return filter;
  }

  private async getRevenueGrowth(userId: string, startDate?: string, endDate?: string) {
    const currentFilter = this.buildDateFilter(userId, startDate, endDate);
    const currentFilterWithStatus = { ...currentFilter, status: { $ne: 'cancelled' } };
    
    const currentPeriod = await this.invoiceModel.aggregate([
      { $match: currentFilterWithStatus },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    // Tính toán kỳ trước với cùng khoảng thời gian (nếu có date range)
    let previousFilter: any = {};
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const duration = end.getTime() - start.getTime();
      
      // Tính kỳ trước với cùng độ dài thời gian
      const previousEnd = new Date(start.getTime() - 1); // 1ms trước start date
      const previousStart = new Date(previousEnd.getTime() - duration);
      
      previousStart.setHours(0, 0, 0, 0);
      previousEnd.setHours(23, 59, 59, 999);
      
      previousFilter = {
        createdBy: new Types.ObjectId(userId),
        isDeleted: false,
        status: { $ne: 'cancelled' },
        createdAt: {
          $gte: previousStart,
          $lte: previousEnd
        }
      };
    } else if (startDate) {
      // Nếu chỉ có startDate, so sánh với khoảng trước đó cùng độ dài (mặc định 30 ngày)
      const start = new Date(startDate);
      const duration = 30 * 24 * 60 * 60 * 1000; // 30 ngày
      const previousEnd = new Date(start.getTime() - 1);
      const previousStart = new Date(previousEnd.getTime() - duration);
      
      previousStart.setHours(0, 0, 0, 0);
      previousEnd.setHours(23, 59, 59, 999);
      
      previousFilter = {
        createdBy: new Types.ObjectId(userId),
        isDeleted: false,
        status: { $ne: 'cancelled' },
        createdAt: {
          $gte: previousStart,
          $lte: previousEnd
        }
      };
    } else {
      // Không có date range, so sánh tháng hiện tại vs tháng trước
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      
      previousFilter = {
        createdBy: new Types.ObjectId(userId),
        isDeleted: false,
        status: { $ne: 'cancelled' },
        createdAt: {
          $gte: lastMonthStart,
          $lte: lastMonthEnd
        }
      };
    }

    const previousPeriod = await this.invoiceModel.aggregate([
      { $match: previousFilter },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const current = currentPeriod[0]?.total || 0;
    const previous = previousPeriod[0]?.total || 0;
    const growthRate = previous > 0 ? ((current - previous) / previous) * 100 : 0;

    return {
      current,
      previous,
      growthRate: Math.round(growthRate * 100) / 100,
      growthAmount: current - previous
    };
  }

  private async getTopSellingMaterials(userId: string) {
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

  private async getSlowMovingMaterials(userId: string) {
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

  private async getCustomerSegments(userId: string) {
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

  private async getCustomerRetention(userId: string) {
    const filter = this.buildDateFilter(userId);
    
    // Lấy tất cả khách hàng và số lần mua hàng
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
    
    // Tính retention rate dựa trên khách hàng có > 1 đơn hàng
    const retentionRate = totalCustomers > 0 ? (returningCustomers / totalCustomers) * 100 : 0;

    return {
      retentionRate: Math.round(retentionRate * 100) / 100,
      newCustomers,
      returningCustomers
    };
  }

  private async getNewVsReturningCustomers(userId: string, startDate?: string, endDate?: string) {
    const filter = this.buildDateFilter(userId, startDate, endDate);
    
    const customers = await this.invoiceModel.aggregate([
      { $match: { ...filter, status: { $ne: 'cancelled' } } },
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

  private async getProcessingTimeAnalysis(userId: string, startDate?: string, endDate?: string) {
    return this.stockInModel.aggregate([
      { $match: this.buildDateFilter(userId, startDate, endDate, 'stockIn') },
      {
        $project: {
          processingTime: {
            $divide: [
              { $subtract: ['$approvedAt', '$createdAt'] },
              1000 * 60 * 60 * 24 // Convert to days
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

  private async getStockInPaymentSummaryData(userId: string, startDate?: string, endDate?: string) {
    const filter = this.buildDateFilter(userId, startDate, endDate, 'stockIn');
    
    const [
      totalSummary,
      paidSummary,
      unpaidSummary,
      partialSummary,
      paymentTrends
    ] = await Promise.all([
      // Tổng kết chung
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

      // Đã thanh toán hoàn toàn
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

      // Chưa thanh toán
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

      // Thanh toán một phần
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

      // Xu hướng thanh toán theo tháng
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

    // Tính tỷ lệ thanh toán
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

  private async getDailyTrends(userId: string, startDate?: string, endDate?: string) {
    const filter = this.buildDateFilter(userId, startDate, endDate);
    return this.invoiceModel.aggregate([
      { $match: { ...filter, status: { $ne: 'cancelled' } } },
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

  private async getWeeklyTrends(userId: string, startDate?: string, endDate?: string) {
    const filter = this.buildDateFilter(userId, startDate, endDate);
    return this.invoiceModel.aggregate([
      { $match: { ...filter, status: { $ne: 'cancelled' } } },
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

  private async getMonthlyTrends(userId: string, startDate?: string, endDate?: string) {
    const filter = this.buildDateFilter(userId, startDate, endDate);
    return this.invoiceModel.aggregate([
      { $match: { ...filter, status: { $ne: 'cancelled' } } },
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

  private async getSeasonalAnalysis(userId: string) {
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

  private async getYearOverYearComparison(userId: string) {
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;

    const [currentYearData, lastYearData] = await Promise.all([
      this.invoiceModel.aggregate([
        {
          $match: {
            createdBy: new Types.ObjectId(userId),
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
            createdBy: new Types.ObjectId(userId),
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

  private async getFinancialSummary(userId: string, startDate?: string, endDate?: string) {
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

  private async getInventorySummary(userId: string) {
    const [totalItems, lowStockCount, totalValue] = await Promise.all([
      this.materialModel.countDocuments({ userId: new Types.ObjectId(userId), isActive: true }),
      this.materialModel.countDocuments({ userId: new Types.ObjectId(userId), isActive: true, quantity: { $lt: 10 } }),
      this.materialModel.aggregate([
        { $match: { userId: new Types.ObjectId(userId), isActive: true } },
        { $group: { _id: null, total: { $sum: { $multiply: ['$quantity', '$price'] } } } }
      ])
    ]);

    return {
      totalItems,
      lowStockCount,
      totalValue: totalValue[0]?.total || 0
    };
  }

  private async getCustomerSummary(userId: string, startDate?: string, endDate?: string) {
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

  private async getStockInSummary(userId: string, startDate?: string, endDate?: string) {
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

  private async getAlerts(userId: string) {
    const [lowStockItems, overdueInvoices, pendingStockIns] = await Promise.all([
      this.materialModel.find({
        userId: new Types.ObjectId(userId),
        isActive: true,
        quantity: { $lt: 10 }
      }).limit(5),
      this.invoiceModel.find({
        createdBy: new Types.ObjectId(userId),
        isDeleted: false,
        status: { $ne: 'cancelled' },
        paymentStatus: { $in: ['unpaid', 'partial'] },
        createdAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }).limit(5),
      this.stockInModel.find({
        userId: new Types.ObjectId(userId),
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

  private async getRegionGrowth(userId: string, startDate?: string, endDate?: string) {
    const baseFilter = this.buildDateFilter(userId, startDate, endDate);
    const currentRegionFilter: any = {
      createdBy: baseFilter.createdBy,
      isDeleted: baseFilter.isDeleted,
      status: { $ne: 'cancelled' },
      customerAddress: { $exists: true, $ne: '' }
    };
    
    if (baseFilter.createdAt) {
      currentRegionFilter.createdAt = baseFilter.createdAt;
    }

    const currentPeriod = await this.invoiceModel.aggregate([
      { $match: currentRegionFilter },
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

    // Tính toán kỳ trước với cùng khoảng thời gian
    let previousRegionFilter: any = {
      createdBy: baseFilter.createdBy,
      isDeleted: baseFilter.isDeleted,
      status: { $ne: 'cancelled' },
      customerAddress: { $exists: true, $ne: '' }
    };

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const duration = end.getTime() - start.getTime();
      
      // Tính kỳ trước với cùng độ dài thời gian
      const previousEnd = new Date(start.getTime() - 1);
      const previousStart = new Date(previousEnd.getTime() - duration);
      
      previousStart.setHours(0, 0, 0, 0);
      previousEnd.setHours(23, 59, 59, 999);
      
      previousRegionFilter.createdAt = {
        $gte: previousStart,
        $lte: previousEnd
      };
    } else if (startDate) {
      const start = new Date(startDate);
      const duration = 30 * 24 * 60 * 60 * 1000; // 30 ngày
      const previousEnd = new Date(start.getTime() - 1);
      const previousStart = new Date(previousEnd.getTime() - duration);
      
      previousStart.setHours(0, 0, 0, 0);
      previousEnd.setHours(23, 59, 59, 999);
      
      previousRegionFilter.createdAt = {
        $gte: previousStart,
        $lte: previousEnd
      };
    } else {
      // Không có date range, so sánh tháng hiện tại vs tháng trước
      const now = new Date();
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      
      previousRegionFilter.createdAt = {
        $gte: lastMonthStart,
        $lte: lastMonthEnd
      };
    }

    const previousPeriod = await this.invoiceModel.aggregate([
      { $match: previousRegionFilter },
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

    // Tính toán tăng trưởng cho từng khu vực
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

  private async getDebtAging(userId: string, startDate?: string, endDate?: string) {
    const filter = this.buildDateFilter(userId, startDate, endDate);
    
    return this.invoiceModel.aggregate([
      { $match: { ...filter, status: { $ne: 'cancelled' }, paymentStatus: { $in: ['unpaid', 'partial'] } } },
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

  private processRegionData(regions: any[]) {
    return regions.map(region => {
      // Làm sạch và chuẩn hóa tên khu vực
      let cleanRegion = region.region || '';
      
      // Loại bỏ các ký tự đặc biệt và số
      cleanRegion = cleanRegion.replace(/[0-9]/g, '').trim();
      
      // Chuẩn hóa tên khu vực phổ biến
      const regionMappings: { [key: string]: string } = {
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

      // Áp dụng mapping nếu có
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
}
