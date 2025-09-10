import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { StockIn, StockInDocument } from '../models/stock-in.model';
import { Material, MaterialDocument } from '../models/material.model';
import { CreateStockInDto, UpdateStockInDto, UpdatePaymentStatusDto, UpdateStockInStatusDto, StockInQueryDto } from '../dto/stock-in.dto';

@Injectable()
export class StockInService {
  constructor(
    @InjectModel(StockIn.name) private stockInModel: Model<StockInDocument>,
    @InjectModel(Material.name) private materialModel: Model<MaterialDocument>,
  ) {}

  // Tạo phiếu nhập hàng mới
  async createStockIn(createStockInDto: CreateStockInDto, userId: string): Promise<StockIn> {
    // Tạo số phiếu nhập hàng tự động
    const stockInNumber = await this.generateStockInNumber();

    // Tính toán các giá trị
    const subtotal = createStockInDto.subtotal || 0;
    const taxAmount = createStockInDto.taxAmount || 0;
    const discountAmount = createStockInDto.discountAmount || 0;
    const totalAmount = subtotal + taxAmount - discountAmount;

    const stockIn = new this.stockInModel({
      ...createStockInDto,
      stockInNumber,
      userId: new Types.ObjectId(userId),
      subtotal,
      taxAmount,
      discountAmount,
      totalAmount,
      remainingAmount: totalAmount,
      createdBy: new Types.ObjectId(userId),
    });

    return await stockIn.save();
  }

