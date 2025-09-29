import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Material, MaterialDocument } from '../models/material.model';

@Injectable()
export class MaterialService {
  constructor(
    @InjectModel(Material.name) private materialModel: Model<MaterialDocument>,
  ) {}

  async create(createMaterialDto: Partial<Material>, userId: string): Promise<Material> {
    console.log('📝 Đang tạo vật liệu mới:', createMaterialDto.name, 'cho user:', userId);
    console.log('💰 Tiền nhập:', createMaterialDto.importCost, 'Giá bán:', createMaterialDto.price);
    
    // Thêm userId vào material
    const materialData = {
      ...createMaterialDto,
      userId: new Types.ObjectId(userId)
    };
    
    const createdMaterial = new this.materialModel(materialData);
    const result = await createdMaterial.save();
    console.log('✅ Đã tạo vật liệu thành công:', result.name, 'với ID:', result._id, 'cho user:', userId);
    console.log('💰 Tiền nhập:', result.importCost, 'Giá bán:', result.price);
    return result;
  }

  async findAll(userId: string): Promise<Material[]> {
    console.log('🔍 Đang lấy danh sách vật liệu cho user:', userId);
    const materials = await this.materialModel
      .find({ userId: new Types.ObjectId(userId), isActive: true })
      .exec();
    console.log(`📊 Đã tìm thấy ${materials.length} vật liệu cho user ${userId}`);
    return materials;
  }

  async findOne(id: string, userId: string): Promise<Material> {
    console.log('🔍 Đang tìm vật liệu với ID:', id, 'cho user:', userId);
    const material = await this.materialModel
      .findOne({ _id: id, userId: new Types.ObjectId(userId) })
      .exec();
    if (!material) {
      console.log('❌ Không tìm thấy vật liệu với ID:', id, 'cho user:', userId);
      throw new NotFoundException(`Material with ID ${id} not found`);
    }
    console.log('✅ Đã tìm thấy vật liệu:', material.name, 'cho user:', userId);
    return material;
  }

  async update(id: string, updateMaterialDto: Partial<Material>, userId: string): Promise<Material> {
    console.log('🔄 Đang cập nhật vật liệu với ID:', id, 'cho user:', userId);
    
    // Kiểm tra quyền sở hữu
    const existingMaterial = await this.materialModel
      .findOne({ _id: id, userId: new Types.ObjectId(userId) })
      .exec();
    
    if (!existingMaterial) {
      throw new ForbiddenException('Bạn không có quyền cập nhật vật liệu này');
    }
    
    const updatedMaterial = await this.materialModel
      .findByIdAndUpdate(id, updateMaterialDto, { new: true })
      .exec();
    if (!updatedMaterial) {
      console.log('❌ Không tìm thấy vật liệu để cập nhật với ID:', id);
      throw new NotFoundException(`Material with ID ${id} not found`);
    }
    console.log('✅ Đã cập nhật vật liệu thành công:', updatedMaterial.name, 'cho user:', userId);
    console.log('💰 Tiền nhập:', updatedMaterial.importCost, 'Giá bán:', updatedMaterial.price);
    return updatedMaterial;
  }

  async remove(id: string, userId: string): Promise<Material> {
    console.log('🗑️ Đang xóa vật liệu với ID:', id, 'cho user:', userId);
    
    // Kiểm tra quyền sở hữu
    const existingMaterial = await this.materialModel
      .findOne({ _id: id, userId: new Types.ObjectId(userId) })
      .exec();
    
    if (!existingMaterial) {
      throw new ForbiddenException('Bạn không có quyền xóa vật liệu này');
    }
    
    const removedMaterial = await this.materialModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .exec();
    if (!removedMaterial) {
      console.log('❌ Không tìm thấy vật liệu để xóa với ID:', id);
      throw new NotFoundException(`Material with ID ${id} not found`);
    }
    console.log('✅ Đã xóa vật liệu thành công:', removedMaterial.name, 'cho user:', userId);
    return removedMaterial;
  }

  async findByCategory(category: string, userId: string): Promise<Material[]> {
    console.log('🔍 Đang tìm vật liệu theo danh mục:', category, 'cho user:', userId);
    const materials = await this.materialModel
      .find({ category, userId: new Types.ObjectId(userId), isActive: true })
      .exec();
    console.log(`📊 Đã tìm thấy ${materials.length} vật liệu trong danh mục "${category}" cho user ${userId}`);
    return materials;
  }

  async findLowStock(threshold: number = 10, userId: string): Promise<Material[]> {
    console.log(`🔍 Đang tìm vật liệu sắp hết (dưới ${threshold} đơn vị) cho user:`, userId);
    const materials = await this.materialModel
      .find({ 
        quantity: { $lte: threshold }, 
        userId: new Types.ObjectId(userId), 
        isActive: true 
      })
      .exec();
    console.log(`⚠️ Đã tìm thấy ${materials.length} vật liệu sắp hết cho user ${userId}`);
    return materials;
  }

  // Phương thức để tìm tất cả materials (cho admin hoặc mục đích đặc biệt)
  async findAllForAdmin(): Promise<Material[]> {
    console.log('🔍 Đang lấy danh sách tất cả vật liệu (admin mode)');
    const materials = await this.materialModel.find({ isActive: true }).exec();
    console.log(`📊 Đã tìm thấy ${materials.length} vật liệu (admin mode)`);
    return materials;
  }
}
