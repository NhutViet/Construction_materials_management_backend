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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockInSchema = exports.StockIn = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let StockIn = class StockIn {
    stockInNumber;
    userId;
    items;
    subtotal;
    taxRate;
    taxAmount;
    discountRate;
    discountAmount;
    totalAmount;
    paymentStatus;
    paidAmount;
    remainingAmount;
    status;
    supplier;
    supplierPhone;
    supplierAddress;
    notes;
    receivedDate;
    createdBy;
    approvedBy;
    approvedAt;
    isDeleted;
};
exports.StockIn = StockIn;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], StockIn.prototype, "stockInNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], StockIn.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: [Object] }),
    __metadata("design:type", Array)
], StockIn.prototype, "items", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], StockIn.prototype, "subtotal", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], StockIn.prototype, "taxRate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], StockIn.prototype, "taxAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], StockIn.prototype, "discountRate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], StockIn.prototype, "discountAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], StockIn.prototype, "totalAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        default: 'unpaid',
        enum: ['unpaid', 'partial', 'paid'],
        required: true
    }),
    __metadata("design:type", String)
], StockIn.prototype, "paymentStatus", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], StockIn.prototype, "paidAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], StockIn.prototype, "remainingAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'pending' }),
    __metadata("design:type", String)
], StockIn.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], StockIn.prototype, "supplier", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], StockIn.prototype, "supplierPhone", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], StockIn.prototype, "supplierAddress", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], StockIn.prototype, "notes", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], StockIn.prototype, "receivedDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], StockIn.prototype, "createdBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], StockIn.prototype, "approvedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], StockIn.prototype, "approvedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], StockIn.prototype, "isDeleted", void 0);
exports.StockIn = StockIn = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], StockIn);
exports.StockInSchema = mongoose_1.SchemaFactory.createForClass(StockIn);
exports.StockInSchema.index({ stockInNumber: 1 });
exports.StockInSchema.index({ userId: 1 });
exports.StockInSchema.index({ status: 1 });
exports.StockInSchema.index({ paymentStatus: 1 });
exports.StockInSchema.index({ createdAt: -1 });
exports.StockInSchema.index({ isDeleted: 1 });
//# sourceMappingURL=stock-in.model.js.map