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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardDataDto = exports.TimeBasedAnalyticsDto = exports.StockInAnalyticsDto = exports.CustomerAnalyticsDto = exports.InventoryAnalyticsDto = exports.PaymentAnalyticsDto = exports.RevenueAnalyticsDto = exports.QuickStatsDto = exports.DateRangeDto = exports.AnalyticsQueryDto = void 0;
const class_validator_1 = require("class-validator");
class AnalyticsQueryDto {
    startDate;
    endDate;
    format;
    category;
    supplier;
    customerId;
}
exports.AnalyticsQueryDto = AnalyticsQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AnalyticsQueryDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AnalyticsQueryDto.prototype, "endDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['json', 'csv']),
    __metadata("design:type", String)
], AnalyticsQueryDto.prototype, "format", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AnalyticsQueryDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AnalyticsQueryDto.prototype, "supplier", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AnalyticsQueryDto.prototype, "customerId", void 0);
class DateRangeDto {
    startDate;
    endDate;
}
exports.DateRangeDto = DateRangeDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], DateRangeDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], DateRangeDto.prototype, "endDate", void 0);
class QuickStatsDto {
    period;
}
exports.QuickStatsDto = QuickStatsDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['today', 'week', 'month', 'quarter', 'year']),
    __metadata("design:type", String)
], QuickStatsDto.prototype, "period", void 0);
class RevenueAnalyticsDto {
    totalRevenue;
    revenueByMonth;
    averageOrderValue;
    revenueGrowth;
    paymentMethodRevenue;
}
exports.RevenueAnalyticsDto = RevenueAnalyticsDto;
class PaymentAnalyticsDto {
    paymentStatusStats;
    debtAnalysis;
    paymentMethodStats;
    overdueInvoices;
}
exports.PaymentAnalyticsDto = PaymentAnalyticsDto;
class InventoryAnalyticsDto {
    inventoryOverview;
    lowStockItems;
    topSellingMaterials;
    slowMovingItems;
    categoryAnalysis;
    inventoryValue;
}
exports.InventoryAnalyticsDto = InventoryAnalyticsDto;
class CustomerAnalyticsDto {
    customerOverview;
    topCustomers;
    customerSegments;
    customerRetention;
    newVsReturningCustomers;
    customerDetails;
    customerPaymentAnalysis;
    summary;
}
exports.CustomerAnalyticsDto = CustomerAnalyticsDto;
class StockInAnalyticsDto {
    stockInOverview;
    supplierAnalysis;
    paymentStatusAnalysis;
    processingTimeAnalysis;
}
exports.StockInAnalyticsDto = StockInAnalyticsDto;
class TimeBasedAnalyticsDto {
    dailyTrends;
    weeklyTrends;
    monthlyTrends;
    seasonalAnalysis;
    yearOverYearComparison;
}
exports.TimeBasedAnalyticsDto = TimeBasedAnalyticsDto;
class DashboardDataDto {
    financialSummary;
    inventorySummary;
    customerSummary;
    stockInSummary;
    alerts;
    lastUpdated;
}
exports.DashboardDataDto = DashboardDataDto;
//# sourceMappingURL=analytics.dto.js.map