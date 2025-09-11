import { IsOptional, IsString, IsDateString, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

export class AnalyticsQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(['json', 'csv'])
  format?: 'json' | 'csv';

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  supplier?: string;

  @IsOptional()
  @IsString()
  customerId?: string;
}

export class DateRangeDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class QuickStatsDto {
  @IsOptional()
  @IsEnum(['today', 'week', 'month', 'quarter', 'year'])
  period?: 'today' | 'week' | 'month' | 'quarter' | 'year';
}

// Response DTOs
export class RevenueAnalyticsDto {
  totalRevenue: number;
  revenueByMonth: Array<{
    _id: { year: number; month: number };
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

export class PaymentAnalyticsDto {
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
    minDebt: number;
    debtCount: number;
    unpaidCount: number;
    partialCount: number;
  };
  paymentMethodStats: Array<{
    _id: string;
    count: number;
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    avgAmount: number;
  }>;
  overdueInvoices: {
    count: number;
    totalAmount: number;
    avgAmount: number;
  };
  totalPaidAmount: {
    totalPaid: number;
    totalRevenue: number;
    paymentRate: number;
  };
  debtByCustomer: Array<{
    _id: {
      customerId: string;
      customerName: string;
      customerPhone: string;
    };
    totalDebt: number;
    invoiceCount: number;
    avgDebt: number;
    maxDebt: number;
    lastOrderDate: Date;
  }>;
  paymentHistory: Array<{
    _id: {
      year: number;
      month: number;
    };
    totalRevenue: number;
    totalPaid: number;
    totalDebt: number;
    invoiceCount: number;
  }>;
  summary: {
    totalDebt: number;
    totalPaid: number;
    totalRevenue: number;
    paymentRate: number;
    debtRate: number;
  };
}

export class InventoryAnalyticsDto {
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

export class CustomerAnalyticsDto {
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

export class StockInAnalyticsDto {
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

export class TimeBasedAnalyticsDto {
  dailyTrends: Array<{
    _id: { year: number; month: number; day: number };
    revenue: number;
    orders: number;
  }>;
  weeklyTrends: Array<{
    _id: { year: number; week: number };
    revenue: number;
    orders: number;
  }>;
  monthlyTrends: Array<{
    _id: { year: number; month: number };
    revenue: number;
    orders: number;
  }>;
  seasonalAnalysis: Array<{
    _id: number;
    revenue: number;
    orders: number;
  }>;
  yearOverYearComparison: {
    currentYear: { year: number; revenue: number; orders: number };
    lastYear: { year: number; revenue: number; orders: number };
    revenueGrowth: number;
    orderGrowth: number;
  };
}

export class DebtAnalyticsDto {
  debtOverview: {
    totalDebt: number;
    totalInvoices: number;
    avgDebtPerInvoice: number;
    maxDebt: number;
    minDebt: number;
    unpaidCount: number;
    partialCount: number;
  };
  debtByCustomer: Array<{
    _id: {
      customerId: string;
      customerName: string;
      customerPhone: string;
      customerAddress: string;
    };
    totalDebt: number;
    invoiceCount: number;
    avgDebt: number;
    maxDebt: number;
    lastOrderDate: Date;
    firstDebtDate: Date;
    unpaidInvoices: number;
    partialInvoices: number;
  }>;
  debtByStatus: Array<{
    _id: string;
    totalDebt: number;
    invoiceCount: number;
    avgDebt: number;
  }>;
  debtByTimeRange: Array<{
    _id: {
      year: number;
      month: number;
    };
    totalDebt: number;
    invoiceCount: number;
    avgDebt: number;
  }>;
  topDebtCustomers: Array<{
    _id: {
      customerId: string;
      customerName: string;
      customerPhone: string;
    };
    totalDebt: number;
    invoiceCount: number;
    lastOrderDate: Date;
  }>;
  debtAging: Array<{
    _id: string;
    count: number;
    totalAmount: number;
    avgAmount: number;
    invoices: Array<{
      invoiceNumber: string;
      customerName: string;
      remainingAmount: number;
      daysSinceCreated: number;
    }>;
  }>;
  summary: {
    totalDebt: number;
    totalDebtCustomers: number;
    avgDebtPerCustomer: number;
  };
}

export class PaymentHistoryAnalyticsDto {
  paymentOverview: {
    totalRevenue: number;
    totalPaid: number;
    totalRemaining: number;
    totalInvoices: number;
    paidInvoices: number;
    partialInvoices: number;
    unpaidInvoices: number;
    avgPaymentRate: number;
  };
  paymentByMethod: Array<{
    _id: string;
    totalRevenue: number;
    totalPaid: number;
    totalRemaining: number;
    invoiceCount: number;
    avgPaymentRate: number;
  }>;
  paymentByTimeRange: Array<{
    _id: {
      year: number;
      month: number;
    };
    totalRevenue: number;
    totalPaid: number;
    totalRemaining: number;
    invoiceCount: number;
    paymentRate: number;
  }>;
  paymentByCustomer: Array<{
    _id: {
      customerId: string;
      customerName: string;
      customerPhone: string;
    };
    totalRevenue: number;
    totalPaid: number;
    totalRemaining: number;
    invoiceCount: number;
    avgPaymentRate: number;
    lastPaymentDate: Date;
  }>;
  recentPayments: Array<{
    invoiceNumber: string;
    customerName: string;
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    paymentStatus: string;
    createdAt: Date;
  }>;
  summary: {
    totalPaid: number;
    totalRevenue: number;
    paymentRate: number;
    totalCustomers: number;
  };
}

export class OverdueDebtReportDto {
  overdueOverview: {
    totalOverdueAmount: number;
    totalOverdueInvoices: number;
    avgOverdueAmount: number;
    maxOverdueAmount: number;
    minOverdueAmount: number;
  };
  overdueByCustomer: Array<{
    _id: {
      customerId: string;
      customerName: string;
      customerPhone: string;
      customerAddress: string;
    };
    totalOverdueAmount: number;
    overdueInvoices: number;
    avgOverdueAmount: number;
    oldestOverdueDate: Date;
    newestOverdueDate: Date;
  }>;
  overdueByTimeRange: Array<{
    _id: string;
    count: number;
    totalAmount: number;
    avgAmount: number;
  }>;
  criticalOverdue: Array<{
    invoiceNumber: string;
    customerName: string;
    totalAmount: number;
    remainingAmount: number;
    paymentStatus: string;
    createdAt: Date;
  }>;
  summary: {
    totalOverdueAmount: number;
    totalOverdueInvoices: number;
    totalOverdueCustomers: number;
    criticalOverdueCount: number;
  };
}

export class DashboardDataDto {
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
