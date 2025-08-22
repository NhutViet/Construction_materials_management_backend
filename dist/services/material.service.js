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
    async create(createMaterialDto) {
        console.log('📝 Đang tạo vật liệu mới:', createMaterialDto.name);
        const createdMaterial = new this.materialModel(createMaterialDto);
        const result = await createdMaterial.save();
        console.log('✅ Đã tạo vật liệu thành công:', result.name, 'với ID:', result._id);
        return result;
    }
    async findAll() {
        console.log('🔍 Đang lấy danh sách tất cả vật liệu...');
        const materials = await this.materialModel.find({ isActive: true }).exec();
        console.log(`📊 Đã tìm thấy ${materials.length} vật liệu`);
        return materials;
    }
    async findOne(id) {
        console.log('🔍 Đang tìm vật liệu với ID:', id);
        const material = await this.materialModel.findById(id).exec();
        if (!material) {
            console.log('❌ Không tìm thấy vật liệu với ID:', id);
            throw new common_1.NotFoundException(`Material with ID ${id} not found`);
        }
        console.log('✅ Đã tìm thấy vật liệu:', material.name);
        return material;
    }
    async update(id, updateMaterialDto) {
        console.log('🔄 Đang cập nhật vật liệu với ID:', id);
        const updatedMaterial = await this.materialModel
            .findByIdAndUpdate(id, updateMaterialDto, { new: true })
            .exec();
        if (!updatedMaterial) {
            console.log('❌ Không tìm thấy vật liệu để cập nhật với ID:', id);
            throw new common_1.NotFoundException(`Material with ID ${id} not found`);
        }
        console.log('✅ Đã cập nhật vật liệu thành công:', updatedMaterial.name);
        return updatedMaterial;
    }
    async remove(id) {
        console.log('🗑️ Đang xóa vật liệu với ID:', id);
        const removedMaterial = await this.materialModel
            .findByIdAndUpdate(id, { isActive: false }, { new: true })
            .exec();
        if (!removedMaterial) {
            console.log('❌ Không tìm thấy vật liệu để xóa với ID:', id);
            throw new common_1.NotFoundException(`Material with ID ${id} not found`);
        }
        console.log('✅ Đã xóa vật liệu thành công:', removedMaterial.name);
        return removedMaterial;
    }
    async findByCategory(category) {
        console.log('🔍 Đang tìm vật liệu theo danh mục:', category);
        const materials = await this.materialModel
            .find({ category, isActive: true })
            .exec();
        console.log(`📊 Đã tìm thấy ${materials.length} vật liệu trong danh mục "${category}"`);
        return materials;
    }
    async findLowStock(threshold = 10) {
        console.log(`🔍 Đang tìm vật liệu sắp hết (dưới ${threshold} đơn vị)...`);
        const materials = await this.materialModel
            .find({ quantity: { $lte: threshold }, isActive: true })
            .exec();
        console.log(`⚠️ Đã tìm thấy ${materials.length} vật liệu sắp hết`);
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