import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { StockInService } from '../services/stock-in.service';
import {
  CreateStockInDto,
  UpdateStockInDto,
  UpdatePaymentStatusDto,
  UpdateStockInStatusDto,
  StockInQueryDto,
} from '../dto/stock-in.dto';

@Controller('stock-in')
@UseGuards(JwtAuthGuard)
export class StockInController {
  constructor(private readonly stockInService: StockInService) {}

  // Tạo phiếu nhập hàng mới
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createStockIn(
    @Body() createStockInDto: CreateStockInDto,
    @Request() req: any,
  ) {
    const userId = req.user.userId;
    return await this.stockInService.createStockIn(createStockInDto, userId);
  }

  // Lấy danh sách phiếu nhập hàng
  @Get()
  async getStockIns(
    @Query() query: StockInQueryDto,
    @Request() req: any,
  ) {
    const userId = req.user.userId;
    return await this.stockInService.getStockIns(query, userId);
  }

  // Lấy danh sách vật liệu để chọn khi tạo phiếu nhập
  @Get('materials')
  async getMaterialsForSelection(@Request() req: any) {
    const userId = req.user.userId;
    return await this.stockInService.getMaterialsForSelection(userId);
  }

  // Lấy thống kê phiếu nhập hàng
  @Get('stats')
  async getStockInStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Request() req?: any,
  ) {
    const userId = req.user.userId;
    return await this.stockInService.getStockInStats(userId, startDate, endDate);
  }

  // Lấy chi tiết phiếu nhập hàng
  @Get(':id')
  async getStockInById(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    const userId = req.user.userId;
    return await this.stockInService.getStockInById(id, userId);
  }

  // Cập nhật phiếu nhập hàng
  @Put(':id')
  async updateStockIn(
    @Param('id') id: string,
    @Body() updateStockInDto: UpdateStockInDto,
    @Request() req: any,
  ) {
    const userId = req.user.userId;
    return await this.stockInService.updateStockIn(id, updateStockInDto, userId);
  }

  // Cập nhật trạng thái thanh toán
  @Put(':id/payment-status')
  async updatePaymentStatus(
    @Param('id') id: string,
    @Body() updatePaymentStatusDto: UpdatePaymentStatusDto,
    @Request() req: any,
  ) {
    const userId = req.user.userId;
    return await this.stockInService.updatePaymentStatus(id, updatePaymentStatusDto, userId);
  }

  // Cập nhật trạng thái phiếu nhập
  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStockInStatusDto,
    @Request() req: any,
  ) {
    const userId = req.user.userId;
    return await this.stockInService.updateStatus(id, updateStatusDto, userId);
  }

  // Xóa phiếu nhập hàng
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteStockIn(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    const userId = req.user.userId;
    await this.stockInService.deleteStockIn(id, userId);
  }
}
