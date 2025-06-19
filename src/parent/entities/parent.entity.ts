import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Domain entity
export class Parent {
  children: Types.ObjectId[];
  relationship: RelationshipType;
  phoneNumber: string;
  address: {
    subCity: string;
    city: string;
    country: string;
  };
  subscription: Types.ObjectId;
  paymentHistory: Types.ObjectId[];
}

export enum RelationshipType {
  MOTHER = 'mother',
  FATHER = 'father',
  GUARDIAN = 'guardian',
  OTHER = 'other',
}

// Mongoose schema class
@Schema({ timestamps: true, collection: 'parents' })
export class ParentSchemaClass {
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Student' }] })
  children: Types.ObjectId[];

  @Prop({
    type: String,
    enum: Object.values(RelationshipType),
    required: true,
  })
  relationship: RelationshipType;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({
    type: {
      subCity: String,
      city: String,
      country: String,
    },
    required: true,
  })
  address: {
    subCity: string;
    city: string;
    country: string;
  };

  @Prop({ type: Types.ObjectId, ref: 'Subscription' })
  subscription: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Payment' }] })
  paymentHistory: Types.ObjectId[];
}

export const ParentSchema = SchemaFactory.createForClass(ParentSchemaClass);
export type ParentDocument = ParentSchemaClass & Document;
