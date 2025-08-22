import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Material, MaterialDocument } from '../models/material.model';

@Injectable()
export class MaterialService {
  constructor(
    @InjectModel(Material.name) private materialModel: Model<MaterialDocument>,
  ) {}

  async create(createMaterialDto: Partial<Material>): Promise<Material> {
    console.log('📝 Đang tạo vật liệu mới:', createMaterialDto.name);
    const createdMaterial = new this.materialModel(createMaterialDto);
    const result = await createdMaterial.save();
    console.log('✅ Đã tạo vật liệu thành công:', result.name, 'với ID:', result._id);
    return result;
  }

  async findAll(): Promise<Material[]> {
    console.log('🔍 Đang lấy danh sách tất cả vật liệu...');
    const materials = await this.materialModel.find({ isActive: true }).exec();
    console.log(`📊 Đã tìm thấy ${materials.length} vật liệu`);
    return materials;
  }

  async findOne(id: string): Promise<Material> {
    console.log('🔍 Đang tìm vật liệu với ID:', id);
    const material = await this.materialModel.findById(id).exec();
    if (!material) {
      console.log('❌ Không tìm thấy vật liệu với ID:', id);
      throw new NotFoundException(`Material with ID ${id} not found`);
    }
    console.log('✅ Đã tìm thấy vật liệu:', material.name);
    return material;
  }

  async update(id: string, updateMaterialDto: Partial<Material>): Promise<Material> {
    console.log('🔄 Đang cập nhật vật liệu với ID:', id);
    const updatedMaterial = await this.materialModel
      .findByIdAndUpdate(id, updateMaterialDto, { new: true })
      .exec();
    if (!updatedMaterial) {
      console.log('❌ Không tìm thấy vật liệu để cập nhật với ID:', id);
      throw new NotFoundException(`Material with ID ${id} not found`);
    }
    console.log('✅ Đã cập nhật vật liệu thành công:', updatedMaterial.name);
    return updatedMaterial;
  }

  async remove(id: string): Promise<Material> {
    console.log('🗑️ Đang xóa vật liệu với ID:', id);
    const removedMaterial = await this.materialModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .exec();
    if (!removedMaterial) {
      console.log('❌ Không tìm thấy vật liệu để xóa với ID:', id);
      throw new NotFoundException(`Material with ID ${id} not found`);
    }
    console.log('✅ Đã xóa vật liệu thành công:', removedMaterial.name);
    return removedMaterial;
  }

  async findByCategory(category: string): Promise<Material[]> {
    console.log('🔍 Đang tìm vật liệu theo danh mục:', category);
    const materials = await this.materialModel
      .find({ category, isActive: true })
      .exec();
    console.log(`📊 Đã tìm thấy ${materials.length} vật liệu trong danh mục "${category}"`);
    return materials;
  }

  async findLowStock(threshold: number = 10): Promise<Material[]> {
    console.log(`🔍 Đang tìm vật liệu sắp hết (dưới ${threshold} đơn vị)...`);
    const materials = await this.materialModel
      .find({ quantity: { $lte: threshold }, isActive: true })
      .exec();
    console.log(`⚠️ Đã tìm thấy ${materials.length} vật liệu sắp hết`);
    return materials;
  }
}
