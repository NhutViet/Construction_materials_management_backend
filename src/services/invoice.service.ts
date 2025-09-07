import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Invoice } from '../models/invoice.model';
import { Material } from '../models/material.model';
import { CreateInvoiceDto, UpdateInvoiceDto, UpdateInvoiceStatusDto, UpdatePaymentStatusDto, InvoiceQueryDto, CreateInvoiceItemDto, PaymentDto } from '../dto/invoice.dto';
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

  // Kiểm tra tồn kho trước khi thực hiện thao tác
  private async checkInventoryAvailability(items: any[], userId: string): Promise<void> {
    this.logger.log(`🔍 Kiểm tra tồn kho cho ${items.length} vật liệu`);
    
    for (const item of items) {
      const material = await this.materialModel.findById(item.materialId);
      if (!material) {
        throw new NotFoundException(`Vật liệu với ID ${item.materialId} không tồn tại`);
      }

      // Kiểm tra quyền sở hữu vật liệu
      if (material.userId.toString() !== userId) {
        throw new ForbiddenException(`Bạn không có quyền sử dụng vật liệu ${material.name}`);
      }

      // Kiểm tra tồn kho
      if (material.quantity < item.quantity) {
        throw new BadRequestException(
          `Không đủ tồn kho cho vật liệu "${material.name}". Tồn kho hiện tại: ${material.quantity}, yêu cầu: ${item.quantity}`
        );
      }

      this.logger.log(`✅ Vật liệu ${material.name}: Tồn kho ${material.quantity} >= Yêu cầu ${item.quantity}`);
    }
  }

  // Cập nhật tồn kho vật liệu
  private async updateMaterialInventory(items: any[], operation: 'increase' | 'decrease'): Promise<void> {
    this.logger.log(`🔄 Cập nhật tồn kho vật liệu - Thao tác: ${operation}`);
    
    for (const item of items) {
      const material = await this.materialModel.findById(item.materialId);
      if (!material) {
        this.logger.warn(`⚠️ Không tìm thấy vật liệu với ID: ${item.materialId}`);
        continue;
      }

      const quantityChange = operation === 'increase' ? item.quantity : -item.quantity;
      const newQuantity = material.quantity + quantityChange;

      // Đảm bảo số lượng không âm
      if (newQuantity < 0) {
        this.logger.warn(`⚠️ Số lượng tồn kho không thể âm cho vật liệu ${material.name}. Bỏ qua cập nhật.`);
        continue;
      }

      await this.materialModel.findByIdAndUpdate(
        item.materialId,
        { quantity: newQuantity },
        { new: true }
      );

      this.logger.log(
        `📦 Cập nhật tồn kho ${material.name}: ${material.quantity} → ${newQuantity} (${operation} ${item.quantity})`
      );
    }
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

    // Kiểm tra tồn kho trước khi tạo hoá đơn
    await this.checkInventoryAvailability(createInvoiceDto.items, userId);

    // Cập nhật thông tin vật liệu
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

    // Xử lý paidAmount dựa trên paymentStatus
    let paidAmount = 0;
    if (createInvoiceDto.paymentStatus === 'paid') {
      paidAmount = values.totalAmount;
    } else if (createInvoiceDto.paymentStatus === 'partial' && createInvoiceDto.paidAmount) {
      paidAmount = createInvoiceDto.paidAmount;
    }

    // Tính remainingAmount
    const remainingAmount = values.totalAmount - paidAmount;

    // Debug logging cho việc tạo hoá đơn
    this.logger.log(`🔍 Debug tạo hoá đơn:`);
    this.logger.log(`  - totalAmount: ${values.totalAmount}`);
    this.logger.log(`  - paidAmount: ${paidAmount}`);
    this.logger.log(`  - remainingAmount: ${remainingAmount}`);
    this.logger.log(`  - paymentStatus: ${createInvoiceDto.paymentStatus}`);

    const invoice = new this.invoiceModel({
      ...createInvoiceDto,
      invoiceNumber,
      items: updatedItems,
      ...values,
      paidAmount,
      remainingAmount,
      createdBy: new Types.ObjectId(userId),
      customerId: new Types.ObjectId(userId), // Tạm thời gán cho user hiện tại
    });

    const savedInvoice = await invoice.save();
    
    // Cập nhật số lượng tồn kho sau khi tạo hoá đơn thành công
    await this.updateMaterialInventory(updatedItems, 'decrease');
    
    this.logger.log(`Hoá đơn ${invoiceNumber} đã được tạo thành công`);
    
    return savedInvoice;
  }

  // Lấy danh sách hoá đơn với phân trang và filter
  async findAll(query: InvoiceQueryDto, userId: string): Promise<{ invoices: Invoice[]; total: number; page: number; limit: number }> {
    this.logger.log(`Lấy danh sách hoá đơn cho user: ${userId}`);

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

    const filter: any = { 
      isDeleted: false,
      createdBy: new Types.ObjectId(userId) // Chỉ lấy hoá đơn của user hiện tại
    };

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
  async findOne(id: string, userId: string): Promise<Invoice> {
    this.logger.log(`Lấy hoá đơn với ID: ${id} cho user: ${userId}`);

    const invoice = await this.invoiceModel
      .findOne({ _id: id, isDeleted: false, createdBy: new Types.ObjectId(userId) })
      .populate('customerId', 'name email')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .exec();

    if (!invoice) {
      throw new NotFoundException(`Hoá đơn với ID ${id} không tồn tại hoặc bạn không có quyền truy cập`);
    }

    return invoice;
  }

  // Lấy hoá đơn theo số hoá đơn
  async findByInvoiceNumber(invoiceNumber: string, userId: string): Promise<Invoice> {
    this.logger.log(`Lấy hoá đơn với số: ${invoiceNumber} cho user: ${userId}`);

    const invoice = await this.invoiceModel
      .findOne({ 
        invoiceNumber, 
        isDeleted: false, 
        createdBy: new Types.ObjectId(userId) 
      })
      .populate('customerId', 'name email')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .exec();

    if (!invoice) {
      throw new NotFoundException(`Hoá đơn với số ${invoiceNumber} không tồn tại hoặc bạn không có quyền truy cập`);
    }

    return invoice;
  }

  // Cập nhật hoá đơn
  async update(id: string, updateInvoiceDto: UpdateInvoiceDto, userId: string): Promise<Invoice> {
    this.logger.log(`Cập nhật hoá đơn với ID: ${id} cho user: ${userId}`);

    // Kiểm tra quyền sở hữu
    const invoice = await this.invoiceModel
      .findOne({ _id: id, isDeleted: false, createdBy: new Types.ObjectId(userId) })
      .exec();

    if (!invoice) {
      throw new ForbiddenException('Bạn không có quyền cập nhật hoá đơn này');
    }

    // Nếu cập nhật items, tính toán lại giá trị
    let updatedItems: any[] = [];
    if (updateInvoiceDto.items) {
      // Khôi phục tồn kho từ items cũ trước khi kiểm tra items mới
      await this.updateMaterialInventory(invoice.items, 'increase');
      
      // Kiểm tra tồn kho cho items mới
      await this.checkInventoryAvailability(updateInvoiceDto.items, userId);
      
      updatedItems = await Promise.all(
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

      // Tính lại remainingAmount nếu có thay đổi về totalAmount
      const newRemainingAmount = values.totalAmount - (updateInvoiceDto.paidAmount || invoice.paidAmount);
      
      updateInvoiceDto = {
        ...updateInvoiceDto,
        items: updatedItems,
        ...values,
        remainingAmount: newRemainingAmount
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

    // Cập nhật tồn kho với items mới nếu có thay đổi
    if (updateInvoiceDto.items && updatedItems.length > 0) {
      await this.updateMaterialInventory(updatedItems, 'decrease');
    }

    this.logger.log(`Hoá đơn ${id} đã được cập nhật thành công cho user: ${userId}`);
    return updatedInvoice;
  }

  // Cập nhật trạng thái hoá đơn
  async updateStatus(id: string, updateStatusDto: UpdateInvoiceStatusDto, userId: string): Promise<Invoice> {
    this.logger.log(`Cập nhật trạng thái hoá đơn ${id} thành: ${updateStatusDto.status} cho user: ${userId}`);

    // Kiểm tra quyền sở hữu
    const invoice = await this.invoiceModel
      .findOne({ _id: id, isDeleted: false, createdBy: new Types.ObjectId(userId) })
      .exec();

    if (!invoice) {
      throw new ForbiddenException('Bạn không có quyền cập nhật hoá đơn này');
    }

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

    // Nếu hủy hoá đơn, trả hàng về kho
    if (updateStatusDto.status === 'cancelled') {
      this.logger.log(`🔄 Hủy hoá đơn ${id} - Trả hàng về kho`);
      await this.updateMaterialInventory(invoice.items, 'increase');
      this.logger.log(`✅ Đã trả ${invoice.items.length} loại vật liệu về kho khi hủy hoá đơn ${id}`);
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

    this.logger.log(`Trạng thái hoá đơn ${id} đã được cập nhật thành: ${updateStatusDto.status} cho user: ${userId}`);
    return updatedInvoice;
  }

  // Thanh toán cho hoá đơn
  async makePayment(id: string, paymentDto: PaymentDto, userId: string): Promise<Invoice> {
    this.logger.log(`💳 Thanh toán ${paymentDto.amount} cho hoá đơn ${id} bởi user: ${userId}`);

    // Kiểm tra quyền sở hữu
    const invoice = await this.invoiceModel
      .findOne({ _id: id, isDeleted: false, createdBy: new Types.ObjectId(userId) })
      .exec();

    if (!invoice) {
      throw new ForbiddenException('Bạn không có quyền thanh toán hoá đơn này');
    }

    // Validation
    if (paymentDto.amount <= 0) {
      throw new BadRequestException('Số tiền thanh toán phải lớn hơn 0');
    }

    // Debug logging
    this.logger.log(`🔍 Debug thanh toán - Hoá đơn ${id}:`);
    this.logger.log(`  - totalAmount: ${invoice.totalAmount}`);
    this.logger.log(`  - paidAmount: ${invoice.paidAmount}`);
    this.logger.log(`  - remainingAmount: ${invoice.remainingAmount}`);
    this.logger.log(`  - paymentDto.amount: ${paymentDto.amount}`);

    // Kiểm tra remainingAmount có hợp lệ không
    if (invoice.remainingAmount <= 0) {
      throw new BadRequestException('Hoá đơn đã được thanh toán đầy đủ, không thể thanh toán thêm');
    }

    if (paymentDto.amount > invoice.remainingAmount) {
      throw new BadRequestException(`Số tiền thanh toán (${paymentDto.amount}) không thể vượt quá số tiền còn lại (${invoice.remainingAmount})`);
    }

    // Tính toán số tiền mới
    const newPaidAmount = invoice.paidAmount + paymentDto.amount;
    const newRemainingAmount = invoice.totalAmount - newPaidAmount;

    // Xác định trạng thái thanh toán mới
    let newPaymentStatus: 'unpaid' | 'partial' | 'paid';
    if (newRemainingAmount === 0) {
      newPaymentStatus = 'paid';
    } else if (newPaidAmount > 0) {
      newPaymentStatus = 'partial';
    } else {
      newPaymentStatus = 'unpaid';
    }

    // Cập nhật hoá đơn
    const updateData: any = {
      paidAmount: newPaidAmount,
      remainingAmount: newRemainingAmount,
      paymentStatus: newPaymentStatus,
      notes: paymentDto.notes || invoice.notes
    };

    // Cập nhật phương thức thanh toán nếu được chỉ định
    if (paymentDto.paymentMethod) {
      updateData.paymentMethod = paymentDto.paymentMethod;
    }

    const updatedInvoice = await this.invoiceModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('customerId', 'name email')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .exec();

    if (!updatedInvoice) {
      throw new NotFoundException(`Không thể cập nhật thanh toán cho hoá đơn với ID ${id}`);
    }

    this.logger.log(`✅ Thanh toán thành công: ${paymentDto.amount} cho hoá đơn ${id}. Số tiền còn lại: ${newRemainingAmount}`);
    return updatedInvoice;
  }

  // Cập nhật trạng thái thanh toán
  async updatePaymentStatus(id: string, updatePaymentDto: UpdatePaymentStatusDto, userId: string): Promise<Invoice> {
    this.logger.log(`Cập nhật trạng thái thanh toán hoá đơn ${id} thành: ${updatePaymentDto.paymentStatus} cho user: ${userId}`);

    // Kiểm tra quyền sở hữu
    const invoice = await this.invoiceModel
      .findOne({ _id: id, isDeleted: false, createdBy: new Types.ObjectId(userId) })
      .exec();

    if (!invoice) {
      throw new ForbiddenException('Bạn không có quyền cập nhật hoá đơn này');
    }

    // Validation cho paidAmount
    if (updatePaymentDto.paidAmount !== undefined) {
      if (updatePaymentDto.paidAmount < 0) {
        throw new BadRequestException('Số tiền đã trả không thể âm');
      }
      if (updatePaymentDto.paidAmount > invoice.totalAmount) {
        throw new BadRequestException('Số tiền đã trả không thể vượt quá tổng tiền hoá đơn');
      }
    }

    // Validation cho remainingAmount
    if (updatePaymentDto.remainingAmount !== undefined) {
      if (updatePaymentDto.remainingAmount < 0) {
        throw new BadRequestException('Số tiền còn lại không thể âm');
      }
      if (updatePaymentDto.remainingAmount > invoice.totalAmount) {
        throw new BadRequestException('Số tiền còn lại không thể vượt quá tổng tiền hoá đơn');
      }
    }

    const updateData: any = {
      paymentStatus: updatePaymentDto.paymentStatus,
      notes: updatePaymentDto.notes
    };

    // Cập nhật paidAmount nếu có
    if (updatePaymentDto.paidAmount !== undefined) {
      updateData.paidAmount = updatePaymentDto.paidAmount;
      // Tự động tính remainingAmount
      updateData.remainingAmount = invoice.totalAmount - updatePaymentDto.paidAmount;
    }

    // Tự động cập nhật paymentStatus dựa trên paidAmount nếu không được chỉ định
    if (updatePaymentDto.paymentStatus === undefined && updatePaymentDto.paidAmount !== undefined) {
      if (updatePaymentDto.paidAmount === 0) {
        updateData.paymentStatus = 'unpaid';
      } else if (updatePaymentDto.paidAmount >= invoice.totalAmount) {
        updateData.paymentStatus = 'paid';
      } else {
        updateData.paymentStatus = 'partial';
      }
    }

    // Nếu chỉ cập nhật remainingAmount mà không có paidAmount, tính ngược lại
    if (updatePaymentDto.remainingAmount !== undefined && updatePaymentDto.paidAmount === undefined) {
      updateData.paidAmount = invoice.totalAmount - updatePaymentDto.remainingAmount;
      updateData.remainingAmount = updatePaymentDto.remainingAmount;
      
      // Tự động cập nhật paymentStatus dựa trên paidAmount mới
      if (updateData.paidAmount === 0) {
        updateData.paymentStatus = 'unpaid';
      } else if (updateData.paidAmount >= invoice.totalAmount) {
        updateData.paymentStatus = 'paid';
      } else {
        updateData.paymentStatus = 'partial';
      }
    }

    const updatedInvoice = await this.invoiceModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('customerId', 'name email')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .exec();

    if (!updatedInvoice) {
      throw new NotFoundException(`Không thể cập nhật trạng thái thanh toán hoá đơn với ID ${id}`);
    }

    this.logger.log(`Trạng thái thanh toán hoá đơn ${id} đã được cập nhật thành: ${updatePaymentDto.paymentStatus} cho user: ${userId}`);
    return updatedInvoice;
  }

  // Xóa mềm hoá đơn
  async remove(id: string, userId: string): Promise<void> {
    this.logger.log(`Xóa hoá đơn với ID: ${id} cho user: ${userId}`);

    // Kiểm tra quyền sở hữu
    const invoice = await this.invoiceModel
      .findOne({ _id: id, isDeleted: false, createdBy: new Types.ObjectId(userId) })
      .exec();

    if (!invoice) {
      throw new ForbiddenException('Bạn không có quyền xóa hoá đơn này');
    }

    // Kiểm tra quyền xóa
    if (invoice.status === 'delivered' || invoice.paymentStatus === 'paid') {
      throw new BadRequestException('Không thể xóa hoá đơn đã hoàn thành hoặc đã thanh toán');
    }

    // Khôi phục tồn kho khi xóa hoá đơn
    await this.updateMaterialInventory(invoice.items, 'increase');

    await this.invoiceModel.findByIdAndUpdate(id, { isDeleted: true });
    this.logger.log(`Hoá đơn ${id} đã được xóa thành công cho user: ${userId}`);
  }

  // Thống kê hoá đơn
  async getStatistics(userId: string, startDate?: string, endDate?: string) {
    this.logger.log(`Lấy thống kê hoá đơn cho user: ${userId}`);

    const filter: any = { 
      isDeleted: false,
      createdBy: new Types.ObjectId(userId) // Chỉ lấy thống kê của user hiện tại
    };
    
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
