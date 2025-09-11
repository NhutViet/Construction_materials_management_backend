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
exports.StockInService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const stock_in_model_1 = require("../models/stock-in.model");
const material_model_1 = require("../models/material.model");
let StockInService = class StockInService {
    stockInModel;
    materialModel;
    constructor(stockInModel, materialModel) {
        this.stockInModel = stockInModel;
        this.materialModel = materialModel;
    }
    async createStockIn(createStockInDto, userId) {
        const stockInNumber = await this.generateStockInNumber();
        const subtotal = createStockInDto.subtotal || 0;
        const taxAmount = createStockInDto.taxAmount || 0;
        const discountAmount = createStockInDto.discountAmount || 0;
        const totalAmount = subtotal + taxAmount - discountAmount;
        const stockIn = new this.stockInModel({
            ...createStockInDto,
            stockInNumber,
            userId: new mongoose_2.Types.ObjectId(userId),
            subtotal,
            taxAmount,
            discountAmount,
            totalAmount,
            remainingAmount: totalAmount,
            createdBy: new mongoose_2.Types.ObjectId(userId),
        });
        return await stockIn.save();
    }
    async getStockIns(query, userId) {
        const { search, paymentStatus, status, supplier, startDate, endDate, page = 1, limit = 10, } = query;
        const filter = {
            userId: new mongoose_2.Types.ObjectId(userId),
            isDeleted: false,
        };
        if (search) {
            filter.$or = [
                { stockInNumber: { $regex: search, $options: 'i' } },
                { supplier: { $regex: search, $options: 'i' } },
                { notes: { $regex: search, $options: 'i' } },
            ];
        }
        if (paymentStatus) {
            filter.paymentStatus = paymentStatus;
        }
        if (status) {
            filter.status = status;
        }
        if (supplier) {
            filter.supplier = { $regex: supplier, $options: 'i' };
        }
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
    async getStockInById(id, userId) {
        const stockIn = await this.stockInModel
            .findOne({
            _id: new mongoose_2.Types.ObjectId(id),
            userId: new mongoose_2.Types.ObjectId(userId),
            isDeleted: false,
        })
            .populate('createdBy', 'name email')
            .populate('approvedBy', 'name email')
            .exec();
        if (!stockIn) {
            throw new common_1.NotFoundException('Phiếu nhập hàng không tồn tại');
        }
        return stockIn;
    }
    async updateStockIn(id, updateStockInDto, userId) {
        const stockIn = await this.getStockInById(id, userId);
        if (stockIn.status === 'approved') {
            throw new common_1.BadRequestException('Không thể chỉnh sửa phiếu nhập hàng đã được duyệt');
        }
        let updateData = { ...updateStockInDto };
        if (updateStockInDto.subtotal !== undefined || updateStockInDto.taxAmount !== undefined || updateStockInDto.discountAmount !== undefined) {
            const subtotal = updateStockInDto.subtotal || stockIn.subtotal;
            const taxAmount = updateStockInDto.taxAmount || stockIn.taxAmount;
            const discountAmount = updateStockInDto.discountAmount || stockIn.discountAmount;
            const totalAmount = subtotal + taxAmount - discountAmount;
            updateData.totalAmount = totalAmount;
            updateData.remainingAmount = totalAmount - stockIn.paidAmount;
        }
        const updatedStockIn = await this.stockInModel
            .findByIdAndUpdate(id, { ...updateData, updatedAt: new Date() }, { new: true })
            .populate('createdBy', 'name email')
            .populate('approvedBy', 'name email')
            .exec();
        if (!updatedStockIn) {
            throw new common_1.NotFoundException('Phiếu nhập hàng không tồn tại');
        }
        return updatedStockIn;
    }
    async updatePaymentStatus(id, updatePaymentStatusDto, userId) {
        const stockIn = await this.getStockInById(id, userId);
        const { paymentStatus, paidAmount } = updatePaymentStatusDto;
        if (paidAmount > stockIn.totalAmount) {
            throw new common_1.BadRequestException('Số tiền thanh toán không được vượt quá tổng tiền phiếu nhập');
        }
        if (paidAmount < 0) {
            throw new common_1.BadRequestException('Số tiền thanh toán không được âm');
        }
        let newPaymentStatus = paymentStatus;
        if (paidAmount === 0) {
            newPaymentStatus = 'unpaid';
        }
        else if (paidAmount === stockIn.totalAmount) {
            newPaymentStatus = 'paid';
        }
        else {
            newPaymentStatus = 'partial';
        }
        const remainingAmount = stockIn.totalAmount - paidAmount;
        const updatedStockIn = await this.stockInModel
            .findByIdAndUpdate(id, {
            paymentStatus: newPaymentStatus,
            paidAmount,
            remainingAmount,
            updatedAt: new Date(),
        }, { new: true })
            .populate('createdBy', 'name email')
            .populate('approvedBy', 'name email')
            .exec();
        if (!updatedStockIn) {
            throw new common_1.NotFoundException('Phiếu nhập hàng không tồn tại');
        }
        return updatedStockIn;
    }
    async updateStatus(id, updateStatusDto, userId) {
        const stockIn = await this.getStockInById(id, userId);
        const { status } = updateStatusDto;
        if (status === 'approved' && stockIn.status !== 'approved') {
            await this.updateMaterialQuantities(stockIn.items);
        }
        const updateData = {
            status,
            updatedAt: new Date(),
        };
        if (status === 'approved') {
            updateData.approvedBy = new mongoose_2.Types.ObjectId(userId);
            updateData.approvedAt = new Date();
        }
        const updatedStockIn = await this.stockInModel
            .findByIdAndUpdate(id, updateData, { new: true })
            .populate('createdBy', 'name email')
            .populate('approvedBy', 'name email')
            .exec();
        if (!updatedStockIn) {
            throw new common_1.NotFoundException('Phiếu nhập hàng không tồn tại');
        }
        return updatedStockIn;
    }
    async deleteStockIn(id, userId) {
        const stockIn = await this.getStockInById(id, userId);
        if (stockIn.status === 'approved') {
            throw new common_1.BadRequestException('Không thể xóa phiếu nhập hàng đã được duyệt');
        }
        await this.stockInModel.findByIdAndUpdate(id, {
            isDeleted: true,
            updatedAt: new Date(),
        });
    }
    async getMaterialsForSelection(userId) {
        return await this.materialModel
            .find({
            userId: new mongoose_2.Types.ObjectId(userId),
            isActive: true,
        })
            .select('name category unit price supplier')
            .sort({ name: 1 })
            .exec();
    }
    async updateMaterialQuantities(items) {
        for (const item of items) {
            await this.materialModel.findByIdAndUpdate(item.materialId, {
                $inc: { quantity: item.quantity },
                $set: { price: item.unitPrice },
            });
        }
    }
    async generateStockInNumber() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const prefix = `PN${year}${month}${day}`;
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
    async getStockInStats(userId, startDate, endDate) {
        const filter = {
            userId: new mongoose_2.Types.ObjectId(userId),
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
};
exports.StockInService = StockInService;
exports.StockInService = StockInService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(stock_in_model_1.StockIn.name)),
    __param(1, (0, mongoose_1.InjectModel)(material_model_1.Material.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], StockInService);
//# sourceMappingURL=stock-in.service.js.map