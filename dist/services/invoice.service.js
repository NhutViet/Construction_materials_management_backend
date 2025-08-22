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
                totalPrice: item.quantity * (material.price || 0)
            };
        }));
        const values = this.calculateInvoiceValues(updatedItems, createInvoiceDto.taxRate || 0, createInvoiceDto.discountRate || 0);
        const invoiceNumber = await this.generateInvoiceNumber();
        const invoice = new this.invoiceModel({
            ...createInvoiceDto,
            invoiceNumber,
            items: updatedItems,
            ...values,
            createdBy: new mongoose_2.Types.ObjectId(userId),
            customerId: new mongoose_2.Types.ObjectId(userId),
        });
        const savedInvoice = await invoice.save();
        this.logger.log(`Hoá đơn ${invoiceNumber} đã được tạo thành công`);
        return savedInvoice;
    }
    async findAll(query) {
        this.logger.log('Lấy danh sách hoá đơn');
        const { status, paymentStatus, paymentMethod, customerName, invoiceNumber, startDate, endDate, page = 1, limit = 10 } = query;
        const filter = { isDeleted: false };
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
    async findOne(id) {
        this.logger.log(`Lấy hoá đơn với ID: ${id}`);
        const invoice = await this.invoiceModel
            .findOne({ _id: id, isDeleted: false })
            .populate('customerId', 'name email')
            .populate('createdBy', 'name email')
            .populate('approvedBy', 'name email')
            .exec();
        if (!invoice) {
            throw new common_1.NotFoundException(`Hoá đơn với ID ${id} không tồn tại`);
        }
        return invoice;
    }
    async findByInvoiceNumber(invoiceNumber) {
        this.logger.log(`Lấy hoá đơn với số: ${invoiceNumber}`);
        const invoice = await this.invoiceModel
            .findOne({ invoiceNumber, isDeleted: false })
            .populate('customerId', 'name email')
            .populate('createdBy', 'name email')
            .populate('approvedBy', 'name email')
            .exec();
        if (!invoice) {
            throw new common_1.NotFoundException(`Hoá đơn với số ${invoiceNumber} không tồn tại`);
        }
        return invoice;
    }
    async update(id, updateInvoiceDto) {
        this.logger.log(`Cập nhật hoá đơn với ID: ${id}`);
        const invoice = await this.findOne(id);
        if (updateInvoiceDto.items) {
            const updatedItems = await Promise.all(updateInvoiceDto.items.map(async (item) => {
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
                    totalPrice: item.quantity * (material.price || 0)
                };
            }));
            const values = this.calculateInvoiceValues(updatedItems, updateInvoiceDto.taxRate || invoice.taxRate, updateInvoiceDto.discountRate || invoice.discountRate);
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
            throw new common_1.NotFoundException(`Không thể cập nhật hoá đơn với ID ${id}`);
        }
        this.logger.log(`Hoá đơn ${id} đã được cập nhật thành công`);
        return updatedInvoice;
    }
    async updateStatus(id, updateStatusDto, userId) {
        this.logger.log(`Cập nhật trạng thái hoá đơn ${id} thành: ${updateStatusDto.status}`);
        const invoice = await this.findOne(id);
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
        const updatedInvoice = await this.invoiceModel
            .findByIdAndUpdate(id, updateData, { new: true })
            .populate('customerId', 'name email')
            .populate('createdBy', 'name email')
            .populate('approvedBy', 'name email')
            .exec();
        if (!updatedInvoice) {
            throw new common_1.NotFoundException(`Không thể cập nhật trạng thái hoá đơn với ID ${id}`);
        }
        this.logger.log(`Trạng thái hoá đơn ${id} đã được cập nhật thành: ${updateStatusDto.status}`);
        return updatedInvoice;
    }
    async updatePaymentStatus(id, updatePaymentDto) {
        this.logger.log(`Cập nhật trạng thái thanh toán hoá đơn ${id} thành: ${updatePaymentDto.paymentStatus}`);
        const invoice = await this.findOne(id);
        const updateData = {
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
            throw new common_1.NotFoundException(`Không thể cập nhật trạng thái thanh toán hoá đơn với ID ${id}`);
        }
        this.logger.log(`Trạng thái thanh toán hoá đơn ${id} đã được cập nhật thành: ${updatePaymentDto.paymentStatus}`);
        return updatedInvoice;
    }
    async remove(id) {
        this.logger.log(`Xóa hoá đơn với ID: ${id}`);
        const invoice = await this.findOne(id);
        if (invoice.status === 'delivered' || invoice.paymentStatus === 'paid') {
            throw new common_1.BadRequestException('Không thể xóa hoá đơn đã hoàn thành hoặc đã thanh toán');
        }
        await this.invoiceModel.findByIdAndUpdate(id, { isDeleted: true });
        this.logger.log(`Hoá đơn ${id} đã được xóa thành công`);
    }
    async getStatistics(startDate, endDate) {
        this.logger.log('Lấy thống kê hoá đơn');
        const filter = { isDeleted: false };
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