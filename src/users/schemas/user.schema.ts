import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema()
export class User {
  @ApiProperty()
  @Prop({ required: true, unique: true })
  @IsEmail()
  email: string;

  @ApiProperty()
  @Prop({ required: true })
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty()
  @Prop({ required: true, unique: true })
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @Prop({ default: false })
  isEmailConfirmed: boolean;

  @ApiProperty()
  @Prop({ default: null })
  confirmationToken: string | null;
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);
