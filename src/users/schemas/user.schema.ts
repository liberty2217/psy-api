import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  @IsEmail()
  email: string;

  @Prop({ required: true })
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @Prop({ required: true })
  @IsNotEmpty()
  name: string;

  @Prop({ default: false })
  isEmailConfirmed: boolean;

  @Prop({ default: null })
  confirmationToken: string | null;
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);
