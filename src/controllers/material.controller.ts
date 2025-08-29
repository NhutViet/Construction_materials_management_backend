import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { MaterialService } from '../services/material.service';
import { Material } from '../models/material.model';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';

@Controller('materials')
@UseGuards(JwtAuthGuard)
export class MaterialController {
  private readonly logger = new Logger(MaterialController.name);

  constructor(private readonly materialService: MaterialService) {}

  @Post()
  create(@Body() createMaterialDto: Partial<Material>, @CurrentUser() user: any) {
    this.logger.log(`📝 POST /materials - Tạo vật liệu mới: ${createMaterialDto.name} cho user: ${user.id}`);
    return this.materialService.create(createMaterialDto, user.id);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    this.logger.log(`🔍 GET /materials - Lấy danh sách vật liệu cho user: ${user.id}`);
    return this.materialService.findAll(user.id);
  }

  @Get('low-stock')
  findLowStock(@CurrentUser() user: any) {
    this.logger.log(`⚠️ GET /materials/low-stock - Lấy danh sách vật liệu sắp hết cho user: ${user.id}`);
    return this.materialService.findLowStock(10, user.id);
  }

  @Get('category/:category')
  findByCategory(@Param('category') category: string, @CurrentUser() user: any) {
    this.logger.log(`🔍 GET /materials/category/${category} - Lấy vật liệu theo danh mục cho user: ${user.id}`);
    return this.materialService.findByCategory(category, user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    this.logger.log(`🔍 GET /materials/${id} - Lấy thông tin vật liệu theo ID cho user: ${user.id}`);
    return this.materialService.findOne(id, user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMaterialDto: Partial<Material>, @CurrentUser() user: any) {
    this.logger.log(`🔄 PATCH /materials/${id} - Cập nhật vật liệu cho user: ${user.id}`);
    return this.materialService.update(id, updateMaterialDto, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    this.logger.log(`🗑️ DELETE /materials/${id} - Xóa vật liệu cho user: ${user.id}`);
    return this.materialService.remove(id, user.id);
  }
}
