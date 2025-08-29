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
var MaterialController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaterialController = void 0;
const common_1 = require("@nestjs/common");
const material_service_1 = require("../services/material.service");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const current_user_decorator_1 = require("../decorators/current-user.decorator");
let MaterialController = MaterialController_1 = class MaterialController {
    materialService;
    logger = new common_1.Logger(MaterialController_1.name);
    constructor(materialService) {
        this.materialService = materialService;
    }
    create(createMaterialDto, user) {
        this.logger.log(`📝 POST /materials - Tạo vật liệu mới: ${createMaterialDto.name} cho user: ${user.id}`);
        return this.materialService.create(createMaterialDto, user.id);
    }
    findAll(user) {
        this.logger.log(`🔍 GET /materials - Lấy danh sách vật liệu cho user: ${user.id}`);
        return this.materialService.findAll(user.id);
    }
    findLowStock(user) {
        this.logger.log(`⚠️ GET /materials/low-stock - Lấy danh sách vật liệu sắp hết cho user: ${user.id}`);
        return this.materialService.findLowStock(10, user.id);
    }
    findByCategory(category, user) {
        this.logger.log(`🔍 GET /materials/category/${category} - Lấy vật liệu theo danh mục cho user: ${user.id}`);
        return this.materialService.findByCategory(category, user.id);
    }
    findOne(id, user) {
        this.logger.log(`🔍 GET /materials/${id} - Lấy thông tin vật liệu theo ID cho user: ${user.id}`);
        return this.materialService.findOne(id, user.id);
    }
    update(id, updateMaterialDto, user) {
        this.logger.log(`🔄 PATCH /materials/${id} - Cập nhật vật liệu cho user: ${user.id}`);
        return this.materialService.update(id, updateMaterialDto, user.id);
    }
    remove(id, user) {
        this.logger.log(`🗑️ DELETE /materials/${id} - Xóa vật liệu cho user: ${user.id}`);
        return this.materialService.remove(id, user.id);
    }
};
exports.MaterialController = MaterialController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], MaterialController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MaterialController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('low-stock'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MaterialController.prototype, "findLowStock", null);
__decorate([
    (0, common_1.Get)('category/:category'),
    __param(0, (0, common_1.Param)('category')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], MaterialController.prototype, "findByCategory", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], MaterialController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], MaterialController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], MaterialController.prototype, "remove", null);
exports.MaterialController = MaterialController = MaterialController_1 = __decorate([
    (0, common_1.Controller)('materials'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [material_service_1.MaterialService])
], MaterialController);
//# sourceMappingURL=material.controller.js.map