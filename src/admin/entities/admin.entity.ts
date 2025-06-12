import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum AdminAccessLevel {
  SUPERADMIN = 'superadmin',
  MODERATOR = 'moderator',
}

// Domain entity
export class Admin {
  accessLevel: AdminAccessLevel;
  managedOrganizations: Types.ObjectId[];
}

// Mongoose schema class
@Schema({ timestamps: true })
export class AdminSchemaClass {
  @Prop({
    type: String,
    enum: Object.values(AdminAccessLevel),
    default: AdminAccessLevel.MODERATOR,
  })
  accessLevel: AdminAccessLevel;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Organization' }] })
  managedOrganizations: Types.ObjectId[];
}

export const AdminSchema = SchemaFactory.createForClass(AdminSchemaClass);
export type AdminDocument = AdminSchemaClass & Document;
