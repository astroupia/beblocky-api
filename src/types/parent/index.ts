import { Types } from 'mongoose';
import { ICreateUserDto, IUpdateUserDto } from '../user';

export enum RelationshipType {
  MOTHER = 'mother',
  FATHER = 'father',
  GUARDIAN = 'guardian',
  OTHER = 'other',
}

export interface IAddress {
  subCity: string;
  city: string;
  country: string;
}

export interface IParent {
  userId: Types.ObjectId;
  children: Types.ObjectId[];
  relationship: RelationshipType;
  phoneNumber: string;
  address: IAddress;
  subscription: Types.ObjectId;
  paymentHistory: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateParentDto extends ICreateUserDto {
  children?: Types.ObjectId[];
  relationship: RelationshipType;
  phoneNumber: string;
  address: IAddress;
}

export type IUpdateParentDto = Partial<ICreateParentDto> &
  Partial<IUpdateUserDto>;

export interface IAddChildDto {
  childId: Types.ObjectId;
}

export interface IRemoveChildDto {
  childId: Types.ObjectId;
}
