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
import { CreateInvoiceDto, UpdateInvoiceDto, UpdateInvoiceStatusDto, UpdatePaymentStatusDto, InvoiceQueryDto } from '../dto/invoice.dto';
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
  findAll(@Query() query: InvoiceQueryDto) {
    this.logger.log('🔍 GET /invoices - Lấy danh sách hoá đơn');
    return this.invoiceService.findAll(query);
  }

  @Get('statistics')
  getStatistics(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    this.logger.log('📊 GET /invoices/statistics - Lấy thống kê hoá đơn');
    return this.invoiceService.getStatistics(startDate, endDate);
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
  findByInvoiceNumber(@Param('invoiceNumber') invoiceNumber: string) {
    this.logger.log(`🔍 GET /invoices/number/${invoiceNumber} - Lấy hoá đơn theo số`);
    return this.invoiceService.findByInvoiceNumber(invoiceNumber);
  }

  @Get('pending')
  findPending() {
    this.logger.log('⏳ GET /invoices/pending - Lấy danh sách hoá đơn chờ xử lý');
    return this.invoiceService.findAll({ status: 'pending', page: 1, limit: 100 });
  }

  @Get('confirmed')
  findConfirmed() {
    this.logger.log('✅ GET /invoices/confirmed - Lấy danh sách hoá đơn đã xác nhận');
    return this.invoiceService.findAll({ status: 'confirmed', page: 1, limit: 100 });
  }

  @Get('delivered')
  findDelivered() {
    this.logger.log('🚚 GET /invoices/delivered - Lấy danh sách hoá đơn đã giao');
    return this.invoiceService.findAll({ status: 'delivered', page: 1, limit: 100 });
  }

  @Get('unpaid')
  findUnpaid() {
    this.logger.log('💰 GET /invoices/unpaid - Lấy danh sách hoá đơn chưa thanh toán');
    return this.invoiceService.findAll({ paymentStatus: 'unpaid', page: 1, limit: 100 });
  }

  @Get('paid')
  findPaid() {
    this.logger.log('💳 GET /invoices/paid - Lấy danh sách hoá đơn đã thanh toán');
    return this.invoiceService.findAll({ paymentStatus: 'paid', page: 1, limit: 100 });
  }

  @Get('payment-method/:method')
  findByPaymentMethod(@Param('method') method: string) {
    this.logger.log(`💳 GET /invoices/payment-method/${method} - Lấy danh sách hoá đơn theo phương thức thanh toán`);
    
    // Validate method parameter
    if (!Object.values(PaymentMethod).includes(method as PaymentMethod)) {
      throw new BadRequestException(`Phương thức thanh toán không hợp lệ: ${method}`);
    }
    
    return this.invoiceService.findAll({ paymentMethod: method as PaymentMethod, page: 1, limit: 100 });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    this.logger.log(`🔍 GET /invoices/${id} - Lấy thông tin hoá đơn theo ID`);
    return this.invoiceService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInvoiceDto: UpdateInvoiceDto) {
    this.logger.log(`🔄 PATCH /invoices/${id} - Cập nhật hoá đơn`);
    return this.invoiceService.update(id, updateInvoiceDto);
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
    @Body() updatePaymentDto: UpdatePaymentStatusDto
  ) {
    this.logger.log(`💳 PATCH /invoices/${id}/payment-status - Cập nhật trạng thái thanh toán thành: ${updatePaymentDto.paymentStatus}`);
    return this.invoiceService.updatePaymentStatus(id, updatePaymentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    this.logger.log(`🗑️ DELETE /invoices/${id} - Xóa hoá đơn`);
    return this.invoiceService.remove(id);
  }

  // API để in hoá đơn (trả về dữ liệu để frontend render)
  @Get(':id/print')
  getInvoiceForPrint(@Param('id') id: string) {
    this.logger.log(`🖨️ GET /invoices/${id}/print - Lấy dữ liệu hoá đơn để in`);
    return this.invoiceService.findOne(id);
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
