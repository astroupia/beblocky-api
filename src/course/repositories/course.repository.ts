import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course, CourseDocument } from '../entities/course.entity';
import { CreateCourseDto } from '../dtos/create-course.dto';
import { createObjectId } from '../../utils/object-id.utils';

@Injectable()
export class CourseRepository {
  constructor(
    @InjectModel('Course')
    private readonly courseModel: Model<CourseDocument>,
  ) {}

  private convertToObjectId(id: string | Types.ObjectId): Types.ObjectId {
    return typeof id === 'string' ? createObjectId(id, 'id') : id;
  }

  private convertArrayToObjectIds(
    ids: (string | Types.ObjectId)[] = [],
  ): Types.ObjectId[] {
    return ids.map((id) => this.convertToObjectId(id));
  }

  async create(createCourseDto: CreateCourseDto): Promise<CourseDocument> {
    const course = new this.courseModel({
      courseTitle: createCourseDto.courseTitle,
      courseDescription: createCourseDto.courseDescription,
      courseLanguage: createCourseDto.courseLanguage,
      lessons: this.convertArrayToObjectIds(createCourseDto.lessonIds),
      slides: this.convertArrayToObjectIds(createCourseDto.slideIds),
      organization: this.convertArrayToObjectIds(createCourseDto.organization),
      subType: createCourseDto.subType,
      status: createCourseDto.status,
      rating: createCourseDto.rating,
      language: createCourseDto.language,
    });
    return await course.save();
  }

  async findById(id: string): Promise<CourseDocument> {
    const objectId = this.convertToObjectId(id);
    const course = await this.courseModel
      .findById(objectId)
      .populate('lessons')
      .populate('slides')
      .exec();

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return course;
  }

  async update(
    id: string,
    updateData: Partial<Course>,
  ): Promise<CourseDocument> {
    const dataToUpdate = { ...updateData };

    // Convert ID fields if they exist in the update data
    if (updateData.lessons) {
      dataToUpdate.lessons = this.convertArrayToObjectIds(updateData.lessons);
    }
    if (updateData.slides) {
      dataToUpdate.slides = this.convertArrayToObjectIds(updateData.slides);
    }
    if (updateData.students) {
      dataToUpdate.students = this.convertArrayToObjectIds(updateData.students);
    }
    if (updateData.school) {
      dataToUpdate.school = this.convertToObjectId(updateData.school);
    }

    const course = await this.courseModel
      .findByIdAndUpdate(id, dataToUpdate, { new: true })
      .exec();

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return course;
  }

  async delete(id: string): Promise<CourseDocument> {
    const course = await this.courseModel.findByIdAndDelete(id).exec();

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return course;
  }

  async findAll(): Promise<CourseDocument[]> {
    return this.courseModel
      .find()
      .populate('lessons')
      .populate('slides')
      .exec();
  }

  async findByIdAndUpdate(
    id: string,
    updateData: Partial<Course>,
  ): Promise<CourseDocument> {
    const course = await this.courseModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return course;
  }

  async findByIdAndDelete(id: string): Promise<CourseDocument> {
    const course = await this.courseModel.findByIdAndDelete(id).exec();
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return course;
  }

  /**
   * Add a student to a course's students array
   */
  async addStudent(
    courseId: string,
    studentId: string,
  ): Promise<CourseDocument> {
    const course = await this.courseModel.findById(courseId).exec();
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    const studentObjectId = this.convertToObjectId(studentId);

    // Check if student is already in the course
    if (
      course.students &&
      course.students.some((id) => id.equals(studentObjectId))
    ) {
      // Student already exists, return the course as is
      return course;
    }

    // Add student to the course
    const updatedCourse = await this.courseModel
      .findByIdAndUpdate(
        courseId,
        { $addToSet: { students: studentObjectId } },
        { new: true },
      )
      .exec();

    if (!updatedCourse) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    return updatedCourse;
  }
}
