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
var InvoiceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const invoice_model_1 = require("../models/invoice.model");
const material_model_1 = require("../models/material.model");
const payment_constants_1 = require("../constants/payment.constants");
let InvoiceService = InvoiceService_1 = class InvoiceService {
    invoiceModel;
    materialModel;
    logger = new common_1.Logger(InvoiceService_1.name);
    constructor(invoiceModel, materialModel) {
        this.invoiceModel = invoiceModel;
        this.materialModel = materialModel;
    }
    async generateInvoiceNumber() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const prefix = `HD${year}${month}${day}`;
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
    calculateInvoiceValues(items, taxRate = 0, discountRate = 0) {
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
    async checkInventoryAvailability(items, userId) {
        this.logger.log(`🔍 Kiểm tra tồn kho cho ${items.length} vật liệu`);
        for (const item of items) {
            const material = await this.materialModel.findById(item.materialId);
            if (!material) {
                throw new common_1.NotFoundException(`Vật liệu với ID ${item.materialId} không tồn tại`);
            }
            if (material.userId.toString() !== userId) {
                throw new common_1.ForbiddenException(`Bạn không có quyền sử dụng vật liệu ${material.name}`);
            }
            if (material.quantity < item.quantity) {
                throw new common_1.BadRequestException(`Không đủ tồn kho cho vật liệu "${material.name}". Tồn kho hiện tại: ${material.quantity}, yêu cầu: ${item.quantity}`);
            }
            this.logger.log(`✅ Vật liệu ${material.name}: Tồn kho ${material.quantity} >= Yêu cầu ${item.quantity}`);
        }
    }
    async updateMaterialInventory(items, operation) {
        this.logger.log(`🔄 Cập nhật tồn kho vật liệu - Thao tác: ${operation}`);
        for (const item of items) {
            const material = await this.materialModel.findById(item.materialId);
            if (!material) {
                this.logger.warn(`⚠️ Không tìm thấy vật liệu với ID: ${item.materialId}`);
                continue;
            }
            const quantityChange = operation === 'increase' ? item.quantity : -item.quantity;
            const newQuantity = material.quantity + quantityChange;
            if (newQuantity < 0) {
                this.logger.warn(`⚠️ Số lượng tồn kho không thể âm cho vật liệu ${material.name}. Bỏ qua cập nhật.`);
                continue;
            }
            await this.materialModel.findByIdAndUpdate(item.materialId, { quantity: newQuantity }, { new: true });
            this.logger.log(`📦 Cập nhật tồn kho ${material.name}: ${material.quantity} → ${newQuantity} (${operation} ${item.quantity})`);
        }
    }
    async create(createInvoiceDto, userId) {
        this.logger.log(`Tạo hoá đơn mới cho khách hàng: ${createInvoiceDto.customerName}`);
        if (createInvoiceDto.paymentMethod === payment_constants_1.PaymentMethod.DEBT) {
            this.logger.log('Hoá đơn được tạo với phương thức thanh toán: Nợ');
            createInvoiceDto.paymentStatus = 'unpaid';
        }
        else if (createInvoiceDto.paymentMethod === payment_constants_1.PaymentMethod.CASH) {
            this.logger.log('Hoá đơn được tạo với phương thức thanh toán: Tiền mặt');
            if (!createInvoiceDto.paymentStatus) {
                createInvoiceDto.paymentStatus = 'paid';
            }
        }
        else if (createInvoiceDto.paymentMethod === payment_constants_1.PaymentMethod.ONLINE) {
            this.logger.log('Hoá đơn được tạo với phương thức thanh toán: Online');
            if (!createInvoiceDto.paymentStatus) {
                createInvoiceDto.paymentStatus = 'unpaid';
            }
        }
        await this.checkInventoryAvailability(createInvoiceDto.items, userId);
        const updatedItems = await Promise.all(createInvoiceDto.items.map(async (item) => {
            const material = await this.materialModel.findById(item.materialId);
            if (!material) {
                throw new common_1.NotFoundException(`Vật liệu với ID ${item.materialId} không tồn tại`);
            }
            return {
                materialId: item.materialId,
                materialName: material.name,
                quantity: item.quantity,
                unitPrice: material.price || 0,
                unit: material.unit || 'cái',
                totalPrice: item.quantity * (material.price || 0),
                deliveredQuantity: 0,
                deliveryStatus: 'pending'
            };
        }));
        const values = this.calculateInvoiceValues(updatedItems, createInvoiceDto.taxRate || 0, createInvoiceDto.discountRate || 0);
        const invoiceNumber = await this.generateInvoiceNumber();
        let paidAmount = 0;
        if (createInvoiceDto.paymentStatus === 'paid') {
            paidAmount = values.totalAmount;
        }
        else if (createInvoiceDto.paymentStatus === 'partial' && createInvoiceDto.paidAmount) {
            paidAmount = createInvoiceDto.paidAmount;
        }
        const remainingAmount = values.totalAmount - paidAmount;
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
            createdBy: new mongoose_2.Types.ObjectId(userId),
            customerId: new mongoose_2.Types.ObjectId(userId),
        });
        const savedInvoice = await invoice.save();
        this.logger.log(`Hoá đơn ${invoiceNumber} đã được tạo thành công`);
        return savedInvoice;
    }
    async findAll(query, userId) {
        this.logger.log(`Lấy danh sách hoá đơn cho user: ${userId}`);
        const { status, paymentStatus, paymentMethod, customerName, invoiceNumber, startDate, endDate, page = 1, limit = 10 } = query;
        const filter = {
            isDeleted: false,
            createdBy: new mongoose_2.Types.ObjectId(userId)
        };
        if (status)
            filter.status = status;
        if (paymentStatus)
            filter.paymentStatus = paymentStatus;
        if (paymentMethod)
            filter.paymentMethod = paymentMethod;
        if (customerName)
            filter.customerName = { $regex: customerName, $options: 'i' };
        if (invoiceNumber)
            filter.invoiceNumber = { $regex: invoiceNumber, $options: 'i' };
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate)
                filter.createdAt.$gte = new Date(startDate);
            if (endDate)
                filter.createdAt.$lte = new Date(endDate);
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
    async findOne(id, userId) {
        this.logger.log(`Lấy hoá đơn với ID: ${id} cho user: ${userId}`);
        const invoice = await this.invoiceModel
            .findOne({ _id: id, isDeleted: false, createdBy: new mongoose_2.Types.ObjectId(userId) })
            .populate('customerId', 'name email')
            .populate('createdBy', 'name email')
            .populate('approvedBy', 'name email')
            .exec();
        if (!invoice) {
            throw new common_1.NotFoundException(`Hoá đơn với ID ${id} không tồn tại hoặc bạn không có quyền truy cập`);
        }
        return invoice;
    }
    async findByInvoiceNumber(invoiceNumber, userId) {
        this.logger.log(`Lấy hoá đơn với số: ${invoiceNumber} cho user: ${userId}`);
        const invoice = await this.invoiceModel
            .findOne({
            invoiceNumber,
            isDeleted: false,
            createdBy: new mongoose_2.Types.ObjectId(userId)
        })
            .populate('customerId', 'name email')
            .populate('createdBy', 'name email')
            .populate('approvedBy', 'name email')
            .exec();
        if (!invoice) {
            throw new common_1.NotFoundException(`Hoá đơn với số ${invoiceNumber} không tồn tại hoặc bạn không có quyền truy cập`);
        }
        return invoice;
    }
    async update(id, updateInvoiceDto, userId) {
        this.logger.log(`Cập nhật hoá đơn với ID: ${id} cho user: ${userId}`);
        const invoice = await this.invoiceModel
            .findOne({ _id: id, isDeleted: false, createdBy: new mongoose_2.Types.ObjectId(userId) })
            .exec();
        if (!invoice) {
            throw new common_1.ForbiddenException('Bạn không có quyền cập nhật hoá đơn này');
        }
        let updatedItems = [];
        if (updateInvoiceDto.items) {
            await this.checkInventoryAvailability(updateInvoiceDto.items, userId);
            updatedItems = await Promise.all(updateInvoiceDto.items.map(async (item) => {
                const material = await this.materialModel.findById(item.materialId);
                if (!material) {
                    throw new common_1.NotFoundException(`Vật liệu với ID ${item.materialId} không tồn tại`);
                }
                return {
                    materialId: item.materialId,
                    materialName: material.name,
                    quantity: item.quantity,
                    unitPrice: material.price || 0,
                    unit: material.unit || 'cái',
                    totalPrice: item.quantity * (material.price || 0),
                    deliveredQuantity: 0,
                    deliveryStatus: 'pending'
                };
            }));
            const values = this.calculateInvoiceValues(updatedItems, updateInvoiceDto.taxRate || invoice.taxRate, updateInvoiceDto.discountRate || invoice.discountRate);
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
            throw new common_1.NotFoundException(`Không thể cập nhật hoá đơn với ID ${id}`);
        }
        this.logger.log(`Hoá đơn ${id} đã được cập nhật thành công cho user: ${userId}`);
        return updatedInvoice;
    }
    async updateStatus(id, updateStatusDto, userId) {
        this.logger.log(`Cập nhật trạng thái hoá đơn ${id} thành: ${updateStatusDto.status} cho user: ${userId}`);
        const invoice = await this.invoiceModel
            .findOne({ _id: id, isDeleted: false, createdBy: new mongoose_2.Types.ObjectId(userId) })
            .exec();
        if (!invoice) {
            throw new common_1.ForbiddenException('Bạn không có quyền cập nhật hoá đơn này');
        }
        if (invoice.status === 'delivered' || invoice.status === 'cancelled') {
            throw new common_1.BadRequestException('Không thể cập nhật trạng thái hoá đơn đã hoàn thành hoặc bị hủy');
        }
        const updateData = {
            status: updateStatusDto.status,
            notes: updateStatusDto.notes
        };
        if (updateStatusDto.status === 'confirmed') {
            updateData.approvedBy = new mongoose_2.Types.ObjectId(userId);
            updateData.approvedAt = new Date();
        }
        if (updateStatusDto.status === 'delivered') {
            this.logger.log(`🚚 Tự động cập nhật deliveredQuantity cho tất cả items khi chuyển sang trạng thái delivered`);
            await this.checkInventoryAvailability(invoice.items, userId);
            this.logger.log(`✅ Đã kiểm tra tồn kho - đủ hàng để giao toàn bộ hoá đơn`);
            const updatedItems = invoice.items.map(item => ({
                ...item,
                deliveredQuantity: item.quantity,
                deliveryStatus: 'delivered',
                deliveredAt: new Date(),
                deliveredBy: new mongoose_2.Types.ObjectId(userId)
            }));
            updateData.items = updatedItems;
            updateData.deliveryDate = new Date();
            await this.updateMaterialInventory(invoice.items.map(item => ({ materialId: item.materialId, quantity: item.quantity })), 'decrease');
            this.logger.log(`📦 Đã trừ tồn kho cho ${invoice.items.length} vật liệu khi chuyển sang trạng thái delivered`);
        }
        if (updateStatusDto.status === 'cancelled') {
            this.logger.log(`🔄 Hủy hoá đơn ${id}`);
        }
        const updatedInvoice = await this.invoiceModel
            .findByIdAndUpdate(id, updateData, { new: true })
            .populate('customerId', 'name email')
            .populate('createdBy', 'name email')
            .populate('approvedBy', 'name email')
            .exec();
        if (!updatedInvoice) {
            throw new common_1.NotFoundException(`Không thể cập nhật trạng thái hoá đơn với ID ${id}`);
        }
        this.logger.log(`Trạng thái hoá đơn ${id} đã được cập nhật thành: ${updateStatusDto.status} cho user: ${userId}`);
        return updatedInvoice;
    }
    async makePayment(id, paymentDto, userId) {
        this.logger.log(`💳 Thanh toán ${paymentDto.amount} cho hoá đơn ${id} bởi user: ${userId}`);
        const invoice = await this.invoiceModel
            .findOne({ _id: id, isDeleted: false, createdBy: new mongoose_2.Types.ObjectId(userId) })
            .exec();
        if (!invoice) {
            throw new common_1.ForbiddenException('Bạn không có quyền thanh toán hoá đơn này');
        }
        if (paymentDto.amount <= 0) {
            throw new common_1.BadRequestException('Số tiền thanh toán phải lớn hơn 0');
        }
        this.logger.log(`🔍 Debug thanh toán - Hoá đơn ${id}:`);
        this.logger.log(`  - totalAmount: ${invoice.totalAmount}`);
        this.logger.log(`  - paidAmount: ${invoice.paidAmount}`);
        this.logger.log(`  - remainingAmount: ${invoice.remainingAmount}`);
        this.logger.log(`  - paymentDto.amount: ${paymentDto.amount}`);
        if (invoice.remainingAmount <= 0) {
            throw new common_1.BadRequestException('Hoá đơn đã được thanh toán đầy đủ, không thể thanh toán thêm');
        }
        if (paymentDto.amount > invoice.remainingAmount) {
            throw new common_1.BadRequestException(`Số tiền thanh toán (${paymentDto.amount}) không thể vượt quá số tiền còn lại (${invoice.remainingAmount})`);
        }
        const newPaidAmount = invoice.paidAmount + paymentDto.amount;
        const newRemainingAmount = invoice.totalAmount - newPaidAmount;
        let newPaymentStatus;
        if (newRemainingAmount === 0) {
            newPaymentStatus = 'paid';
        }
        else if (newPaidAmount > 0) {
            newPaymentStatus = 'partial';
        }
        else {
            newPaymentStatus = 'unpaid';
        }
        const updateData = {
            paidAmount: newPaidAmount,
            remainingAmount: newRemainingAmount,
            paymentStatus: newPaymentStatus,
            notes: paymentDto.notes || invoice.notes
        };
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
            throw new common_1.NotFoundException(`Không thể cập nhật thanh toán cho hoá đơn với ID ${id}`);
        }
        this.logger.log(`✅ Thanh toán thành công: ${paymentDto.amount} cho hoá đơn ${id}. Số tiền còn lại: ${newRemainingAmount}`);
        return updatedInvoice;
    }
    async updatePaymentStatus(id, updatePaymentDto, userId) {
        this.logger.log(`Cập nhật trạng thái thanh toán hoá đơn ${id} thành: ${updatePaymentDto.paymentStatus} cho user: ${userId}`);
        const invoice = await this.invoiceModel
            .findOne({ _id: id, isDeleted: false, createdBy: new mongoose_2.Types.ObjectId(userId) })
            .exec();
        if (!invoice) {
            throw new common_1.ForbiddenException('Bạn không có quyền cập nhật hoá đơn này');
        }
        if (updatePaymentDto.paidAmount !== undefined) {
            if (updatePaymentDto.paidAmount < 0) {
                throw new common_1.BadRequestException('Số tiền đã trả không thể âm');
            }
            if (updatePaymentDto.paidAmount > invoice.totalAmount) {
                throw new common_1.BadRequestException('Số tiền đã trả không thể vượt quá tổng tiền hoá đơn');
            }
        }
        if (updatePaymentDto.remainingAmount !== undefined) {
            if (updatePaymentDto.remainingAmount < 0) {
                throw new common_1.BadRequestException('Số tiền còn lại không thể âm');
            }
            if (updatePaymentDto.remainingAmount > invoice.totalAmount) {
                throw new common_1.BadRequestException('Số tiền còn lại không thể vượt quá tổng tiền hoá đơn');
            }
        }
        const updateData = {
            paymentStatus: updatePaymentDto.paymentStatus,
            notes: updatePaymentDto.notes
        };
        if (updatePaymentDto.paidAmount !== undefined) {
            updateData.paidAmount = updatePaymentDto.paidAmount;
            updateData.remainingAmount = invoice.totalAmount - updatePaymentDto.paidAmount;
        }
        if (updatePaymentDto.paymentStatus === undefined && updatePaymentDto.paidAmount !== undefined) {
            if (updatePaymentDto.paidAmount === 0) {
                updateData.paymentStatus = 'unpaid';
            }
            else if (updatePaymentDto.paidAmount >= invoice.totalAmount) {
                updateData.paymentStatus = 'paid';
            }
            else {
                updateData.paymentStatus = 'partial';
            }
        }
        if (updatePaymentDto.remainingAmount !== undefined && updatePaymentDto.paidAmount === undefined) {
            updateData.paidAmount = invoice.totalAmount - updatePaymentDto.remainingAmount;
            updateData.remainingAmount = updatePaymentDto.remainingAmount;
            if (updateData.paidAmount === 0) {
                updateData.paymentStatus = 'unpaid';
            }
            else if (updateData.paidAmount >= invoice.totalAmount) {
                updateData.paymentStatus = 'paid';
            }
            else {
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
            throw new common_1.NotFoundException(`Không thể cập nhật trạng thái thanh toán hoá đơn với ID ${id}`);
        }
        this.logger.log(`Trạng thái thanh toán hoá đơn ${id} đã được cập nhật thành: ${updatePaymentDto.paymentStatus} cho user: ${userId}`);
        return updatedInvoice;
    }
    async remove(id, userId) {
        this.logger.log(`Xóa hoá đơn với ID: ${id} cho user: ${userId}`);
        const invoice = await this.invoiceModel
            .findOne({ _id: id, isDeleted: false, createdBy: new mongoose_2.Types.ObjectId(userId) })
            .exec();
        if (!invoice) {
            throw new common_1.ForbiddenException('Bạn không có quyền xóa hoá đơn này');
        }
        if (invoice.status === 'delivered' || invoice.paymentStatus === 'paid') {
            throw new common_1.BadRequestException('Không thể xóa hoá đơn đã hoàn thành hoặc đã thanh toán');
        }
        await this.invoiceModel.findByIdAndUpdate(id, { isDeleted: true });
        this.logger.log(`Hoá đơn ${id} đã được xóa thành công cho user: ${userId}`);
    }
    async getStatistics(userId, startDate, endDate) {
        this.logger.log(`Lấy thống kê hoá đơn cho user: ${userId}`);
        const filter = {
            isDeleted: false,
            createdBy: new mongoose_2.Types.ObjectId(userId)
        };
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate)
                filter.createdAt.$gte = new Date(startDate);
            if (endDate)
                filter.createdAt.$lte = new Date(endDate);
        }
        const [totalInvoices, totalRevenue, pendingInvoices, confirmedInvoices, deliveredInvoices, cancelledInvoices, unpaidInvoices, paidInvoices, paymentMethodStats] = await Promise.all([
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
    async updateItemDelivery(invoiceId, itemIndex, updateDeliveryDto, userId) {
        this.logger.log(`🚚 Cập nhật giao hàng cho item ${itemIndex} của hoá đơn ${invoiceId} bởi user: ${userId}`);
        const invoice = await this.invoiceModel
            .findOne({ _id: invoiceId, isDeleted: false, createdBy: new mongoose_2.Types.ObjectId(userId) })
            .exec();
        if (!invoice) {
            throw new common_1.ForbiddenException('Bạn không có quyền cập nhật hoá đơn này');
        }
        if (itemIndex < 0 || itemIndex >= invoice.items.length) {
            throw new common_1.BadRequestException(`Chỉ số item không hợp lệ: ${itemIndex}`);
        }
        const item = invoice.items[itemIndex];
        if (updateDeliveryDto.deliveredQuantity <= 0) {
            throw new common_1.BadRequestException('Số lượng giao hàng phải lớn hơn 0');
        }
        if (updateDeliveryDto.deliveredQuantity > item.quantity) {
            throw new common_1.BadRequestException(`Số lượng giao hàng (${updateDeliveryDto.deliveredQuantity}) không thể vượt quá số lượng đặt hàng (${item.quantity})`);
        }
        const currentDeliveredQuantity = item.deliveredQuantity || 0;
        const remainingQuantity = item.quantity - currentDeliveredQuantity;
        if (updateDeliveryDto.deliveredQuantity > remainingQuantity) {
            throw new common_1.BadRequestException(`Số lượng giao hàng (${updateDeliveryDto.deliveredQuantity}) vượt quá số lượng còn lại cần giao (${remainingQuantity})`);
        }
        await this.checkInventoryAvailability([{ materialId: item.materialId, quantity: updateDeliveryDto.deliveredQuantity }], userId);
        this.logger.log(`✅ Đã kiểm tra tồn kho - đủ hàng để giao ${updateDeliveryDto.deliveredQuantity} ${item.unit}`);
        const newDeliveredQuantity = currentDeliveredQuantity + updateDeliveryDto.deliveredQuantity;
        let newDeliveryStatus;
        if (newDeliveredQuantity >= item.quantity) {
            newDeliveryStatus = 'delivered';
        }
        else if (newDeliveredQuantity > 0) {
            newDeliveryStatus = 'partial';
        }
        else {
            newDeliveryStatus = 'pending';
        }
        const updatedItems = [...invoice.items];
        updatedItems[itemIndex] = {
            ...updatedItems[itemIndex],
            deliveredQuantity: newDeliveredQuantity,
            deliveryStatus: newDeliveryStatus,
            deliveredAt: new Date(),
            deliveredBy: new mongoose_2.Types.ObjectId(userId)
        };
        const allItemsDelivered = updatedItems.every(item => item.deliveryStatus === 'delivered');
        const someItemsDelivered = updatedItems.some(item => item.deliveryStatus === 'delivered' || item.deliveryStatus === 'partial');
        let newInvoiceStatus = invoice.status;
        if (allItemsDelivered && invoice.status !== 'delivered') {
            newInvoiceStatus = 'delivered';
        }
        else if (someItemsDelivered && invoice.status === 'pending') {
            newInvoiceStatus = 'shipped';
        }
        const updateData = {
            items: updatedItems,
            status: newInvoiceStatus
        };
        if (allItemsDelivered && !invoice.deliveryDate) {
            updateData.deliveryDate = new Date();
        }
        const updatedInvoice = await this.invoiceModel
            .findByIdAndUpdate(invoiceId, updateData, { new: true })
            .populate('customerId', 'name email')
            .populate('createdBy', 'name email')
            .populate('approvedBy', 'name email')
            .exec();
        if (!updatedInvoice) {
            throw new common_1.NotFoundException(`Không thể cập nhật giao hàng cho hoá đơn với ID ${invoiceId}`);
        }
        await this.updateMaterialInventory([{ materialId: item.materialId, quantity: updateDeliveryDto.deliveredQuantity }], 'decrease');
        this.logger.log(`✅ Cập nhật giao hàng thành công: ${updateDeliveryDto.deliveredQuantity} ${item.unit} cho ${item.materialName}`);
        this.logger.log(`📦 Tồn kho đã được trừ: ${updateDeliveryDto.deliveredQuantity} ${item.unit}`);
        return updatedInvoice;
    }
    async getDeliveryStatus(invoiceId, userId) {
        this.logger.log(`📊 Lấy thông tin trạng thái giao hàng cho hoá đơn ${invoiceId} bởi user: ${userId}`);
        const invoice = await this.invoiceModel
            .findOne({ _id: invoiceId, isDeleted: false, createdBy: new mongoose_2.Types.ObjectId(userId) })
            .exec();
        if (!invoice) {
            throw new common_1.ForbiddenException('Bạn không có quyền truy cập hoá đơn này');
        }
        const deliverySummary = {
            totalItems: invoice.items.length,
            deliveredItems: invoice.items.filter(item => item.deliveryStatus === 'delivered').length,
            partialItems: invoice.items.filter(item => item.deliveryStatus === 'partial').length,
            pendingItems: invoice.items.filter(item => item.deliveryStatus === 'pending' || !item.deliveryStatus).length,
            totalQuantity: invoice.items.reduce((sum, item) => sum + item.quantity, 0),
            deliveredQuantity: invoice.items.reduce((sum, item) => sum + (item.deliveredQuantity || 0), 0),
            remainingQuantity: invoice.items.reduce((sum, item) => sum + (item.quantity - (item.deliveredQuantity || 0)), 0),
            items: invoice.items.map((item, index) => ({
                index,
                materialName: item.materialName,
                quantity: item.quantity,
                deliveredQuantity: item.deliveredQuantity || 0,
                remainingQuantity: item.quantity - (item.deliveredQuantity || 0),
                deliveryStatus: item.deliveryStatus || 'pending',
                deliveredAt: item.deliveredAt,
                unit: item.unit
            }))
        };
        return deliverySummary;
    }
    async getDeliveredAmount(invoiceId, userId) {
        this.logger.log(`💰 Tính tổng tiền hàng hoá đã giao cho hoá đơn ${invoiceId} bởi user: ${userId}`);
        const invoice = await this.invoiceModel
            .findOne({ _id: invoiceId, isDeleted: false, createdBy: new mongoose_2.Types.ObjectId(userId) })
            .exec();
        if (!invoice) {
            throw new common_1.ForbiddenException('Bạn không có quyền truy cập hoá đơn này');
        }
        let deliveredAmount = 0;
        let totalDeliveredQuantity = 0;
        let totalOrderedQuantity = 0;
        const deliveredItems = [];
        for (const item of invoice.items) {
            const deliveredQuantity = item.deliveredQuantity || 0;
            const orderedQuantity = item.quantity;
            const unitPrice = item.unitPrice;
            const itemDeliveredAmount = deliveredQuantity * unitPrice;
            deliveredAmount += itemDeliveredAmount;
            totalDeliveredQuantity += deliveredQuantity;
            totalOrderedQuantity += orderedQuantity;
            if (deliveredQuantity > 0) {
                deliveredItems.push({
                    materialId: item.materialId,
                    materialName: item.materialName,
                    unit: item.unit,
                    orderedQuantity: orderedQuantity,
                    deliveredQuantity: deliveredQuantity,
                    remainingQuantity: orderedQuantity - deliveredQuantity,
                    unitPrice: unitPrice,
                    deliveredAmount: itemDeliveredAmount,
                    deliveryStatus: item.deliveryStatus || 'pending',
                    deliveredAt: item.deliveredAt
                });
            }
        }
        const deliveryPercentage = totalOrderedQuantity > 0
            ? (totalDeliveredQuantity / totalOrderedQuantity) * 100
            : 0;
        const deliveredAmountPercentage = invoice.totalAmount > 0
            ? (deliveredAmount / invoice.totalAmount) * 100
            : 0;
        const result = {
            invoiceId: invoice._id,
            invoiceNumber: invoice.invoiceNumber,
            customerName: invoice.customerName,
            totalOrderedAmount: invoice.totalAmount,
            deliveredAmount: Math.round(deliveredAmount * 100) / 100,
            remainingAmount: Math.round((invoice.totalAmount - deliveredAmount) * 100) / 100,
            totalOrderedQuantity,
            totalDeliveredQuantity,
            deliveryPercentage: Math.round(deliveryPercentage * 100) / 100,
            deliveredAmountPercentage: Math.round(deliveredAmountPercentage * 100) / 100,
            deliveredItems,
            summary: {
                totalItems: invoice.items.length,
                deliveredItems: deliveredItems.length,
                pendingItems: invoice.items.filter(item => (item.deliveredQuantity || 0) === 0).length,
                partialItems: invoice.items.filter(item => {
                    const delivered = item.deliveredQuantity || 0;
                    return delivered > 0 && delivered < item.quantity;
                }).length,
                fullyDeliveredItems: invoice.items.filter(item => (item.deliveredQuantity || 0) >= item.quantity).length
            }
        };
        this.logger.log(`✅ Tổng tiền hàng đã giao: ${deliveredAmount} VNĐ (${deliveredAmountPercentage.toFixed(2)}% của tổng hoá đơn)`);
        return result;
    }
};
exports.InvoiceService = InvoiceService;
exports.InvoiceService = InvoiceService = InvoiceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(invoice_model_1.Invoice.name)),
    __param(1, (0, mongoose_1.InjectModel)(material_model_1.Material.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], InvoiceService);
//# sourceMappingURL=invoice.service.js.map