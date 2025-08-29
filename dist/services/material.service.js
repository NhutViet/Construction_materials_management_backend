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
exports.MaterialService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const material_model_1 = require("../models/material.model");
let MaterialService = class MaterialService {
    materialModel;
    constructor(materialModel) {
        this.materialModel = materialModel;
    }
    async create(createMaterialDto, userId) {
        console.log('📝 Đang tạo vật liệu mới:', createMaterialDto.name, 'cho user:', userId);
        const materialData = {
            ...createMaterialDto,
            userId: new mongoose_2.Types.ObjectId(userId)
        };
        const createdMaterial = new this.materialModel(materialData);
        const result = await createdMaterial.save();
        console.log('✅ Đã tạo vật liệu thành công:', result.name, 'với ID:', result._id, 'cho user:', userId);
        return result;
    }
    async findAll(userId) {
        console.log('🔍 Đang lấy danh sách vật liệu cho user:', userId);
        const materials = await this.materialModel
            .find({ userId: new mongoose_2.Types.ObjectId(userId), isActive: true })
            .exec();
        console.log(`📊 Đã tìm thấy ${materials.length} vật liệu cho user ${userId}`);
        return materials;
    }
    async findOne(id, userId) {
        console.log('🔍 Đang tìm vật liệu với ID:', id, 'cho user:', userId);
        const material = await this.materialModel
            .findOne({ _id: id, userId: new mongoose_2.Types.ObjectId(userId) })
            .exec();
        if (!material) {
            console.log('❌ Không tìm thấy vật liệu với ID:', id, 'cho user:', userId);
            throw new common_1.NotFoundException(`Material with ID ${id} not found`);
        }
        console.log('✅ Đã tìm thấy vật liệu:', material.name, 'cho user:', userId);
        return material;
    }
    async update(id, updateMaterialDto, userId) {
        console.log('🔄 Đang cập nhật vật liệu với ID:', id, 'cho user:', userId);
        const existingMaterial = await this.materialModel
            .findOne({ _id: id, userId: new mongoose_2.Types.ObjectId(userId) })
            .exec();
        if (!existingMaterial) {
            throw new common_1.ForbiddenException('Bạn không có quyền cập nhật vật liệu này');
        }
        const updatedMaterial = await this.materialModel
            .findByIdAndUpdate(id, updateMaterialDto, { new: true })
            .exec();
        if (!updatedMaterial) {
            console.log('❌ Không tìm thấy vật liệu để cập nhật với ID:', id);
            throw new common_1.NotFoundException(`Material with ID ${id} not found`);
        }
        console.log('✅ Đã cập nhật vật liệu thành công:', updatedMaterial.name, 'cho user:', userId);
        return updatedMaterial;
    }
    async remove(id, userId) {
        console.log('🗑️ Đang xóa vật liệu với ID:', id, 'cho user:', userId);
        const existingMaterial = await this.materialModel
            .findOne({ _id: id, userId: new mongoose_2.Types.ObjectId(userId) })
            .exec();
        if (!existingMaterial) {
            throw new common_1.ForbiddenException('Bạn không có quyền xóa vật liệu này');
        }
        const removedMaterial = await this.materialModel
            .findByIdAndUpdate(id, { isActive: false }, { new: true })
            .exec();
        if (!removedMaterial) {
            console.log('❌ Không tìm thấy vật liệu để xóa với ID:', id);
            throw new common_1.NotFoundException(`Material with ID ${id} not found`);
        }
        console.log('✅ Đã xóa vật liệu thành công:', removedMaterial.name, 'cho user:', userId);
        return removedMaterial;
    }
    async findByCategory(category, userId) {
        console.log('🔍 Đang tìm vật liệu theo danh mục:', category, 'cho user:', userId);
        const materials = await this.materialModel
            .find({ category, userId: new mongoose_2.Types.ObjectId(userId), isActive: true })
            .exec();
        console.log(`📊 Đã tìm thấy ${materials.length} vật liệu trong danh mục "${category}" cho user ${userId}`);
        return materials;
    }
    async findLowStock(threshold = 10, userId) {
        console.log(`🔍 Đang tìm vật liệu sắp hết (dưới ${threshold} đơn vị) cho user:`, userId);
        const materials = await this.materialModel
            .find({
            quantity: { $lte: threshold },
            userId: new mongoose_2.Types.ObjectId(userId),
            isActive: true
        })
            .exec();
        console.log(`⚠️ Đã tìm thấy ${materials.length} vật liệu sắp hết cho user ${userId}`);
        return materials;
    }
    async findAllForAdmin() {
        console.log('🔍 Đang lấy danh sách tất cả vật liệu (admin mode)');
        const materials = await this.materialModel.find({ isActive: true }).exec();
        console.log(`📊 Đã tìm thấy ${materials.length} vật liệu (admin mode)`);
        return materials;
    }
};
exports.MaterialService = MaterialService;
exports.MaterialService = MaterialService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(material_model_1.Material.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], MaterialService);
//# sourceMappingURL=material.service.js.map