  // Lấy danh sách phiếu nhập hàng với filter và pagination
  async getStockIns(query: StockInQueryDto, userId: string): Promise<{ data: StockIn[]; total: number; page: number; limit: number }> {
    const {
      search,
      paymentStatus,
      status,
      supplier,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = query;

    const filter: any = {
      userId: new Types.ObjectId(userId),
      isDeleted: false,
    };

    // Tìm kiếm theo từ khóa
    if (search) {
      filter.$or = [
        { stockInNumber: { $regex: search, $options: 'i' } },
        { supplier: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter theo trạng thái thanh toán
    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    // Filter theo trạng thái phiếu nhập
    if (status) {
      filter.status = status;
    }

    // Filter theo nhà cung cấp
    if (supplier) {
      filter.supplier = { $regex: supplier, $options: 'i' };
    }

    // Filter theo khoảng thời gian
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.stockInModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email')
        .populate('approvedBy', 'name email')
        .exec(),
      this.stockInModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  // Lấy chi tiết phiếu nhập hàng
  async getStockInById(id: string, userId: string): Promise<StockIn> {
    const stockIn = await this.stockInModel
      .findOne({
        _id: new Types.ObjectId(id),
        userId: new Types.ObjectId(userId),
        isDeleted: false,
      })
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .exec();

    if (!stockIn) {
      throw new NotFoundException('Phiếu nhập hàng không tồn tại');
    }

    return stockIn;
  }

  // Cập nhật phiếu nhập hàng
  async updateStockIn(id: string, updateStockInDto: UpdateStockInDto, userId: string): Promise<StockIn> {
    const stockIn = await this.getStockInById(id, userId);

    // Nếu đã được duyệt thì không cho phép chỉnh sửa
    if (stockIn.status === 'approved') {
      throw new BadRequestException('Không thể chỉnh sửa phiếu nhập hàng đã được duyệt');
    }

    // Tính toán lại các giá trị nếu có thay đổi
    let updateData: any = { ...updateStockInDto };
    if (updateStockInDto.subtotal !== undefined || updateStockInDto.taxAmount !== undefined || updateStockInDto.discountAmount !== undefined) {
      const subtotal = updateStockInDto.subtotal || stockIn.subtotal;
      const taxAmount = updateStockInDto.taxAmount || stockIn.taxAmount;
      const discountAmount = updateStockInDto.discountAmount || stockIn.discountAmount;
      const totalAmount = subtotal + taxAmount - discountAmount;

      updateData.totalAmount = totalAmount;
      updateData.remainingAmount = totalAmount - stockIn.paidAmount;
    }

    const updatedStockIn = await this.stockInModel
      .findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true }
      )
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .exec();

    if (!updatedStockIn) {
      throw new NotFoundException('Phiếu nhập hàng không tồn tại');
    }

    return updatedStockIn;
  }

  // Cập nhật trạng thái thanh toán
  async updatePaymentStatus(id: string, updatePaymentStatusDto: UpdatePaymentStatusDto, userId: string): Promise<StockIn> {
    const stockIn = await this.getStockInById(id, userId);

    const { paymentStatus, paidAmount } = updatePaymentStatusDto;

    // Kiểm tra số tiền thanh toán
    if (paidAmount > stockIn.totalAmount) {
      throw new BadRequestException('Số tiền thanh toán không được vượt quá tổng tiền phiếu nhập');
    }

    if (paidAmount < 0) {
      throw new BadRequestException('Số tiền thanh toán không được âm');
    }

    // Tính toán trạng thái thanh toán
    let newPaymentStatus = paymentStatus;
    if (paidAmount === 0) {
      newPaymentStatus = 'unpaid';
    } else if (paidAmount === stockIn.totalAmount) {
      newPaymentStatus = 'paid';
    } else {
      newPaymentStatus = 'partial';
    }

    const remainingAmount = stockIn.totalAmount - paidAmount;

    const updatedStockIn = await this.stockInModel
      .findByIdAndUpdate(
        id,
        {
          paymentStatus: newPaymentStatus,
          paidAmount,
          remainingAmount,
          updatedAt: new Date(),
        },
        { new: true }
      )
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .exec();

    if (!updatedStockIn) {
      throw new NotFoundException('Phiếu nhập hàng không tồn tại');
    }

    return updatedStockIn;
  }

  // Cập nhật trạng thái phiếu nhập
  async updateStatus(id: string, updateStatusDto: UpdateStockInStatusDto, userId: string): Promise<StockIn> {
    const stockIn = await this.getStockInById(id, userId);

    const { status } = updateStatusDto;

    // Nếu duyệt phiếu nhập, cập nhật số lượng vật liệu
    if (status === 'approved' && stockIn.status !== 'approved') {
      await this.updateMaterialQuantities(stockIn.items);
    }

    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    // Nếu duyệt phiếu nhập, ghi lại người duyệt và thời gian duyệt
    if (status === 'approved') {
      updateData.approvedBy = new Types.ObjectId(userId);
      updateData.approvedAt = new Date();
    }

    const updatedStockIn = await this.stockInModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .exec();

    if (!updatedStockIn) {
      throw new NotFoundException('Phiếu nhập hàng không tồn tại');
    }

    return updatedStockIn;
  }

  // Xóa phiếu nhập hàng (soft delete)
  async deleteStockIn(id: string, userId: string): Promise<void> {
    const stockIn = await this.getStockInById(id, userId);

    // Nếu đã được duyệt thì không cho phép xóa
    if (stockIn.status === 'approved') {
      throw new BadRequestException('Không thể xóa phiếu nhập hàng đã được duyệt');
    }

    await this.stockInModel.findByIdAndUpdate(id, {
      isDeleted: true,
      updatedAt: new Date(),
    });
  }

  // Lấy danh sách vật liệu để chọn khi tạo phiếu nhập
  async getMaterialsForSelection(userId: string): Promise<Material[]> {
    return await this.materialModel
      .find({
        userId: new Types.ObjectId(userId),
        isActive: true,
      })
      .select('name category unit price supplier')
      .sort({ name: 1 })
      .exec();
  }

  // Cập nhật số lượng vật liệu sau khi duyệt phiếu nhập
  private async updateMaterialQuantities(items: any[]): Promise<void> {
    for (const item of items) {
      await this.materialModel.findByIdAndUpdate(
        item.materialId,
        {
          $inc: { quantity: item.quantity },
          $set: { price: item.unitPrice }, // Cập nhật giá mới nhất
        }
      );
    }
  }

  // Tạo số phiếu nhập hàng tự động
  private async generateStockInNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    const prefix = `PN${year}${month}${day}`;
    
    // Tìm số phiếu nhập hàng cuối cùng trong ngày
    const lastStockIn = await this.stockInModel
      .findOne({
        stockInNumber: { $regex: `^${prefix}` },
      })
      .sort({ stockInNumber: -1 })
      .exec();

    let sequence = 1;
    if (lastStockIn) {
      const lastSequence = parseInt(lastStockIn.stockInNumber.slice(-4));
      sequence = lastSequence + 1;
    }

    return `${prefix}${String(sequence).padStart(4, '0')}`;
  }

  // Lấy thống kê phiếu nhập hàng
  async getStockInStats(userId: string, startDate?: string, endDate?: string): Promise<any> {
    const filter: any = {
      userId: new Types.ObjectId(userId),
      isDeleted: false,
    };

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    const stats = await this.stockInModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalStockIns: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          paidAmount: { $sum: '$paidAmount' },
          remainingAmount: { $sum: '$remainingAmount' },
          unpaidCount: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'unpaid'] }, 1, 0] }
          },
          partialCount: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'partial'] }, 1, 0] }
          },
          paidCount: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] }
          },
        }
      }
    ]);

    return stats[0] || {
      totalStockIns: 0,
      totalAmount: 0,
      paidAmount: 0,
      remainingAmount: 0,
      unpaidCount: 0,
      partialCount: 0,
      paidCount: 0,
    };
  }
}
