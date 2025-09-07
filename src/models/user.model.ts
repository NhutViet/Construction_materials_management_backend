import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  fullname: string;

  @Prop({ required: false })
  phoneNumber?: string;

  @Prop({ required: false })
  bankNumber?: string;

  @Prop({ required: false })
  bankName?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
