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
var AnalyticsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const analytics_service_1 = require("../services/analytics.service");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const current_user_decorator_1 = require("../decorators/current-user.decorator");
let AnalyticsController = AnalyticsController_1 = class AnalyticsController {
    analyticsService;
    logger = new common_1.Logger(AnalyticsController_1.name);
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
    }
    getRevenueAnalytics(user, startDate, endDate) {
        this.logger.log(`📊 GET /analytics/revenue - Lấy thống kê doanh thu cho user: ${user.id}`);
        return this.analyticsService.getRevenueAnalytics(user.id, startDate, endDate);
    }
    getPaymentAnalytics(user, startDate, endDate) {
        this.logger.log(`💰 GET /analytics/payments - Lấy thống kê thanh toán cho user: ${user.id}`);
        return this.analyticsService.getPaymentAnalytics(user.id, startDate, endDate);
    }
    getInventoryAnalytics(user) {
        this.logger.log(`📦 GET /analytics/inventory - Lấy thống kê tồn kho cho user: ${user.id}`);
        return this.analyticsService.getInventoryAnalytics(user.id);
    }
    getCustomerAnalytics(user, startDate, endDate) {
        this.logger.log(`👥 GET /analytics/customers - Lấy thống kê khách hàng cho user: ${user.id}`);
        return this.analyticsService.getCustomerAnalytics(user.id, startDate, endDate);
    }
    getCustomerList(user, startDate, endDate, sortBy, sortOrder, limit) {
        this.logger.log(`📋 GET /analytics/customers/list - Lấy danh sách khách hàng cho user: ${user.id}`);
        return this.analyticsService.getCustomerList(user.id, startDate, endDate, sortBy, sortOrder, limit);
    }
    getCustomerRegionAnalytics(user, startDate, endDate) {
        this.logger.log(`🗺️ GET /analytics/customers/regions - Lấy thống kê khách hàng theo khu vực cho user: ${user.id}`);
        return this.analyticsService.getCustomerRegionAnalytics(user.id, startDate, endDate);
    }
    getCustomerListByRegion(user, region, startDate, endDate, sortBy, sortOrder, limit) {
        this.logger.log(`📋 GET /analytics/customers/regions/list - Lấy danh sách khách hàng theo khu vực cho user: ${user.id}`);
        return this.analyticsService.getCustomerListByRegion(user.id, region, startDate, endDate, sortBy, sortOrder, limit);
    }
    getStockInAnalytics(user, startDate, endDate) {
        this.logger.log(`📥 GET /analytics/stock-in - Lấy thống kê nhập hàng cho user: ${user.id}`);
        return this.analyticsService.getStockInAnalytics(user.id, startDate, endDate);
    }
    getStockInPaymentAnalytics(user, startDate, endDate) {
        this.logger.log(`💰 GET /analytics/stock-in/payments - Lấy thống kê thanh toán nhập hàng cho user: ${user.id}`);
        return this.analyticsService.getStockInPaymentSummary(user.id, startDate, endDate);
    }
    getTimeBasedAnalytics(user, startDate, endDate) {
        this.logger.log(`📈 GET /analytics/trends - Lấy thống kê xu hướng cho user: ${user.id}`);
        return this.analyticsService.getTimeBasedAnalytics(user.id, startDate, endDate);
    }
    getDashboardData(user, startDate, endDate) {
        this.logger.log(`🎯 GET /analytics/dashboard - Lấy dữ liệu dashboard cho user: ${user.id}`);
        return this.analyticsService.getDashboardData(user.id, startDate, endDate);
    }
    getFinancialReport(user, startDate, endDate, format) {
        this.logger.log(`📋 GET /analytics/reports/financial - Báo cáo tài chính cho user: ${user.id}`);
        return this.analyticsService.getRevenueAnalytics(user.id, startDate, endDate);
    }
    getInventoryReport(user, format) {
        this.logger.log(`📋 GET /analytics/reports/inventory - Báo cáo tồn kho cho user: ${user.id}`);
        return this.analyticsService.getInventoryAnalytics(user.id);
    }
    getCustomerReport(user, startDate, endDate, format) {
        this.logger.log(`📋 GET /analytics/reports/customers - Báo cáo khách hàng cho user: ${user.id}`);
        return this.analyticsService.getCustomerAnalytics(user.id, startDate, endDate);
    }
    getStockInReport(user, startDate, endDate, format) {
        this.logger.log(`📋 GET /analytics/reports/stock-in - Báo cáo nhập hàng cho user: ${user.id}`);
        return this.analyticsService.getStockInAnalytics(user.id, startDate, endDate);
    }
    getQuickStats(user) {
        this.logger.log(`⚡ GET /analytics/quick-stats - Thống kê nhanh cho user: ${user.id}`);
        return this.analyticsService.getDashboardData(user.id);
    }
    getAlerts(user) {
        this.logger.log(`🚨 GET /analytics/alerts - Cảnh báo cho user: ${user.id}`);
        return this.analyticsService.getDashboardData(user.id).then(data => data.alerts);
    }
    getDebtAnalytics(user, startDate, endDate) {
        this.logger.log(`💳 GET /analytics/debt - Thống kê nợ chi tiết cho user: ${user.id}`);
        return this.analyticsService.getDebtAnalytics(user.id, startDate, endDate);
    }
    getPaymentHistoryAnalytics(user, startDate, endDate) {
        this.logger.log(`💸 GET /analytics/payments/history - Lịch sử thanh toán cho user: ${user.id}`);
        return this.analyticsService.getPaymentHistoryAnalytics(user.id, startDate, endDate);
    }
    getOverdueDebtReport(user, daysOverdue) {
        this.logger.log(`⚠️ GET /analytics/debt/overdue - Báo cáo nợ quá hạn cho user: ${user.id}`);
        return this.analyticsService.getOverdueDebtReport(user.id, daysOverdue);
    }
    getDebtReport(user, startDate, endDate, format) {
        this.logger.log(`📋 GET /analytics/reports/debt - Báo cáo nợ cho user: ${user.id}`);
        return this.analyticsService.getDebtAnalytics(user.id, startDate, endDate);
    }
    getPaymentReport(user, startDate, endDate, format) {
        this.logger.log(`📋 GET /analytics/reports/payments - Báo cáo thanh toán cho user: ${user.id}`);
        return this.analyticsService.getPaymentHistoryAnalytics(user.id, startDate, endDate);
    }
    getOverdueReport(user, daysOverdue, format) {
        this.logger.log(`📋 GET /analytics/reports/overdue - Báo cáo nợ quá hạn cho user: ${user.id}`);
        return this.analyticsService.getOverdueDebtReport(user.id, daysOverdue);
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Get)('revenue'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getRevenueAnalytics", null);
__decorate([
    (0, common_1.Get)('payments'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getPaymentAnalytics", null);
__decorate([
    (0, common_1.Get)('inventory'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getInventoryAnalytics", null);
__decorate([
    (0, common_1.Get)('customers'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getCustomerAnalytics", null);
__decorate([
    (0, common_1.Get)('customers/list'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, common_1.Query)('sortBy')),
    __param(4, (0, common_1.Query)('sortOrder')),
    __param(5, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, Number]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getCustomerList", null);
__decorate([
    (0, common_1.Get)('customers/regions'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getCustomerRegionAnalytics", null);
__decorate([
    (0, common_1.Get)('customers/regions/list'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('region')),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __param(4, (0, common_1.Query)('sortBy')),
    __param(5, (0, common_1.Query)('sortOrder')),
    __param(6, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, Number]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getCustomerListByRegion", null);
__decorate([
    (0, common_1.Get)('stock-in'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getStockInAnalytics", null);
__decorate([
    (0, common_1.Get)('stock-in/payments'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getStockInPaymentAnalytics", null);
__decorate([
    (0, common_1.Get)('trends'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getTimeBasedAnalytics", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getDashboardData", null);
__decorate([
    (0, common_1.Get)('reports/financial'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, common_1.Query)('format')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getFinancialReport", null);
__decorate([
    (0, common_1.Get)('reports/inventory'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('format')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getInventoryReport", null);
__decorate([
    (0, common_1.Get)('reports/customers'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, common_1.Query)('format')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getCustomerReport", null);
__decorate([
    (0, common_1.Get)('reports/stock-in'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, common_1.Query)('format')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getStockInReport", null);
__decorate([
    (0, common_1.Get)('quick-stats'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getQuickStats", null);
__decorate([
    (0, common_1.Get)('alerts'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getAlerts", null);
__decorate([
    (0, common_1.Get)('debt'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getDebtAnalytics", null);
__decorate([
    (0, common_1.Get)('payments/history'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getPaymentHistoryAnalytics", null);
__decorate([
    (0, common_1.Get)('debt/overdue'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('daysOverdue')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getOverdueDebtReport", null);
__decorate([
    (0, common_1.Get)('reports/debt'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, common_1.Query)('format')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getDebtReport", null);
__decorate([
    (0, common_1.Get)('reports/payments'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, common_1.Query)('format')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getPaymentReport", null);
__decorate([
    (0, common_1.Get)('reports/overdue'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('daysOverdue')),
    __param(2, (0, common_1.Query)('format')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getOverdueReport", null);
exports.AnalyticsController = AnalyticsController = AnalyticsController_1 = __decorate([
    (0, common_1.Controller)('analytics'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map