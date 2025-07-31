import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum UserRole {
  TEACHER = 'teacher',
  ADMIN = 'admin',
  STUDENT = 'student',
  PARENT = 'parent',
  ORGANIZATION = 'organization',
}

// Domain entity interface
export interface User {
  _id: string; // String ID from better-auth
  email: string;
  name: string;
  emailVerified: boolean;
  image?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose schema class
@Schema({
  timestamps: true,
  discriminatorKey: 'role',
  collection: 'users',
  _id: false, // Disable automatic ObjectId generation
})
export class UserSchemaClass implements User {
  @Prop({ type: String, required: true })
  _id: string; // Explicit string ID

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  name: string;

  @Prop({ default: false })
  emailVerified: boolean;

  @Prop()
  image?: string;

  @Prop({
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.STUDENT,
  })
  role: UserRole;

  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(UserSchemaClass);
export type UserDocument = UserSchemaClass & Document;
