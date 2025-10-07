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
import { CreateInvoiceDto, UpdateInvoiceDto, UpdateInvoiceStatusDto, UpdatePaymentStatusDto, InvoiceQueryDto, PaymentDto, UpdateItemDeliveryDto, PublicInvoiceSearchDto } from '../dto/invoice.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { PaymentMethod, PAYMENT_METHOD_LABELS } from '../constants/payment.constants';

@Controller('invoices')
export class InvoiceController {
  private readonly logger = new Logger(InvoiceController.name);

  constructor(private readonly invoiceService: InvoiceService) {}

  // API công khai tìm kiếm hoá đơn không cần đăng nhập
  @Get('public/search')
  searchPublic(@Query() searchDto: PublicInvoiceSearchDto) {
    this.logger.log(`🔍 GET /invoices/public/search - Tìm kiếm hoá đơn công khai với thông tin: ${JSON.stringify(searchDto)}`);
    return this.invoiceService.searchPublic(searchDto);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createInvoiceDto: CreateInvoiceDto, @CurrentUser() user: any) {
    this.logger.log(`📝 POST /invoices - Tạo hoá đơn mới cho khách hàng: ${createInvoiceDto.customerName}`);
    return this.invoiceService.create(createInvoiceDto, user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query() query: InvoiceQueryDto, @CurrentUser() user: any) {
    this.logger.log(`🔍 GET /invoices - Lấy danh sách hoá đơn cho user: ${user.id}`);
    return this.invoiceService.findAll(query, user.id);
  }

  @Get('statistics')
  @UseGuards(JwtAuthGuard)
  getStatistics(@CurrentUser() user: any, @Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    this.logger.log(`📊 GET /invoices/statistics - Lấy thống kê hoá đơn cho user: ${user.id}`);
    return this.invoiceService.getStatistics(user.id, startDate, endDate);
  }

  @Get('payment-methods')
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  findByInvoiceNumber(@Param('invoiceNumber') invoiceNumber: string, @CurrentUser() user: any) {
    this.logger.log(`🔍 GET /invoices/number/${invoiceNumber} - Lấy hoá đơn theo số cho user: ${user.id}`);
    return this.invoiceService.findByInvoiceNumber(invoiceNumber, user.id);
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard)
  findPending(@CurrentUser() user: any) {
    this.logger.log(`⏳ GET /invoices/pending - Lấy danh sách hoá đơn chờ xử lý cho user: ${user.id}`);
    return this.invoiceService.findAll({ status: 'pending', page: 1, limit: 100 }, user.id);
  }

  @Get('confirmed')
  @UseGuards(JwtAuthGuard)
  findConfirmed(@CurrentUser() user: any) {
    this.logger.log(`✅ GET /invoices/confirmed - Lấy danh sách hoá đơn đã xác nhận cho user: ${user.id}`);
    return this.invoiceService.findAll({ status: 'confirmed', page: 1, limit: 100 }, user.id);
  }

  @Get('delivered')
  @UseGuards(JwtAuthGuard)
  findDelivered(@CurrentUser() user: any) {
    this.logger.log(`🚚 GET /invoices/delivered - Lấy danh sách hoá đơn đã giao cho user: ${user.id}`);
    return this.invoiceService.findAll({ status: 'delivered', page: 1, limit: 100 }, user.id);
  }

  @Get('unpaid')
  @UseGuards(JwtAuthGuard)
  findUnpaid(@CurrentUser() user: any) {
    this.logger.log(`💰 GET /invoices/unpaid - Lấy danh sách hoá đơn chưa thanh toán cho user: ${user.id}`);
    return this.invoiceService.findAll({ paymentStatus: 'unpaid', page: 1, limit: 100 }, user.id);
  }

  @Get('paid')
  @UseGuards(JwtAuthGuard)
  findPaid(@CurrentUser() user: any) {
    this.logger.log(`💳 GET /invoices/paid - Lấy danh sách hoá đơn đã thanh toán cho user: ${user.id}`);
    return this.invoiceService.findAll({ paymentStatus: 'paid', page: 1, limit: 100 }, user.id);
  }

  @Get('payment-method/:method')
  @UseGuards(JwtAuthGuard)
  findByPaymentMethod(@Param('method') method: string, @CurrentUser() user: any) {
    this.logger.log(`💳 GET /invoices/payment-method/${method} - Lấy danh sách hoá đơn theo phương thức thanh toán cho user: ${user.id}`);
    
    // Validate method parameter
    if (!Object.values(PaymentMethod).includes(method as PaymentMethod)) {
      throw new BadRequestException(`Phương thức thanh toán không hợp lệ: ${method}`);
    }
    
    return this.invoiceService.findAll({ paymentMethod: method as PaymentMethod, page: 1, limit: 100 }, user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    this.logger.log(`🔍 GET /invoices/${id} - Lấy thông tin hoá đơn theo ID cho user: ${user.id}`);
    return this.invoiceService.findOne(id, user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateInvoiceDto: UpdateInvoiceDto, @CurrentUser() user: any) {
    this.logger.log(`🔄 PATCH /invoices/${id} - Cập nhật hoá đơn cho user: ${user.id}`);
    return this.invoiceService.update(id, updateInvoiceDto, user.id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateInvoiceStatusDto,
    @CurrentUser() user: any
  ) {
    this.logger.log(`🔄 PATCH /invoices/${id}/status - Cập nhật trạng thái hoá đơn thành: ${updateStatusDto.status}`);
    return this.invoiceService.updateStatus(id, updateStatusDto, user.id);
  }

  @Patch(':id/payment-status')
  @UseGuards(JwtAuthGuard)
  updatePaymentStatus(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentStatusDto,
    @CurrentUser() user: any
  ) {
    this.logger.log(`💳 PATCH /invoices/${id}/payment-status - Cập nhật trạng thái thanh toán thành: ${updatePaymentDto.paymentStatus} cho user: ${user.id}`);
    return this.invoiceService.updatePaymentStatus(id, updatePaymentDto, user.id);
  }

  @Post(':id/payment')
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  debugInvoice(@Param('id') id: string, @CurrentUser() user: any) {
    this.logger.log(`🔍 GET /invoices/${id}/debug - Debug thông tin hoá đơn ${id} cho user: ${user.id}`);
    return this.invoiceService.findOne(id, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    this.logger.log(`🗑️ DELETE /invoices/${id} - Xóa hoá đơn cho user: ${user.id}`);
    return this.invoiceService.remove(id, user.id);
  }

  // API để in hoá đơn (trả về dữ liệu để frontend render)
  @Get(':id/print')
  @UseGuards(JwtAuthGuard)
  getInvoiceForPrint(@Param('id') id: string, @CurrentUser() user: any) {
    this.logger.log(`🖨️ GET /invoices/${id}/print - Lấy dữ liệu hoá đơn để in cho user: ${user.id}`);
    return this.invoiceService.findOne(id, user.id);
  }

  // API để gửi hoá đơn qua email (placeholder)
  @Post(':id/send-email')
  @UseGuards(JwtAuthGuard)
  sendInvoiceByEmail(@Param('id') id: string, @Body() emailData: { email: string }) {
    this.logger.log(`📧 POST /invoices/${id}/send-email - Gửi hoá đơn qua email: ${emailData.email}`);
    // TODO: Implement email sending functionality
    return { message: 'Chức năng gửi email sẽ được triển khai sau' };
  }

  // API để xuất hoá đơn ra PDF (placeholder)
  @Get(':id/export-pdf')
  @UseGuards(JwtAuthGuard)
  exportInvoiceToPDF(@Param('id') id: string) {
    this.logger.log(`📄 GET /invoices/${id}/export-pdf - Xuất hoá đơn ra PDF`);
    // TODO: Implement PDF export functionality
    return { message: 'Chức năng xuất PDF sẽ được triển khai sau' };
  }

  // API để cập nhật trạng thái giao hàng cho item
  @Patch(':id/items/:itemIndex/delivery')
  @UseGuards(JwtAuthGuard)
  updateItemDelivery(
    @Param('id') id: string,
    @Param('itemIndex') itemIndex: string,
    @Body() updateDeliveryDto: UpdateItemDeliveryDto,
    @CurrentUser() user: any
  ) {
    const itemIndexNum = parseInt(itemIndex);
    if (isNaN(itemIndexNum) || itemIndexNum < 0) {
      throw new BadRequestException('Chỉ số item không hợp lệ');
    }

    this.logger.log(`🚚 PATCH /invoices/${id}/items/${itemIndex}/delivery - Cập nhật giao hàng cho item ${itemIndex} bởi user: ${user.id}`);
    return this.invoiceService.updateItemDelivery(id, itemIndexNum, updateDeliveryDto, user.id);
  }

  // API để lấy thông tin trạng thái giao hàng của hoá đơn
  @Get(':id/delivery-status')
  @UseGuards(JwtAuthGuard)
  getDeliveryStatus(@Param('id') id: string, @CurrentUser() user: any) {
    this.logger.log(`📊 GET /invoices/${id}/delivery-status - Lấy thông tin trạng thái giao hàng cho user: ${user.id}`);
    return this.invoiceService.getDeliveryStatus(id, user.id);
  }

  // API để tính tổng tiền hàng hoá đã giao
  @Get(':id/delivered-amount')
  @UseGuards(JwtAuthGuard)
  getDeliveredAmount(@Param('id') id: string, @CurrentUser() user: any) {
    this.logger.log(`💰 GET /invoices/${id}/delivered-amount - Tính tổng tiền hàng hoá đã giao cho user: ${user.id}`);
    return this.invoiceService.getDeliveredAmount(id, user.id);
  }
}
