import { Types } from 'mongoose';
import { RelationshipType } from '../../parent/entities/parent.entity';

export interface IParent {
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
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateParentDto {
  children?: Types.ObjectId[];
  relationship: RelationshipType;
  phoneNumber: string;
  address: {
    subCity: string;
    city: string;
    country: string;
  };
}

export interface IUpdateParentDto
  extends Partial<Omit<ICreateParentDto, 'relationship'>> {
  subscription?: Types.ObjectId;
  paymentHistory?: Types.ObjectId[];
}

export interface IAddChildDto {
  childId: Types.ObjectId;
}

export interface IRemoveChildDto {
  childId: Types.ObjectId;
}

export interface IAddPaymentDto {
  paymentId: Types.ObjectId;
}

export interface IUpdateSubscriptionDto {
  subscriptionId: Types.ObjectId;
}
