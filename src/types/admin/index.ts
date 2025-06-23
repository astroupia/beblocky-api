import { Types } from 'mongoose';
import { ICreateUserDto, IUpdateUserDto } from '../user';

export enum AdminAccessLevel {
  SUPERADMIN = 'superadmin',
  MODERATOR = 'moderator',
}

export interface IAdmin {
  userId: Types.ObjectId;
  accessLevel: AdminAccessLevel;
  managedOrganizations: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateAdminDto extends ICreateUserDto {
  accessLevel?: AdminAccessLevel;
  managedOrganizations?: Types.ObjectId[];
}

export type IUpdateAdminDto = Partial<IUpdateUserDto> & {
  accessLevel?: AdminAccessLevel;
  managedOrganizations?: Types.ObjectId[];
};
