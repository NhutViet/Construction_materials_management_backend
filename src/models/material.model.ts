import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MaterialDocument = Material & Document;

@Schema({ timestamps: true })
export class Material {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId; // ID của user sở hữu vật liệu này

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  unit: string;

  @Prop({ required: true, min: 0 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop()
  description?: string;

  @Prop()
  supplier?: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const MaterialSchema = SchemaFactory.createForClass(Material);

// Indexes để tối ưu query
MaterialSchema.index({ userId: 1 });
MaterialSchema.index({ userId: 1, category: 1 });
MaterialSchema.index({ userId: 1, isActive: 1 });
