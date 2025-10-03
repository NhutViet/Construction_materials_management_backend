import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';


export class CreateMaterialDto {
  @IsString()
  name: string;

  @IsString()
  category: string;

  @IsString()
  unit: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  importCost: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  supplier?: string;
}

export class UpdateMaterialDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.01, { message: 'Giá sản phẩm phải lớn hơn 0' })
  price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  importCost?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  supplier?: string;

  // Thêm các trường cho việc cập nhật giá
  @IsOptional()
  @IsString()
  priceUpdateReason?: string; // Lý do thay đổi giá

  @IsOptional()
  @IsBoolean()
  updateAffectedInvoices?: boolean; // Có cập nhật hóa đơn bị ảnh hưởng không (mặc định true)
}
