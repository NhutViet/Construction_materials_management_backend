import { Controller, Get, Query, UseGuards, Logger } from '@nestjs/common';
import { AnalyticsService } from '../services/analytics.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { RegionAnalyticsDto, CustomerListByRegionDto } from '../dto/region-analytics.dto';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  private readonly logger = new Logger(AnalyticsController.name);

  constructor(private readonly analyticsService: AnalyticsService) {}

  // ==================== TÀI CHÍNH ====================

  @Get('revenue')
  getRevenueAnalytics(
    @CurrentUser() user: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    this.logger.log(`📊 GET /analytics/revenue - Lấy thống kê doanh thu cho user: ${user.id}`);
    return this.analyticsService.getRevenueAnalytics(user.id, startDate, endDate);
  }

  @Get('payments')
  getPaymentAnalytics(
    @CurrentUser() user: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    this.logger.log(`💰 GET /analytics/payments - Lấy thống kê thanh toán cho user: ${user.id}`);
    return this.analyticsService.getPaymentAnalytics(user.id, startDate, endDate);
  }

  // ==================== VẬT LIỆU ====================

  @Get('inventory')
  getInventoryAnalytics(@CurrentUser() user: any) {
    this.logger.log(`📦 GET /analytics/inventory - Lấy thống kê tồn kho cho user: ${user.id}`);
    return this.analyticsService.getInventoryAnalytics(user.id);
  }

  // ==================== KHÁCH HÀNG ====================

  @Get('customers')
  getCustomerAnalytics(
    @CurrentUser() user: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    this.logger.log(`👥 GET /analytics/customers - Lấy thống kê khách hàng cho user: ${user.id}`);
    return this.analyticsService.getCustomerAnalytics(user.id, startDate, endDate);
  }

  @Get('customers/list')
  getCustomerList(
    @CurrentUser() user: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('sortBy') sortBy?: 'totalSpent' | 'invoiceCount' | 'lastOrderDate' | 'totalDebt',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('limit') limit?: number
  ) {
    this.logger.log(`📋 GET /analytics/customers/list - Lấy danh sách khách hàng cho user: ${user.id}`);
    return this.analyticsService.getCustomerList(user.id, startDate, endDate, sortBy, sortOrder, limit);
  }

  @Get('customers/regions')
  getCustomerRegionAnalytics(
    @CurrentUser() user: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    this.logger.log(`🗺️ GET /analytics/customers/regions - Lấy thống kê khách hàng theo khu vực cho user: ${user.id}`);
    return this.analyticsService.getCustomerRegionAnalytics(user.id, startDate, endDate);
  }

  @Get('customers/regions/list')
  getCustomerListByRegion(
    @CurrentUser() user: any,
    @Query('region') region?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('sortBy') sortBy?: 'customerCount' | 'totalRevenue' | 'totalOrders',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('limit') limit?: number
  ) {
    this.logger.log(`📋 GET /analytics/customers/regions/list - Lấy danh sách khách hàng theo khu vực cho user: ${user.id}`);
    return this.analyticsService.getCustomerListByRegion(user.id, region, startDate, endDate, sortBy, sortOrder, limit);
  }

  // ==================== NHẬP HÀNG ====================

  @Get('stock-in')
  getStockInAnalytics(
    @CurrentUser() user: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    this.logger.log(`📥 GET /analytics/stock-in - Lấy thống kê nhập hàng cho user: ${user.id}`);
    return this.analyticsService.getStockInAnalytics(user.id, startDate, endDate);
  }

  @Get('stock-in/payments')
  getStockInPaymentAnalytics(
    @CurrentUser() user: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    this.logger.log(`💰 GET /analytics/stock-in/payments - Lấy thống kê thanh toán nhập hàng cho user: ${user.id}`);
    return this.analyticsService.getStockInPaymentSummary(user.id, startDate, endDate);
  }

  // ==================== THỜI GIAN ====================

  @Get('trends')
  getTimeBasedAnalytics(
    @CurrentUser() user: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    this.logger.log(`📈 GET /analytics/trends - Lấy thống kê xu hướng cho user: ${user.id}`);
    return this.analyticsService.getTimeBasedAnalytics(user.id, startDate, endDate);
  }

  // ==================== DASHBOARD ====================

  @Get('dashboard')
  getDashboardData(
    @CurrentUser() user: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    this.logger.log(`🎯 GET /analytics/dashboard - Lấy dữ liệu dashboard cho user: ${user.id}`);
    return this.analyticsService.getDashboardData(user.id, startDate, endDate);
  }

  // ==================== BÁO CÁO CHI TIẾT ====================

  @Get('reports/financial')
  getFinancialReport(
    @CurrentUser() user: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('format') format?: 'json' | 'csv'
  ) {
    this.logger.log(`📋 GET /analytics/reports/financial - Báo cáo tài chính cho user: ${user.id}`);
    return this.analyticsService.getRevenueAnalytics(user.id, startDate, endDate);
  }

  @Get('reports/inventory')
  getInventoryReport(
    @CurrentUser() user: any,
    @Query('format') format?: 'json' | 'csv'
  ) {
    this.logger.log(`📋 GET /analytics/reports/inventory - Báo cáo tồn kho cho user: ${user.id}`);
    return this.analyticsService.getInventoryAnalytics(user.id);
  }

  @Get('reports/customers')
  getCustomerReport(
    @CurrentUser() user: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('format') format?: 'json' | 'csv'
  ) {
    this.logger.log(`📋 GET /analytics/reports/customers - Báo cáo khách hàng cho user: ${user.id}`);
    return this.analyticsService.getCustomerAnalytics(user.id, startDate, endDate);
  }

  @Get('reports/stock-in')
  getStockInReport(
    @CurrentUser() user: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('format') format?: 'json' | 'csv'
  ) {
    this.logger.log(`📋 GET /analytics/reports/stock-in - Báo cáo nhập hàng cho user: ${user.id}`);
    return this.analyticsService.getStockInAnalytics(user.id, startDate, endDate);
  }

  // ==================== THỐNG KÊ NHANH ====================

  @Get('quick-stats')
  getQuickStats(@CurrentUser() user: any) {
    this.logger.log(`⚡ GET /analytics/quick-stats - Thống kê nhanh cho user: ${user.id}`);
    return this.analyticsService.getDashboardData(user.id);
  }

  @Get('alerts')
  getAlerts(@CurrentUser() user: any) {
    this.logger.log(`🚨 GET /analytics/alerts - Cảnh báo cho user: ${user.id}`);
    return this.analyticsService.getDashboardData(user.id).then(data => data.alerts);
  }

  // ==================== NỢ VÀ THANH TOÁN CHI TIẾT ====================

  @Get('debt')
  getDebtAnalytics(
    @CurrentUser() user: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    this.logger.log(`💳 GET /analytics/debt - Thống kê nợ chi tiết cho user: ${user.id}`);
    return this.analyticsService.getDebtAnalytics(user.id, startDate, endDate);
  }

  @Get('payments/history')
  getPaymentHistoryAnalytics(
    @CurrentUser() user: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    this.logger.log(`💸 GET /analytics/payments/history - Lịch sử thanh toán cho user: ${user.id}`);
    return this.analyticsService.getPaymentHistoryAnalytics(user.id, startDate, endDate);
  }

  @Get('debt/overdue')
  getOverdueDebtReport(
    @CurrentUser() user: any,
    @Query('daysOverdue') daysOverdue?: number
  ) {
    this.logger.log(`⚠️ GET /analytics/debt/overdue - Báo cáo nợ quá hạn cho user: ${user.id}`);
    return this.analyticsService.getOverdueDebtReport(user.id, daysOverdue);
  }

  // ==================== BÁO CÁO NỢ VÀ THANH TOÁN ====================

  @Get('reports/debt')
  getDebtReport(
    @CurrentUser() user: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('format') format?: 'json' | 'csv'
  ) {
    this.logger.log(`📋 GET /analytics/reports/debt - Báo cáo nợ cho user: ${user.id}`);
    return this.analyticsService.getDebtAnalytics(user.id, startDate, endDate);
  }

  @Get('reports/payments')
  getPaymentReport(
    @CurrentUser() user: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('format') format?: 'json' | 'csv'
  ) {
    this.logger.log(`📋 GET /analytics/reports/payments - Báo cáo thanh toán cho user: ${user.id}`);
    return this.analyticsService.getPaymentHistoryAnalytics(user.id, startDate, endDate);
  }

  @Get('reports/overdue')
  getOverdueReport(
    @CurrentUser() user: any,
    @Query('daysOverdue') daysOverdue?: number,
    @Query('format') format?: 'json' | 'csv'
  ) {
    this.logger.log(`📋 GET /analytics/reports/overdue - Báo cáo nợ quá hạn cho user: ${user.id}`);
    return this.analyticsService.getOverdueDebtReport(user.id, daysOverdue);
  }
}
