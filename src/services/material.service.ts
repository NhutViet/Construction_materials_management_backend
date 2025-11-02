import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Material, MaterialDocument } from '../models/material.model';
import { CreateMaterialDto, UpdateMaterialDto } from '../dto/material.dto';

@Injectable()
export class MaterialService {
  constructor(
    @InjectModel(Material.name) private materialModel: Model<MaterialDocument>,
  ) {}

  async create(createMaterialDto: CreateMaterialDto, userId: string): Promise<Material> {
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

  async update(id: string, updateMaterialDto: UpdateMaterialDto, userId: string): Promise<Material | { material: Material; affectedInvoices: any[] }> {
    console.log('🔄 Đang cập nhật vật liệu với ID:', id, 'cho user:', userId);
    
    // Kiểm tra quyền sở hữu
    const existingMaterial = await this.materialModel
      .findOne({ _id: id, userId: new Types.ObjectId(userId) })
      .exec();
    
    if (!existingMaterial) {
      throw new ForbiddenException('Bạn không có quyền cập nhật vật liệu này');
    }

    // Kiểm tra xem có cập nhật giá không
    const isPriceUpdate = updateMaterialDto.price !== undefined && updateMaterialDto.price !== existingMaterial.price;
    const shouldUpdateInvoices = updateMaterialDto.updateAffectedInvoices !== false; // Mặc định true

    if (isPriceUpdate) {
      console.log(`💰 Phát hiện cập nhật giá: ${existingMaterial.price} → ${updateMaterialDto.price} VNĐ`);
      
      // Validation giá mới
      if (updateMaterialDto.price! <= 0) {
        throw new BadRequestException('Giá sản phẩm phải lớn hơn 0');
      }

      // Nếu cần cập nhật hóa đơn bị ảnh hưởng
      if (shouldUpdateInvoices) {
        console.log('🔄 Sẽ cập nhật các hóa đơn bị ảnh hưởng');
        return await this.updateWithInvoiceRecalculation(id, updateMaterialDto, userId);
      } else {
        console.log('⚠️ Bỏ qua cập nhật hóa đơn bị ảnh hưởng');
      }
    }
    
    // Cập nhật thông thường (không có thay đổi giá hoặc không cần cập nhật hóa đơn)
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

  // Cập nhật với tính toán lại hóa đơn
  private async updateWithInvoiceRecalculation(
    id: string, 
    updateMaterialDto: UpdateMaterialDto, 
    userId: string
  ): Promise<{ material: Material; affectedInvoices: any[] }> {
    console.log(`💰 Cập nhật giá sản phẩm ${id} thành ${updateMaterialDto.price} VNĐ cho user: ${userId}`);
    
    const material = await this.materialModel.findById(id);
    if (!material) {
      throw new NotFoundException(`Không tìm thấy sản phẩm với ID ${id}`);
    }
    const oldPrice = material.price;
    console.log(`📊 Giá cũ: ${oldPrice} VNĐ → Giá mới: ${updateMaterialDto.price} VNĐ`);

    // Cập nhật giá sản phẩm
    const updatedMaterial = await this.materialModel
      .findByIdAndUpdate(
        id, 
        { 
          ...updateMaterialDto,
          updatedAt: new Date()
        }, 
        { new: true }
      )
      .exec();

    if (!updatedMaterial) {
      throw new NotFoundException(`Không thể cập nhật sản phẩm với ID ${id}`);
    }

    console.log(`✅ Đã cập nhật giá sản phẩm ${updatedMaterial.name}: ${oldPrice} → ${updatedMaterial.price} VNĐ`);
    
    // Tìm và cập nhật các hóa đơn chưa hoàn thành có chứa sản phẩm này
    const affectedInvoices = await this.updateAffectedInvoices(id, updateMaterialDto.price!, userId, updateMaterialDto.priceUpdateReason);

    return {
      material: updatedMaterial,
      affectedInvoices
    };
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


  // Cập nhật các hóa đơn bị ảnh hưởng bởi việc thay đổi giá
  private async updateAffectedInvoices(materialId: string, newPrice: number, userId: string, priceUpdateReason?: string): Promise<any[]> {
    console.log(`🔄 Tìm và cập nhật các hóa đơn chưa hoàn thành có chứa sản phẩm ${materialId}`);
    
    // Tìm các hóa đơn chưa hoàn thành có chứa sản phẩm này
    // Loại trừ các hóa đơn đã thanh toán đầy đủ (paymentStatus = 'paid')
    const affectedInvoices = await this.materialModel.db.model('Invoice')
      .find({
        'items.materialId': materialId,
        'items.deliveryStatus': { $in: ['pending', 'partial'] },
        isDeleted: false,
        createdBy: new Types.ObjectId(userId),
        paymentStatus: { $ne: 'paid' } // Không cập nhật giá cho hóa đơn đã thanh toán
      })
      .exec();

    console.log(`📋 Tìm thấy ${affectedInvoices.length} hóa đơn chưa hoàn thành và chưa thanh toán cần cập nhật`);

    const updatedInvoices: any[] = [];
    const skippedInvoices: any[] = [];

    for (const invoice of affectedInvoices) {
      try {
        // Kiểm tra lại trạng thái thanh toán để đảm bảo an toàn
        if (invoice.paymentStatus === 'paid') {
          console.log(`⏭️ Bỏ qua hóa đơn ${invoice.invoiceNumber} - đã thanh toán đầy đủ`);
          skippedInvoices.push({
            invoiceId: invoice._id,
            invoiceNumber: invoice.invoiceNumber,
            reason: 'Hóa đơn đã thanh toán đầy đủ, không thể thay đổi giá'
          });
          continue;
        }
        // Cập nhật giá cho các items chưa giao hàng
        const updatedItems = invoice.items.map((item: any) => {
          if (item.materialId.toString() === materialId && 
              (item.deliveryStatus === 'pending' || item.deliveryStatus === 'partial')) {
            
            const deliveredQuantity = item.deliveredQuantity || 0;
            const remainingQuantity = item.quantity - deliveredQuantity;
            
            // Lưu giá ban đầu nếu chưa có
            const originalUnitPrice = item.originalUnitPrice || item.unitPrice;
            const originalTotalPrice = item.originalTotalPrice || item.totalPrice;
            
            // Tính tổng tiền mới: phần đã giao giữ nguyên giá cũ + phần chưa giao áp dụng giá mới
            const deliveredAmount = deliveredQuantity * originalUnitPrice;
            const remainingAmount = remainingQuantity * newPrice;
            const newTotalPrice = deliveredAmount + remainingAmount;
            const priceAdjustmentAmount = newTotalPrice - originalTotalPrice;
            
            console.log(`📦 Cập nhật item ${item.materialName}:`);
            console.log(`   - Giá ban đầu: ${originalUnitPrice} VNĐ/tấn`);
            console.log(`   - Giá mới: ${newPrice} VNĐ/tấn`);
            console.log(`   - Đã giao: ${deliveredQuantity} x ${originalUnitPrice} = ${deliveredQuantity * originalUnitPrice} VNĐ`);
            console.log(`   - Chưa giao: ${remainingQuantity} x ${newPrice} = ${remainingQuantity * newPrice} VNĐ`);
            console.log(`   - Tổng mới: ${newTotalPrice} VNĐ`);
            console.log(`   - Điều chỉnh: ${priceAdjustmentAmount} VNĐ`);
            
            return {
              ...item,
              unitPrice: newPrice, // Giá hiện tại
              totalPrice: newTotalPrice, // Tổng giá hiện tại
              // Lưu thông tin giá ban đầu
              originalUnitPrice: originalUnitPrice,
              originalTotalPrice: originalTotalPrice,
              // Lưu thông tin giá đã điều chỉnh
              adjustedUnitPrice: newPrice,
              adjustedTotalPrice: newTotalPrice,
              priceAdjustmentAmount: priceAdjustmentAmount,
              priceAdjustmentReason: priceUpdateReason || 'Điều chỉnh giá sản phẩm',
              priceAdjustedAt: new Date(),
              priceAdjustedBy: new Types.ObjectId(userId)
            };
          }
          return item;
        });

        // Tính lại tổng tiền hóa đơn dựa trên giá trị thực tế đã giao và chưa giao
        let totalDeliveredAmount = 0;
        let totalRemainingAmount = 0;
        
        for (const item of updatedItems) {
          const deliveredQuantity = item.deliveredQuantity || 0;
          const remainingQuantity = item.quantity - deliveredQuantity;
          
          // Tính tổng tiền đã giao dựa trên lịch sử giao hàng thực tế
          let itemDeliveredAmount = 0;
          if (item.deliveryHistory && item.deliveryHistory.length > 0) {
            itemDeliveredAmount = item.deliveryHistory.reduce((sum: number, record: any) => sum + record.totalAmount, 0);
          } else {
            itemDeliveredAmount = deliveredQuantity * (item.originalUnitPrice || item.unitPrice);
          }
          
          // Tính tổng tiền cho phần chưa giao với giá hiện tại
          const itemRemainingAmount = remainingQuantity * item.unitPrice;
          
          totalDeliveredAmount += itemDeliveredAmount;
          totalRemainingAmount += itemRemainingAmount;
          
          // Cập nhật totalPrice cho item
          item.totalPrice = itemDeliveredAmount + itemRemainingAmount;
        }
        
        const subtotal = totalDeliveredAmount + totalRemainingAmount;
        const taxAmount = (subtotal * (invoice.taxRate || 0)) / 100;
        const discountAmount = (subtotal * (invoice.discountRate || 0)) / 100;
        const newTotalAmount = subtotal + taxAmount - discountAmount;
        
        // Tính lại remainingAmount
        const newRemainingAmount = newTotalAmount - invoice.paidAmount;

        // Tính toán thông tin điều chỉnh giá cho toàn bộ hóa đơn
        const originalTotalAmount = invoice.originalTotalAmount || invoice.totalAmount;
        const totalPriceAdjustmentAmount = newTotalAmount - originalTotalAmount;
        
        // Cập nhật hóa đơn với thông tin điều chỉnh giá
        const updatedInvoice = await this.materialModel.db.model('Invoice')
          .findByIdAndUpdate(
            invoice._id,
            {
              items: updatedItems,
              subtotal,
              taxAmount,
              discountAmount,
              totalAmount: newTotalAmount,
              remainingAmount: newRemainingAmount,
              // Cập nhật thông tin điều chỉnh giá
              originalTotalAmount: originalTotalAmount,
              adjustedTotalAmount: newTotalAmount,
              totalPriceAdjustmentAmount: totalPriceAdjustmentAmount,
              priceAdjustmentReason: priceUpdateReason || `Điều chỉnh giá sản phẩm ${materialId}`,
              priceAdjustedAt: new Date(),
              priceAdjustedBy: new Types.ObjectId(userId),
              updatedAt: new Date()
            },
            { new: true }
          )
          .populate('customerId', 'name email')
          .populate('createdBy', 'name email')
          .populate('priceAdjustedBy', 'name email')
          .exec();

        if (updatedInvoice) {
          updatedInvoices.push({
            invoiceId: updatedInvoice._id,
            invoiceNumber: updatedInvoice.invoiceNumber,
            customerName: updatedInvoice.customerName,
            oldTotalAmount: invoice.totalAmount,
            newTotalAmount: updatedInvoice.totalAmount,
            priceDifference: updatedInvoice.totalAmount - invoice.totalAmount,
            // Thông tin điều chỉnh giá
            originalTotalAmount: updatedInvoice.originalTotalAmount,
            adjustedTotalAmount: updatedInvoice.adjustedTotalAmount,
            totalPriceAdjustmentAmount: updatedInvoice.totalPriceAdjustmentAmount,
            priceAdjustmentReason: updatedInvoice.priceAdjustmentReason,
            priceAdjustedAt: updatedInvoice.priceAdjustedAt,
            priceAdjustedBy: updatedInvoice.priceAdjustedBy,
            items: updatedItems.filter((item: any) => item.materialId.toString() === materialId)
          });
          
          console.log(`✅ Đã cập nhật hóa đơn ${updatedInvoice.invoiceNumber}: ${invoice.totalAmount} → ${updatedInvoice.totalAmount} VNĐ`);
        }
      } catch (error: any) {
        console.error(`❌ Lỗi khi cập nhật hóa đơn ${invoice.invoiceNumber}:`, error.message);
      }
    }

    if (skippedInvoices.length > 0) {
      console.log(`⏭️ Đã bỏ qua ${skippedInvoices.length} hóa đơn đã thanh toán`);
    }
    console.log(`✅ Hoàn thành cập nhật ${updatedInvoices.length} hóa đơn`);
    return updatedInvoices;
  }
}
