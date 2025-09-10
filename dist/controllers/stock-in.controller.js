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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockInController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const stock_in_service_1 = require("../services/stock-in.service");
const stock_in_dto_1 = require("../dto/stock-in.dto");
let StockInController = class StockInController {
    stockInService;
    constructor(stockInService) {
        this.stockInService = stockInService;
    }
    async createStockIn(createStockInDto, req) {
        const userId = req.user.userId;
        return await this.stockInService.createStockIn(createStockInDto, userId);
    }
    async getStockIns(query, req) {
        const userId = req.user.userId;
        return await this.stockInService.getStockIns(query, userId);
    }
    async getMaterialsForSelection(req) {
        const userId = req.user.userId;
        return await this.stockInService.getMaterialsForSelection(userId);
    }
    async getStockInStats(startDate, endDate, req) {
        const userId = req.user.userId;
        return await this.stockInService.getStockInStats(userId, startDate, endDate);
    }
    async getStockInById(id, req) {
        const userId = req.user.userId;
        return await this.stockInService.getStockInById(id, userId);
    }
    async updateStockIn(id, updateStockInDto, req) {
        const userId = req.user.userId;
        return await this.stockInService.updateStockIn(id, updateStockInDto, userId);
    }
    async updatePaymentStatus(id, updatePaymentStatusDto, req) {
        const userId = req.user.userId;
        return await this.stockInService.updatePaymentStatus(id, updatePaymentStatusDto, userId);
    }
    async updateStatus(id, updateStatusDto, req) {
        const userId = req.user.userId;
        return await this.stockInService.updateStatus(id, updateStatusDto, userId);
    }
    async deleteStockIn(id, req) {
        const userId = req.user.userId;
        await this.stockInService.deleteStockIn(id, userId);
    }
};
exports.StockInController = StockInController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [stock_in_dto_1.CreateStockInDto, Object]),
    __metadata("design:returntype", Promise)
], StockInController.prototype, "createStockIn", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [stock_in_dto_1.StockInQueryDto, Object]),
    __metadata("design:returntype", Promise)
], StockInController.prototype, "getStockIns", null);
__decorate([
    (0, common_1.Get)('materials'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StockInController.prototype, "getMaterialsForSelection", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], StockInController.prototype, "getStockInStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StockInController.prototype, "getStockInById", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, stock_in_dto_1.UpdateStockInDto, Object]),
    __metadata("design:returntype", Promise)
], StockInController.prototype, "updateStockIn", null);
__decorate([
    (0, common_1.Put)(':id/payment-status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, stock_in_dto_1.UpdatePaymentStatusDto, Object]),
    __metadata("design:returntype", Promise)
], StockInController.prototype, "updatePaymentStatus", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, stock_in_dto_1.UpdateStockInStatusDto, Object]),
    __metadata("design:returntype", Promise)
], StockInController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StockInController.prototype, "deleteStockIn", null);
exports.StockInController = StockInController = __decorate([
    (0, common_1.Controller)('stock-in'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [stock_in_service_1.StockInService])
], StockInController);
//# sourceMappingURL=stock-in.controller.js.map