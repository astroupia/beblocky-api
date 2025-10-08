import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CodeAnalysis,
  CodeAnalysisDocument,
} from '../entities/code-analysis.entity';
import { createObjectId } from '../../utils/object-id.utils';

@Injectable()
export class CodeAnalysisRepository {
  constructor(
    @InjectModel('CodeAnalysis')
    private readonly codeAnalysisModel: Model<CodeAnalysisDocument>,
  ) {}

  async create(data: Partial<CodeAnalysis>): Promise<CodeAnalysisDocument> {
    const analysis = new this.codeAnalysisModel(data);
    return analysis.save();
  }

  async findById(id: string): Promise<CodeAnalysisDocument> {
    const analysis = await this.codeAnalysisModel
      .findById(id)
      .populate('progressId', 'studentId courseId')
      .populate('lessonId', 'title description')
      .populate('studentId', 'firstName lastName')
      .populate('courseId', 'courseTitle courseLanguage')
      .exec();

    if (!analysis) {
      throw new NotFoundException(`Code Analysis with ID ${id} not found`);
    }

    return analysis;
  }

  async findByProgressId(progressId: string): Promise<CodeAnalysisDocument[]> {
    return this.codeAnalysisModel
      .find({ progressId: createObjectId(progressId, 'progressId') })
      .populate('lessonId', 'title description')
      .populate('studentId', 'firstName lastName')
      .sort({ analysisDate: -1 })
      .exec();
  }

  async findByLessonId(lessonId: string): Promise<CodeAnalysisDocument[]> {
    return this.codeAnalysisModel
      .find({ lessonId: createObjectId(lessonId, 'lessonId') })
      .populate('progressId', 'studentId courseId')
      .populate('studentId', 'firstName lastName')
      .populate('courseId', 'courseTitle courseLanguage')
      .sort({ analysisDate: -1 })
      .exec();
  }

  async findByStudentId(studentId: string): Promise<CodeAnalysisDocument[]> {
    return this.codeAnalysisModel
      .find({ studentId: createObjectId(studentId, 'studentId') })
      .populate('progressId', 'courseId')
      .populate('lessonId', 'title description')
      .populate('courseId', 'courseTitle courseLanguage')
      .sort({ analysisDate: -1 })
      .exec();
  }

  async findByProgressAndLesson(
    progressId: string,
    lessonId: string,
  ): Promise<CodeAnalysisDocument[]> {
    return this.codeAnalysisModel
      .find({
        progressId: createObjectId(progressId, 'progressId'),
        lessonId: createObjectId(lessonId, 'lessonId'),
      })
      .populate('studentId', 'firstName lastName')
      .populate('courseId', 'courseTitle courseLanguage')
      .sort({ analysisDate: -1 })
      .exec();
  }

  async findAll(): Promise<CodeAnalysisDocument[]> {
    return this.codeAnalysisModel
      .find()
      .populate('progressId', 'studentId courseId')
      .populate('lessonId', 'title description')
      .populate('studentId', 'firstName lastName')
      .populate('courseId', 'courseTitle courseLanguage')
      .sort({ analysisDate: -1 })
      .exec();
  }

  async delete(id: string): Promise<void> {
    const result = await this.codeAnalysisModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Code Analysis with ID ${id} not found`);
    }
  }

  async save(analysis: CodeAnalysisDocument): Promise<CodeAnalysisDocument> {
    return analysis.save();
  }

  async findByCourseId(courseId: string): Promise<CodeAnalysisDocument[]> {
    return this.codeAnalysisModel
      .find({ courseId: createObjectId(courseId, 'courseId') })
      .populate('progressId', 'studentId')
      .populate('lessonId', 'title description')
      .populate('studentId', 'firstName lastName')
      .sort({ analysisDate: -1 })
      .exec();
  }

  async getRecentAnalyses(limit: number = 10): Promise<CodeAnalysisDocument[]> {
    return this.codeAnalysisModel
      .find()
      .populate('progressId', 'studentId courseId')
      .populate('lessonId', 'title description')
      .populate('studentId', 'firstName lastName')
      .populate('courseId', 'courseTitle courseLanguage')
      .sort({ analysisDate: -1 })
      .limit(limit)
      .exec();
  }
}
