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
var InvoiceController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceController = void 0;
const common_1 = require("@nestjs/common");
const invoice_service_1 = require("../services/invoice.service");
const invoice_dto_1 = require("../dto/invoice.dto");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const current_user_decorator_1 = require("../decorators/current-user.decorator");
const payment_constants_1 = require("../constants/payment.constants");
let InvoiceController = InvoiceController_1 = class InvoiceController {
    invoiceService;
    logger = new common_1.Logger(InvoiceController_1.name);
    constructor(invoiceService) {
        this.invoiceService = invoiceService;
    }
    create(createInvoiceDto, user) {
        this.logger.log(`📝 POST /invoices - Tạo hoá đơn mới cho khách hàng: ${createInvoiceDto.customerName}`);
        return this.invoiceService.create(createInvoiceDto, user.id);
    }
    findAll(query, user) {
        this.logger.log(`🔍 GET /invoices - Lấy danh sách hoá đơn cho user: ${user.id}`);
        return this.invoiceService.findAll(query, user.id);
    }
    getStatistics(user, startDate, endDate) {
        this.logger.log(`📊 GET /invoices/statistics - Lấy thống kê hoá đơn cho user: ${user.id}`);
        return this.invoiceService.getStatistics(user.id, startDate, endDate);
    }
    getPaymentMethods() {
        this.logger.log('💳 GET /invoices/payment-methods - Lấy danh sách phương thức thanh toán');
        return {
            methods: Object.values(payment_constants_1.PaymentMethod).map(method => ({
                value: method,
                label: payment_constants_1.PAYMENT_METHOD_LABELS[method]
            }))
        };
    }
    findByInvoiceNumber(invoiceNumber, user) {
        this.logger.log(`🔍 GET /invoices/number/${invoiceNumber} - Lấy hoá đơn theo số cho user: ${user.id}`);
        return this.invoiceService.findByInvoiceNumber(invoiceNumber, user.id);
    }
    findPending(user) {
        this.logger.log(`⏳ GET /invoices/pending - Lấy danh sách hoá đơn chờ xử lý cho user: ${user.id}`);
        return this.invoiceService.findAll({ status: 'pending', page: 1, limit: 100 }, user.id);
    }
    findConfirmed(user) {
        this.logger.log(`✅ GET /invoices/confirmed - Lấy danh sách hoá đơn đã xác nhận cho user: ${user.id}`);
        return this.invoiceService.findAll({ status: 'confirmed', page: 1, limit: 100 }, user.id);
    }
    findDelivered(user) {
        this.logger.log(`🚚 GET /invoices/delivered - Lấy danh sách hoá đơn đã giao cho user: ${user.id}`);
        return this.invoiceService.findAll({ status: 'delivered', page: 1, limit: 100 }, user.id);
    }
    findUnpaid(user) {
        this.logger.log(`💰 GET /invoices/unpaid - Lấy danh sách hoá đơn chưa thanh toán cho user: ${user.id}`);
        return this.invoiceService.findAll({ paymentStatus: 'unpaid', page: 1, limit: 100 }, user.id);
    }
    findPaid(user) {
        this.logger.log(`💳 GET /invoices/paid - Lấy danh sách hoá đơn đã thanh toán cho user: ${user.id}`);
        return this.invoiceService.findAll({ paymentStatus: 'paid', page: 1, limit: 100 }, user.id);
    }
    findByPaymentMethod(method, user) {
        this.logger.log(`💳 GET /invoices/payment-method/${method} - Lấy danh sách hoá đơn theo phương thức thanh toán cho user: ${user.id}`);
        if (!Object.values(payment_constants_1.PaymentMethod).includes(method)) {
            throw new common_1.BadRequestException(`Phương thức thanh toán không hợp lệ: ${method}`);
        }
        return this.invoiceService.findAll({ paymentMethod: method, page: 1, limit: 100 }, user.id);
    }
    findOne(id, user) {
        this.logger.log(`🔍 GET /invoices/${id} - Lấy thông tin hoá đơn theo ID cho user: ${user.id}`);
        return this.invoiceService.findOne(id, user.id);
    }
    update(id, updateInvoiceDto, user) {
        this.logger.log(`🔄 PATCH /invoices/${id} - Cập nhật hoá đơn cho user: ${user.id}`);
        return this.invoiceService.update(id, updateInvoiceDto, user.id);
    }
    updateStatus(id, updateStatusDto, user) {
        this.logger.log(`🔄 PATCH /invoices/${id}/status - Cập nhật trạng thái hoá đơn thành: ${updateStatusDto.status}`);
        return this.invoiceService.updateStatus(id, updateStatusDto, user.id);
    }
    updatePaymentStatus(id, updatePaymentDto, user) {
        this.logger.log(`💳 PATCH /invoices/${id}/payment-status - Cập nhật trạng thái thanh toán thành: ${updatePaymentDto.paymentStatus} cho user: ${user.id}`);
        return this.invoiceService.updatePaymentStatus(id, updatePaymentDto, user.id);
    }
    remove(id, user) {
        this.logger.log(`🗑️ DELETE /invoices/${id} - Xóa hoá đơn cho user: ${user.id}`);
        return this.invoiceService.remove(id, user.id);
    }
    getInvoiceForPrint(id, user) {
        this.logger.log(`🖨️ GET /invoices/${id}/print - Lấy dữ liệu hoá đơn để in cho user: ${user.id}`);
        return this.invoiceService.findOne(id, user.id);
    }
    sendInvoiceByEmail(id, emailData) {
        this.logger.log(`📧 POST /invoices/${id}/send-email - Gửi hoá đơn qua email: ${emailData.email}`);
        return { message: 'Chức năng gửi email sẽ được triển khai sau' };
    }
    exportInvoiceToPDF(id) {
        this.logger.log(`📄 GET /invoices/${id}/export-pdf - Xuất hoá đơn ra PDF`);
        return { message: 'Chức năng xuất PDF sẽ được triển khai sau' };
    }
};
exports.InvoiceController = InvoiceController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [invoice_dto_1.CreateInvoiceDto, Object]),
    __metadata("design:returntype", void 0)
], InvoiceController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [invoice_dto_1.InvoiceQueryDto, Object]),
    __metadata("design:returntype", void 0)
], InvoiceController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('statistics'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], InvoiceController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Get)('payment-methods'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InvoiceController.prototype, "getPaymentMethods", null);
__decorate([
    (0, common_1.Get)('number/:invoiceNumber'),
    __param(0, (0, common_1.Param)('invoiceNumber')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], InvoiceController.prototype, "findByInvoiceNumber", null);
__decorate([
    (0, common_1.Get)('pending'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], InvoiceController.prototype, "findPending", null);
__decorate([
    (0, common_1.Get)('confirmed'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], InvoiceController.prototype, "findConfirmed", null);
__decorate([
    (0, common_1.Get)('delivered'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], InvoiceController.prototype, "findDelivered", null);
__decorate([
    (0, common_1.Get)('unpaid'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], InvoiceController.prototype, "findUnpaid", null);
__decorate([
    (0, common_1.Get)('paid'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], InvoiceController.prototype, "findPaid", null);
__decorate([
    (0, common_1.Get)('payment-method/:method'),
    __param(0, (0, common_1.Param)('method')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], InvoiceController.prototype, "findByPaymentMethod", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], InvoiceController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, invoice_dto_1.UpdateInvoiceDto, Object]),
    __metadata("design:returntype", void 0)
], InvoiceController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, invoice_dto_1.UpdateInvoiceStatusDto, Object]),
    __metadata("design:returntype", void 0)
], InvoiceController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)(':id/payment-status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, invoice_dto_1.UpdatePaymentStatusDto, Object]),
    __metadata("design:returntype", void 0)
], InvoiceController.prototype, "updatePaymentStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], InvoiceController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':id/print'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], InvoiceController.prototype, "getInvoiceForPrint", null);
__decorate([
    (0, common_1.Post)(':id/send-email'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], InvoiceController.prototype, "sendInvoiceByEmail", null);
__decorate([
    (0, common_1.Get)(':id/export-pdf'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InvoiceController.prototype, "exportInvoiceToPDF", null);
exports.InvoiceController = InvoiceController = InvoiceController_1 = __decorate([
    (0, common_1.Controller)('invoices'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [invoice_service_1.InvoiceService])
], InvoiceController);
//# sourceMappingURL=invoice.controller.js.map