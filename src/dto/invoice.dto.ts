import { IsString, IsNumber, IsArray, IsOptional, IsEnum, IsDateString, IsMongoId, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod, PAYMENT_METHOD_VALUES } from '../constants/payment.constants';

export class InvoiceItemDto {
  @IsMongoId()
  materialId: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  // Các trường này sẽ được lấy tự động từ database
  @IsOptional()
  @IsString()
  materialName?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  unitPrice?: number;

  @IsOptional()
  @IsString()
  unit?: string;
}

// DTO đơn giản hơn cho việc tạo hoá đơn
export class CreateInvoiceItemDto {
  @IsMongoId()
  materialId: string;

  @IsNumber()
  @Min(0)
  quantity: number;
}

export class CreateInvoiceDto {
  @IsString()
  customerName: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;

  @IsOptional()
  @IsString()
  customerAddress?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items: CreateInvoiceItemDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  taxRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountRate?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  deliveryDate?: string;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsEnum(['unpaid', 'partial', 'paid'])
  paymentStatus?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  paidAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  remainingAmount?: number;
}

export class UpdateInvoiceDto {
  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;

  @IsOptional()
  @IsString()
  customerAddress?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items?: InvoiceItemDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  taxRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountRate?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  deliveryDate?: string;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsEnum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'])
  status?: string;

  @IsOptional()
  @IsEnum(['unpaid', 'partial', 'paid'])
  paymentStatus?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  paidAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  remainingAmount?: number;
}

export class UpdateInvoiceStatusDto {
  @IsEnum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'])
  status: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdatePaymentStatusDto {
  @IsEnum(['unpaid', 'partial', 'paid'])
  paymentStatus: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  paidAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  remainingAmount?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class PaymentDto {
  @IsNumber()
  @Min(0)
  amount: number; // Số tiền thanh toán

  @IsOptional()
  @IsString()
  notes?: string; // Ghi chú thanh toán

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod; // Phương thức thanh toán (nếu khác với hoá đơn gốc)
}

export class InvoiceQueryDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  paymentStatus?: string;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsString()
  invoiceNumber?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}
