import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApiResponse } from '../types/api-response.interface';
import { CreateLabTestTypeDto } from './dto/create-lab-test-type.dto';
import { UpdateLabTestTypeDto } from './dto/update-lab-test-type.dto';
import { CreateLabTestTypeQuestionDto } from './dto/create-lab-test-type-question.dto';
import { UpdateLabTestTypeQuestionDto } from './dto/update-lab-test-type-question.dto';

@Injectable()
export class LabTestTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateLabTestTypeDto): Promise<ApiResponse> {
    const labTestType = await this.prisma.labTestType.create({
      data: {
        name: dto.name.trim(),
        description: dto.description?.trim() || null,
      },
    });
    return { ok: true, message: 'Lab test type created', data: labTestType };
  }

  async findAll(): Promise<ApiResponse> {
    const types = await this.prisma.labTestType.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
      include: {
        questions: {
          where: { deletedAt: null },
          orderBy: { order: 'asc' },
        },
      },
    });
    return { ok: true, data: types };
  }

  async findOne(id: string): Promise<ApiResponse> {
    const type = await this.prisma.labTestType.findFirst({
      where: { id, deletedAt: null },
      include: {
        questions: {
          where: { deletedAt: null },
          orderBy: { order: 'asc' },
        },
      },
    });
    if (!type) {
      throw new NotFoundException('Lab test type not found');
    }
    return { ok: true, data: type };
  }

  async update(id: string, dto: UpdateLabTestTypeDto): Promise<ApiResponse> {
    await this.findOne(id);
    const type = await this.prisma.labTestType.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name.trim() }),
        ...(dto.description !== undefined && { description: dto.description?.trim() || null }),
      },
    });
    return { ok: true, message: 'Lab test type updated', data: type };
  }

  async remove(id: string): Promise<ApiResponse> {
    await this.findOne(id);
    await this.prisma.labTestType.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { ok: true, message: 'Lab test type deleted' };
  }

  async addQuestion(labTestTypeId: string, dto: CreateLabTestTypeQuestionDto): Promise<ApiResponse> {
    await this.findOne(labTestTypeId);
    const maxOrder = await this.prisma.labTestTypeQuestion
      .aggregate({
        where: { labTestTypeId, deletedAt: null },
        _max: { order: true },
      })
      .then((r) => (r._max.order ?? -1) + 1);
    const question = await this.prisma.labTestTypeQuestion.create({
      data: {
        labTestTypeId,
        label: dto.label.trim(),
        type: dto.type,
        options: dto.options ?? undefined,
        order: maxOrder,
      },
    });
    return { ok: true, message: 'Question added', data: question };
  }

  async updateQuestion(
    labTestTypeId: string,
    questionId: string,
    dto: UpdateLabTestTypeQuestionDto,
  ): Promise<ApiResponse> {
    const question = await this.prisma.labTestTypeQuestion.findFirst({
      where: { id: questionId, labTestTypeId, deletedAt: null },
    });
    if (!question) {
      throw new NotFoundException('Question not found');
    }
    const updated = await this.prisma.labTestTypeQuestion.update({
      where: { id: questionId },
      data: {
        ...(dto.label !== undefined && { label: dto.label.trim() }),
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.options !== undefined && { options: dto.options }),
      },
    });
    return { ok: true, message: 'Question updated', data: updated };
  }

  async removeQuestion(labTestTypeId: string, questionId: string): Promise<ApiResponse> {
    const question = await this.prisma.labTestTypeQuestion.findFirst({
      where: { id: questionId, labTestTypeId, deletedAt: null },
    });
    if (!question) {
      throw new NotFoundException('Question not found');
    }
    await this.prisma.labTestTypeQuestion.update({
      where: { id: questionId },
      data: { deletedAt: new Date() },
    });
    return { ok: true, message: 'Question deleted' };
  }
}
