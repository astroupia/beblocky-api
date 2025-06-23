import { Types } from 'mongoose';
import { ICreateUserDto, IUpdateUserDto } from '../user';

export enum OrganizationType {
  SCHOOL = 'school',
  UNIVERSITY = 'university',
  TRAINING_CENTER = 'training_center',
  OTHER = 'other',
}

export interface IAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface IContactInfo {
  phone: string;
  website?: string;
  email: string;
}

export interface IFeatures {
  hasStudentTracking?: boolean;
  hasProgressTracking?: boolean;
  hasLeaderboard?: boolean;
}

export interface IAcademicYear {
  startDate: Date;
  endDate: Date;
}

export interface ISettings {
  timezone?: string;
  language?: string;
  academicYear?: IAcademicYear;
}

export interface IOrganization {
  name: string;
  type: OrganizationType;
  address: IAddress;
  contactInfo: IContactInfo;
  teachers: Types.ObjectId[];
  students: Types.ObjectId[];
  courses: Types.ObjectId[];
  subscription: Types.ObjectId;
  paymentHistory: Types.ObjectId[];
  features: IFeatures;
  settings: ISettings;
  isVerified: boolean;
  businessLicenseNumber?: string;
  accreditation?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateOrganizationDto extends ICreateUserDto {
  type: OrganizationType;
  address: IAddress;
  contactInfo?: IContactInfo;
  features?: IFeatures;
  settings?: ISettings;
  businessLicenseNumber?: string;
  accreditation?: string[];
}

export type IUpdateOrganizationDto = Partial<ICreateOrganizationDto> &
  Partial<IUpdateUserDto>;
