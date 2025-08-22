import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Invoice } from '../models/invoice.model';
import { Material } from '../models/material.model';
import { CreateInvoiceDto, UpdateInvoiceDto, UpdateInvoiceStatusDto, UpdatePaymentStatusDto, InvoiceQueryDto, CreateInvoiceItemDto } from '../dto/invoice.dto';
import { PaymentMethod } from '../constants/payment.constants';

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<Invoice>,
    @InjectModel(Material.name) private materialModel: Model<Material>,
  ) {}

  // Tạo số hoá đơn tự động
  private async generateInvoiceNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    const prefix = `HD${year}${month}${day}`;
    
    // Tìm số hoá đơn cuối cùng trong ngày
    const lastInvoice = await this.invoiceModel
      .findOne({
        invoiceNumber: { $regex: `^${prefix}` },
        isDeleted: false
      })
      .sort({ invoiceNumber: -1 })
      .exec();

    if (!lastInvoice) {
      return `${prefix}001`;
    }

    const lastNumber = parseInt(lastInvoice.invoiceNumber.slice(-3));
    const newNumber = lastNumber + 1;
    return `${prefix}${String(newNumber).padStart(3, '0')}`;
  }

  // Tính toán giá trị hoá đơn
  private calculateInvoiceValues(items: any[], taxRate: number = 0, discountRate: number = 0) {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = (subtotal * taxRate) / 100;
    const discountAmount = (subtotal * discountRate) / 100;
    const totalAmount = subtotal + taxAmount - discountAmount;

    return {
      subtotal,
      taxAmount,
      discountAmount,
      totalAmount
    };
  }

  // Tạo hoá đơn mới
  async create(createInvoiceDto: CreateInvoiceDto, userId: string): Promise<Invoice> {
    this.logger.log(`Tạo hoá đơn mới cho khách hàng: ${createInvoiceDto.customerName}`);

    // Validation cho phương thức thanh toán
    if (createInvoiceDto.paymentMethod === PaymentMethod.DEBT) {
      this.logger.log('Hoá đơn được tạo với phương thức thanh toán: Nợ');
      // Có thể thêm validation đặc biệt cho hoá đơn nợ ở đây
      // Ví dụ: kiểm tra hạn mức nợ của khách hàng
      
      // Tự động set paymentStatus thành 'unpaid' cho hoá đơn nợ
      createInvoiceDto.paymentStatus = 'unpaid';
    } else if (createInvoiceDto.paymentMethod === PaymentMethod.CASH) {
      this.logger.log('Hoá đơn được tạo với phương thức thanh toán: Tiền mặt');
      // Có thể thêm validation đặc biệt cho hoá đơn tiền mặt
      
      // Nếu không có paymentStatus, mặc định là 'paid' cho tiền mặt
      if (!createInvoiceDto.paymentStatus) {
        createInvoiceDto.paymentStatus = 'paid';
      }
    } else if (createInvoiceDto.paymentMethod === PaymentMethod.ONLINE) {
      this.logger.log('Hoá đơn được tạo với phương thức thanh toán: Online');
      // Có thể thêm validation đặc biệt cho hoá đơn online
      
      // Nếu không có paymentStatus, mặc định là 'unpaid' cho online (chờ xác nhận)
      if (!createInvoiceDto.paymentStatus) {
        createInvoiceDto.paymentStatus = 'unpaid';
      }
    }

    // Kiểm tra và cập nhật thông tin vật liệu
    const updatedItems = await Promise.all(
      createInvoiceDto.items.map(async (item: CreateInvoiceItemDto) => {
        const material = await this.materialModel.findById(item.materialId);
        if (!material) {
          throw new NotFoundException(`Vật liệu với ID ${item.materialId} không tồn tại`);
        }

        // Tự động lấy thông tin vật liệu từ database
        return {
          materialId: item.materialId,
          materialName: material.name,
          quantity: item.quantity,
          unitPrice: material.price || 0, // Lấy giá từ database
          unit: material.unit || 'cái', // Lấy đơn vị từ database
          totalPrice: item.quantity * (material.price || 0)
        };
      })
    );

    // Tính toán giá trị hoá đơn
    const values = this.calculateInvoiceValues(
      updatedItems,
      createInvoiceDto.taxRate || 0,
      createInvoiceDto.discountRate || 0
    );

    // Tạo số hoá đơn
    const invoiceNumber = await this.generateInvoiceNumber();

    const invoice = new this.invoiceModel({
      ...createInvoiceDto,
      invoiceNumber,
      items: updatedItems,
      ...values,
      createdBy: new Types.ObjectId(userId),
      customerId: new Types.ObjectId(userId), // Tạm thời gán cho user hiện tại
    });

    const savedInvoice = await invoice.save();
    this.logger.log(`Hoá đơn ${invoiceNumber} đã được tạo thành công`);
    
    return savedInvoice;
  }

  // Lấy danh sách hoá đơn với phân trang và filter
  async findAll(query: InvoiceQueryDto): Promise<{ invoices: Invoice[]; total: number; page: number; limit: number }> {
    this.logger.log('Lấy danh sách hoá đơn');

    const {
      status,
      paymentStatus,
      paymentMethod,
      customerName,
      invoiceNumber,
      startDate,
      endDate,
      page = 1,
      limit = 10
    } = query;

    const filter: any = { isDeleted: false };

    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (customerName) filter.customerName = { $regex: customerName, $options: 'i' };
    if (invoiceNumber) filter.invoiceNumber = { $regex: invoiceNumber, $options: 'i' };
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [invoices, total] = await Promise.all([
      this.invoiceModel
        .find(filter)
        .populate('customerId', 'name email')
        .populate('createdBy', 'name email')
        .populate('approvedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.invoiceModel.countDocuments(filter)
    ]);

    return {
      invoices,
      total,
      page,
      limit
    };
  }

  // Lấy hoá đơn theo ID
  async findOne(id: string): Promise<Invoice> {
    this.logger.log(`Lấy hoá đơn với ID: ${id}`);

    const invoice = await this.invoiceModel
      .findOne({ _id: id, isDeleted: false })
      .populate('customerId', 'name email')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .exec();

    if (!invoice) {
      throw new NotFoundException(`Hoá đơn với ID ${id} không tồn tại`);
    }

    return invoice;
  }

  // Lấy hoá đơn theo số hoá đơn
  async findByInvoiceNumber(invoiceNumber: string): Promise<Invoice> {
    this.logger.log(`Lấy hoá đơn với số: ${invoiceNumber}`);

    const invoice = await this.invoiceModel
      .findOne({ invoiceNumber, isDeleted: false })
      .populate('customerId', 'name email')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .exec();

    if (!invoice) {
      throw new NotFoundException(`Hoá đơn với số ${invoiceNumber} không tồn tại`);
    }

    return invoice;
  }

  // Cập nhật hoá đơn
  async update(id: string, updateInvoiceDto: UpdateInvoiceDto): Promise<Invoice> {
    this.logger.log(`Cập nhật hoá đơn với ID: ${id}`);

    const invoice = await this.findOne(id);

    // Nếu cập nhật items, tính toán lại giá trị
    if (updateInvoiceDto.items) {
      const updatedItems = await Promise.all(
        updateInvoiceDto.items.map(async (item) => {
          const material = await this.materialModel.findById(item.materialId);
          if (!material) {
            throw new NotFoundException(`Vật liệu với ID ${item.materialId} không tồn tại`);
          }

          // Tự động lấy thông tin vật liệu từ database
          return {
            materialId: item.materialId,
            materialName: material.name,
            quantity: item.quantity,
            unitPrice: material.price || 0, // Lấy giá từ database
            unit: material.unit || 'cái', // Lấy đơn vị từ database
            totalPrice: item.quantity * (material.price || 0)
          };
        })
      );

      const values = this.calculateInvoiceValues(
        updatedItems,
        updateInvoiceDto.taxRate || invoice.taxRate,
        updateInvoiceDto.discountRate || invoice.discountRate
      );

      updateInvoiceDto = {
        ...updateInvoiceDto,
        items: updatedItems,
        ...values
      };
    }

    const updatedInvoice = await this.invoiceModel
      .findByIdAndUpdate(id, updateInvoiceDto, { new: true })
      .populate('customerId', 'name email')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .exec();

    if (!updatedInvoice) {
      throw new NotFoundException(`Không thể cập nhật hoá đơn với ID ${id}`);
    }

    this.logger.log(`Hoá đơn ${id} đã được cập nhật thành công`);
    return updatedInvoice;
  }

  // Cập nhật trạng thái hoá đơn
  async updateStatus(id: string, updateStatusDto: UpdateInvoiceStatusDto, userId: string): Promise<Invoice> {
    this.logger.log(`Cập nhật trạng thái hoá đơn ${id} thành: ${updateStatusDto.status}`);

    const invoice = await this.findOne(id);

    // Kiểm tra quyền cập nhật trạng thái
    if (invoice.status === 'delivered' || invoice.status === 'cancelled') {
      throw new BadRequestException('Không thể cập nhật trạng thái hoá đơn đã hoàn thành hoặc bị hủy');
    }

    const updateData: any = {
      status: updateStatusDto.status,
      notes: updateStatusDto.notes
    };

    // Nếu xác nhận hoá đơn, ghi nhận người duyệt
    if (updateStatusDto.status === 'confirmed') {
      updateData.approvedBy = new Types.ObjectId(userId);
      updateData.approvedAt = new Date();
    }

    const updatedInvoice = await this.invoiceModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('customerId', 'name email')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .exec();

    if (!updatedInvoice) {
      throw new NotFoundException(`Không thể cập nhật trạng thái hoá đơn với ID ${id}`);
    }

    this.logger.log(`Trạng thái hoá đơn ${id} đã được cập nhật thành: ${updateStatusDto.status}`);
    return updatedInvoice;
  }

  // Cập nhật trạng thái thanh toán
  async updatePaymentStatus(id: string, updatePaymentDto: UpdatePaymentStatusDto): Promise<Invoice> {
    this.logger.log(`Cập nhật trạng thái thanh toán hoá đơn ${id} thành: ${updatePaymentDto.paymentStatus}`);

    const invoice = await this.findOne(id);

    const updateData: any = {
      paymentStatus: updatePaymentDto.paymentStatus,
      notes: updatePaymentDto.notes
    };

    const updatedInvoice = await this.invoiceModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('customerId', 'name email')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .exec();

    if (!updatedInvoice) {
      throw new NotFoundException(`Không thể cập nhật trạng thái thanh toán hoá đơn với ID ${id}`);
    }

    this.logger.log(`Trạng thái thanh toán hoá đơn ${id} đã được cập nhật thành: ${updatePaymentDto.paymentStatus}`);
    return updatedInvoice;
  }

  // Xóa mềm hoá đơn
  async remove(id: string): Promise<void> {
    this.logger.log(`Xóa hoá đơn với ID: ${id}`);

    const invoice = await this.findOne(id);

    // Kiểm tra quyền xóa
    if (invoice.status === 'delivered' || invoice.paymentStatus === 'paid') {
      throw new BadRequestException('Không thể xóa hoá đơn đã hoàn thành hoặc đã thanh toán');
    }

    await this.invoiceModel.findByIdAndUpdate(id, { isDeleted: true });
    this.logger.log(`Hoá đơn ${id} đã được xóa thành công`);
  }

  // Thống kê hoá đơn
  async getStatistics(startDate?: string, endDate?: string) {
    this.logger.log('Lấy thống kê hoá đơn');

    const filter: any = { isDeleted: false };
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const [
      totalInvoices,
      totalRevenue,
      pendingInvoices,
      confirmedInvoices,
      deliveredInvoices,
      cancelledInvoices,
      unpaidInvoices,
      paidInvoices,
      paymentMethodStats
    ] = await Promise.all([
      this.invoiceModel.countDocuments(filter),
      this.invoiceModel.aggregate([
        { $match: filter },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      this.invoiceModel.countDocuments({ ...filter, status: 'pending' }),
      this.invoiceModel.countDocuments({ ...filter, status: 'confirmed' }),
      this.invoiceModel.countDocuments({ ...filter, status: 'delivered' }),
      this.invoiceModel.countDocuments({ ...filter, status: 'cancelled' }),
      this.invoiceModel.countDocuments({ ...filter, paymentStatus: 'unpaid' }),
      this.invoiceModel.countDocuments({ ...filter, paymentStatus: 'paid' }),
      this.invoiceModel.aggregate([
        { $match: filter },
        { $group: { _id: '$paymentMethod', count: { $sum: 1 }, totalAmount: { $sum: '$totalAmount' } } }
      ])
    ]);

    // Xử lý thống kê theo phương thức thanh toán
    const paymentMethods = {};
    paymentMethodStats.forEach(stat => {
      paymentMethods[stat._id] = {
        count: stat.count,
        totalAmount: stat.totalAmount
      };
    });

    return {
      totalInvoices,
      totalRevenue: totalRevenue[0]?.total || 0,
      pendingInvoices,
      confirmedInvoices,
      deliveredInvoices,
      cancelledInvoices,
      unpaidInvoices,
      paidInvoices,
      paymentMethods
    };
  }
}
