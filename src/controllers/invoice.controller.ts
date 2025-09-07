import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Logger,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { InvoiceService } from '../services/invoice.service';
import { CreateInvoiceDto, UpdateInvoiceDto, UpdateInvoiceStatusDto, UpdatePaymentStatusDto, InvoiceQueryDto, PaymentDto } from '../dto/invoice.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { PaymentMethod, PAYMENT_METHOD_LABELS } from '../constants/payment.constants';

@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoiceController {
  private readonly logger = new Logger(InvoiceController.name);

  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  create(@Body() createInvoiceDto: CreateInvoiceDto, @CurrentUser() user: any) {
    this.logger.log(`📝 POST /invoices - Tạo hoá đơn mới cho khách hàng: ${createInvoiceDto.customerName}`);
    return this.invoiceService.create(createInvoiceDto, user.id);
  }

  @Get()
  findAll(@Query() query: InvoiceQueryDto, @CurrentUser() user: any) {
    this.logger.log(`🔍 GET /invoices - Lấy danh sách hoá đơn cho user: ${user.id}`);
    return this.invoiceService.findAll(query, user.id);
  }

  @Get('statistics')
  getStatistics(@CurrentUser() user: any, @Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    this.logger.log(`📊 GET /invoices/statistics - Lấy thống kê hoá đơn cho user: ${user.id}`);
    return this.invoiceService.getStatistics(user.id, startDate, endDate);
  }

  @Get('payment-methods')
  getPaymentMethods() {
    this.logger.log('💳 GET /invoices/payment-methods - Lấy danh sách phương thức thanh toán');
    return {
      methods: Object.values(PaymentMethod).map(method => ({
        value: method,
        label: PAYMENT_METHOD_LABELS[method]
      }))
    };
  }

  @Get('number/:invoiceNumber')
  findByInvoiceNumber(@Param('invoiceNumber') invoiceNumber: string, @CurrentUser() user: any) {
    this.logger.log(`🔍 GET /invoices/number/${invoiceNumber} - Lấy hoá đơn theo số cho user: ${user.id}`);
    return this.invoiceService.findByInvoiceNumber(invoiceNumber, user.id);
  }

  @Get('pending')
  findPending(@CurrentUser() user: any) {
    this.logger.log(`⏳ GET /invoices/pending - Lấy danh sách hoá đơn chờ xử lý cho user: ${user.id}`);
    return this.invoiceService.findAll({ status: 'pending', page: 1, limit: 100 }, user.id);
  }

  @Get('confirmed')
  findConfirmed(@CurrentUser() user: any) {
    this.logger.log(`✅ GET /invoices/confirmed - Lấy danh sách hoá đơn đã xác nhận cho user: ${user.id}`);
    return this.invoiceService.findAll({ status: 'confirmed', page: 1, limit: 100 }, user.id);
  }

  @Get('delivered')
  findDelivered(@CurrentUser() user: any) {
    this.logger.log(`🚚 GET /invoices/delivered - Lấy danh sách hoá đơn đã giao cho user: ${user.id}`);
    return this.invoiceService.findAll({ status: 'delivered', page: 1, limit: 100 }, user.id);
  }

  @Get('unpaid')
  findUnpaid(@CurrentUser() user: any) {
    this.logger.log(`💰 GET /invoices/unpaid - Lấy danh sách hoá đơn chưa thanh toán cho user: ${user.id}`);
    return this.invoiceService.findAll({ paymentStatus: 'unpaid', page: 1, limit: 100 }, user.id);
  }

  @Get('paid')
  findPaid(@CurrentUser() user: any) {
    this.logger.log(`💳 GET /invoices/paid - Lấy danh sách hoá đơn đã thanh toán cho user: ${user.id}`);
    return this.invoiceService.findAll({ paymentStatus: 'paid', page: 1, limit: 100 }, user.id);
  }

  @Get('payment-method/:method')
  findByPaymentMethod(@Param('method') method: string, @CurrentUser() user: any) {
    this.logger.log(`💳 GET /invoices/payment-method/${method} - Lấy danh sách hoá đơn theo phương thức thanh toán cho user: ${user.id}`);
    
    // Validate method parameter
    if (!Object.values(PaymentMethod).includes(method as PaymentMethod)) {
      throw new BadRequestException(`Phương thức thanh toán không hợp lệ: ${method}`);
    }
    
    return this.invoiceService.findAll({ paymentMethod: method as PaymentMethod, page: 1, limit: 100 }, user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    this.logger.log(`🔍 GET /invoices/${id} - Lấy thông tin hoá đơn theo ID cho user: ${user.id}`);
    return this.invoiceService.findOne(id, user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInvoiceDto: UpdateInvoiceDto, @CurrentUser() user: any) {
    this.logger.log(`🔄 PATCH /invoices/${id} - Cập nhật hoá đơn cho user: ${user.id}`);
    return this.invoiceService.update(id, updateInvoiceDto, user.id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateInvoiceStatusDto,
    @CurrentUser() user: any
  ) {
    this.logger.log(`🔄 PATCH /invoices/${id}/status - Cập nhật trạng thái hoá đơn thành: ${updateStatusDto.status}`);
    return this.invoiceService.updateStatus(id, updateStatusDto, user.id);
  }

  @Patch(':id/payment-status')
  updatePaymentStatus(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentStatusDto,
    @CurrentUser() user: any
  ) {
    this.logger.log(`💳 PATCH /invoices/${id}/payment-status - Cập nhật trạng thái thanh toán thành: ${updatePaymentDto.paymentStatus} cho user: ${user.id}`);
    return this.invoiceService.updatePaymentStatus(id, updatePaymentDto, user.id);
  }

  @Post(':id/payment')
  makePayment(
    @Param('id') id: string,
    @Body() paymentDto: PaymentDto,
    @CurrentUser() user: any
  ) {
    this.logger.log(`💰 POST /invoices/${id}/payment - Thanh toán ${paymentDto.amount} cho hoá đơn ${id} bởi user: ${user.id}`);
    return this.invoiceService.makePayment(id, paymentDto, user.id);
  }

  // API debug để kiểm tra thông tin hoá đơn
  @Get(':id/debug')
  debugInvoice(@Param('id') id: string, @CurrentUser() user: any) {
    this.logger.log(`🔍 GET /invoices/${id}/debug - Debug thông tin hoá đơn ${id} cho user: ${user.id}`);
    return this.invoiceService.findOne(id, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    this.logger.log(`🗑️ DELETE /invoices/${id} - Xóa hoá đơn cho user: ${user.id}`);
    return this.invoiceService.remove(id, user.id);
  }

  // API để in hoá đơn (trả về dữ liệu để frontend render)
  @Get(':id/print')
  getInvoiceForPrint(@Param('id') id: string, @CurrentUser() user: any) {
    this.logger.log(`🖨️ GET /invoices/${id}/print - Lấy dữ liệu hoá đơn để in cho user: ${user.id}`);
    return this.invoiceService.findOne(id, user.id);
  }

  // API để gửi hoá đơn qua email (placeholder)
  @Post(':id/send-email')
  sendInvoiceByEmail(@Param('id') id: string, @Body() emailData: { email: string }) {
    this.logger.log(`📧 POST /invoices/${id}/send-email - Gửi hoá đơn qua email: ${emailData.email}`);
    // TODO: Implement email sending functionality
    return { message: 'Chức năng gửi email sẽ được triển khai sau' };
  }

  // API để xuất hoá đơn ra PDF (placeholder)
  @Get(':id/export-pdf')
  exportInvoiceToPDF(@Param('id') id: string) {
    this.logger.log(`📄 GET /invoices/${id}/export-pdf - Xuất hoá đơn ra PDF`);
    // TODO: Implement PDF export functionality
    return { message: 'Chức năng xuất PDF sẽ được triển khai sau' };
  }
}
