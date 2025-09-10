import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export interface StockInItem {
  materialId: Types.ObjectId;
  materialName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unit: string;
  supplier?: string;
}

@Schema({ timestamps: true })
export class StockIn {
  @Prop({ required: true, unique: true })
  stockInNumber: string; // Số phiếu nhập hàng

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId; // ID của user sở hữu

  @Prop({ required: true, type: [Object] })
  items: StockInItem[]; // Danh sách vật liệu nhập

  @Prop({ required: true })
  subtotal: number; // Tổng tiền hàng

  @Prop({ default: 0 })
  taxRate: number; // Thuế suất (%)

  @Prop({ default: 0 })
  taxAmount: number; // Số tiền thuế

  @Prop({ default: 0 })
  discountRate: number; // Tỷ lệ chiết khấu (%)

  @Prop({ default: 0 })
  discountAmount: number; // Số tiền chiết khấu

  @Prop({ required: true })
  totalAmount: number; // Tổng tiền thanh toán

  @Prop({ 
    default: 'unpaid', 
    enum: ['unpaid', 'partial', 'paid'],
    required: true 
  })
  paymentStatus: 'unpaid' | 'partial' | 'paid'; // Trạng thái thanh toán

  @Prop({ default: 0 })
  paidAmount: number; // Số tiền đã trả

  @Prop({ default: 0 })
  remainingAmount: number; // Số tiền còn lại

  @Prop({ default: 'pending' })
  status: 'pending' | 'approved' | 'rejected'; // Trạng thái phiếu nhập

  @Prop()
  supplier: string; // Nhà cung cấp

  @Prop()
  supplierPhone: string; // Số điện thoại nhà cung cấp

  @Prop()
  supplierAddress: string; // Địa chỉ nhà cung cấp

  @Prop()
  notes: string; // Ghi chú

  @Prop()
  receivedDate: Date; // Ngày nhận hàng

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId; // Người tạo phiếu nhập

  @Prop({ type: Types.ObjectId, ref: 'User' })
  approvedBy: Types.ObjectId; // Người duyệt phiếu nhập

  @Prop()
  approvedAt: Date; // Thời gian duyệt

  @Prop({ default: false })
  isDeleted: boolean; // Đánh dấu xóa mềm
}

export const StockInSchema = SchemaFactory.createForClass(StockIn);
export type StockInDocument = StockIn & Document;

// Indexes
StockInSchema.index({ stockInNumber: 1 });
StockInSchema.index({ userId: 1 });
StockInSchema.index({ status: 1 });
StockInSchema.index({ paymentStatus: 1 });
StockInSchema.index({ createdAt: -1 });
StockInSchema.index({ isDeleted: 1 });
