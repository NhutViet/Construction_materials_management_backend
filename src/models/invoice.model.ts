import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PaymentMethod } from '../constants/payment.constants';

export interface DeliveryRecord {
  quantity: number; // Số lượng giao trong lần này
  unitPrice: number; // Giá tại thời điểm giao hàng
  totalAmount: number; // Tổng tiền cho lần giao này
  deliveredAt: Date; // Thời gian giao hàng
  deliveredBy: Types.ObjectId; // Người thực hiện giao hàng
  notes?: string; // Ghi chú cho lần giao hàng
}

export interface InvoiceItem {
  materialId: Types.ObjectId;
  materialName: string;
  quantity: number;
  unitPrice: number; // Giá hiện tại (có thể đã được điều chỉnh)
  totalPrice: number; // Tổng tiền hiện tại (có thể đã được điều chỉnh)
  unit: string; // đơn vị: kg, m3, m2, cái, v.v.
  deliveredQuantity?: number; // Số lượng đã giao (tổng cộng)
  deliveryStatus?: 'pending' | 'partial' | 'delivered'; // Trạng thái giao hàng của item
  deliveredAt?: Date; // Thời gian giao hàng lần cuối
  deliveredBy?: Types.ObjectId; // Người thực hiện giao hàng lần cuối
  deliveryHistory?: DeliveryRecord[]; // Lịch sử chi tiết các lần giao hàng
  
  // Các trường theo dõi giá ban đầu và giá đã điều chỉnh
  originalUnitPrice?: number; // Giá ban đầu khi tạo hóa đơn
  originalTotalPrice?: number; // Tổng tiền ban đầu khi tạo hóa đơn
  adjustedUnitPrice?: number; // Giá đã điều chỉnh
  adjustedTotalPrice?: number; // Tổng tiền đã điều chỉnh
  priceAdjustmentAmount?: number; // Số tiền điều chỉnh (có thể âm nếu giảm giá)
  priceAdjustmentReason?: string; // Lý do điều chỉnh giá
  priceAdjustedAt?: Date; // Thời gian điều chỉnh giá
  priceAdjustedBy?: Types.ObjectId; // Người điều chỉnh giá
}

@Schema({ timestamps: true })
export class Invoice extends Document {
  @Prop({ required: true, unique: true })
  invoiceNumber: string; // Số hoá đơn

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  customerId: Types.ObjectId; // ID khách hàng

  @Prop({ required: true })
  customerName: string; // Tên khách hàng

  @Prop()
  customerPhone: string; // Số điện thoại khách hàng

  @Prop()
  customerAddress: string; // Địa chỉ khách hàng

  @Prop({ required: true, type: [Object] })
  items: InvoiceItem[]; // Danh sách vật liệu

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

  @Prop({ default: 'pending' })
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'; // Trạng thái hoá đơn

  @Prop({ default: PaymentMethod.CASH, enum: PaymentMethod })
  paymentMethod: PaymentMethod; // Phương thức thanh toán: tiền mặt, thanh toán online, nợ

  @Prop({ default: 'unpaid' })
  paymentStatus: 'unpaid' | 'partial' | 'paid'; // Trạng thái thanh toán

  @Prop({ default: 0 })
  paidAmount: number; // Số tiền đã trả

  @Prop({ default: 0 })
  remainingAmount: number; // Số tiền còn lại (totalAmount - paidAmount)

  @Prop()
  notes: string; // Ghi chú

  @Prop()
  deliveryDate: Date; // Ngày giao hàng

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId; // Người tạo hoá đơn

  @Prop({ type: Types.ObjectId, ref: 'User' })
  approvedBy: Types.ObjectId; // Người duyệt hoá đơn

  @Prop()
  approvedAt: Date; // Thời gian duyệt

  @Prop({ default: false })
  isDeleted: boolean; // Đánh dấu xóa mềm

  // Các trường theo dõi giá ban đầu và giá đã điều chỉnh cho toàn bộ hóa đơn
  @Prop()
  originalTotalAmount?: number; // Tổng tiền ban đầu khi tạo hóa đơn

  @Prop()
  adjustedTotalAmount?: number; // Tổng tiền đã điều chỉnh

  @Prop()
  totalPriceAdjustmentAmount?: number; // Tổng số tiền điều chỉnh (có thể âm nếu giảm giá)

  @Prop()
  priceAdjustmentReason?: string; // Lý do điều chỉnh giá

  @Prop()
  priceAdjustedAt?: Date; // Thời gian điều chỉnh giá

  @Prop({ type: Types.ObjectId, ref: 'User' })
  priceAdjustedBy?: Types.ObjectId; // Người điều chỉnh giá
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);

// Indexes
InvoiceSchema.index({ invoiceNumber: 1 });
InvoiceSchema.index({ customerId: 1 });
InvoiceSchema.index({ status: 1 });
InvoiceSchema.index({ createdAt: -1 });
InvoiceSchema.index({ isDeleted: 1 });
