import { Types } from 'mongoose';
import { ThemeColorsDto } from '../../shared/dtos/theme-colors.dto';

export interface ISlide {
  title: string;
  content?: string;
  course: Types.ObjectId;
  lesson?: Types.ObjectId;
  order: number;
  titleFont: string;
  startingCode?: string;
  solutionCode?: string;
  imageUrls: string[];
  backgroundColor: string;
  textColor: string;
  themeColors: {
    main: string;
    secondary: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateSlideDto {
  title: string;
  content?: string;
  order: number;
  courseId: Types.ObjectId;
  lessonId: Types.ObjectId;
  titleFont?: string;
  contentFont?: string;
  startingCode?: string;
  solutionCode?: string;
  imageUrls?: string[];
  backgroundColor?: string;
  textColor?: string;
  themeColors?: ThemeColorsDto;
  imageUrl?: string;
  videoUrl?: string;
}

export type IUpdateSlideDto = Partial<
  Omit<ICreateSlideDto, 'courseId' | 'lessonId'>
>;

export interface IReorderSlidesDto {
  slideIds: Types.ObjectId[];
}

export interface IAddMediaDto {
  mediaUrl: string;
  type: 'image' | 'video';
}
