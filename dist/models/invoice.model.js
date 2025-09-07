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
exports.InvoiceSchema = exports.Invoice = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const payment_constants_1 = require("../constants/payment.constants");
let Invoice = class Invoice extends mongoose_2.Document {
    invoiceNumber;
    customerId;
    customerName;
    customerPhone;
    customerAddress;
    items;
    subtotal;
    taxRate;
    taxAmount;
    discountRate;
    discountAmount;
    totalAmount;
    status;
    paymentMethod;
    paymentStatus;
    paidAmount;
    remainingAmount;
    notes;
    deliveryDate;
    createdBy;
    approvedBy;
    approvedAt;
    isDeleted;
};
exports.Invoice = Invoice;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], Invoice.prototype, "invoiceNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Invoice.prototype, "customerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Invoice.prototype, "customerName", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Invoice.prototype, "customerPhone", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Invoice.prototype, "customerAddress", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: [Object] }),
    __metadata("design:type", Array)
], Invoice.prototype, "items", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Invoice.prototype, "subtotal", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Invoice.prototype, "taxRate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Invoice.prototype, "taxAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Invoice.prototype, "discountRate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Invoice.prototype, "discountAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Invoice.prototype, "totalAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'pending' }),
    __metadata("design:type", String)
], Invoice.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: payment_constants_1.PaymentMethod.CASH, enum: payment_constants_1.PaymentMethod }),
    __metadata("design:type", String)
], Invoice.prototype, "paymentMethod", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'unpaid' }),
    __metadata("design:type", String)
], Invoice.prototype, "paymentStatus", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Invoice.prototype, "paidAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Invoice.prototype, "remainingAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Invoice.prototype, "notes", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Invoice.prototype, "deliveryDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Invoice.prototype, "createdBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Invoice.prototype, "approvedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Invoice.prototype, "approvedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Invoice.prototype, "isDeleted", void 0);
exports.Invoice = Invoice = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Invoice);
exports.InvoiceSchema = mongoose_1.SchemaFactory.createForClass(Invoice);
exports.InvoiceSchema.index({ invoiceNumber: 1 });
exports.InvoiceSchema.index({ customerId: 1 });
exports.InvoiceSchema.index({ status: 1 });
exports.InvoiceSchema.index({ createdAt: -1 });
exports.InvoiceSchema.index({ isDeleted: 1 });
//# sourceMappingURL=invoice.model.js.map