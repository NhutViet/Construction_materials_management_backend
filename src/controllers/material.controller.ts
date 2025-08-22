import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
} from '@nestjs/common';
import { MaterialService } from '../services/material.service';
import { Material } from '../models/material.model';

@Controller('materials')
export class MaterialController {
  private readonly logger = new Logger(MaterialController.name);

  constructor(private readonly materialService: MaterialService) {}

  @Post()
  create(@Body() createMaterialDto: Partial<Material>) {
    this.logger.log(`📝 POST /materials - Tạo vật liệu mới: ${createMaterialDto.name}`);
    return this.materialService.create(createMaterialDto);
  }

  @Get()
  findAll() {
    this.logger.log('🔍 GET /materials - Lấy danh sách tất cả vật liệu');
    return this.materialService.findAll();
  }

  @Get('low-stock')
  findLowStock() {
    this.logger.log('⚠️ GET /materials/low-stock - Lấy danh sách vật liệu sắp hết');
    return this.materialService.findLowStock();
  }

  @Get('category/:category')
  findByCategory(@Param('category') category: string) {
    this.logger.log(`🔍 GET /materials/category/${category} - Lấy vật liệu theo danh mục`);
    return this.materialService.findByCategory(category);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    this.logger.log(`🔍 GET /materials/${id} - Lấy thông tin vật liệu theo ID`);
    return this.materialService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMaterialDto: Partial<Material>) {
    this.logger.log(`🔄 PATCH /materials/${id} - Cập nhật vật liệu`);
    return this.materialService.update(id, updateMaterialDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    this.logger.log(`🗑️ DELETE /materials/${id} - Xóa vật liệu`);
    return this.materialService.remove(id);
  }
}
