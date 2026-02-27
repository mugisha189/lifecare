import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ApiResponse } from '../types/api-response.interface';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { QueryMedicinesDto } from './dto/query-medicines.dto';

@Injectable()
export class MedicinesService {
  private readonly logger = new Logger(MedicinesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createMedicineDto: CreateMedicineDto): Promise<ApiResponse> {
    const existing = await this.prisma.medicine.findFirst({
      where: { name: { equals: createMedicineDto.name.trim(), mode: 'insensitive' }, deletedAt: null },
    });
    if (existing) {
      throw new ConflictException('A medicine with this name already exists');
    }
    const medicine = await this.prisma.medicine.create({
      data: {
        name: createMedicineDto.name.trim(),
        description: createMedicineDto.description?.trim() || null,
        active: true,
      },
    });
    this.logger.log(`Medicine created: ${medicine.id}`);
    return { ok: true, data: medicine, message: 'Medicine created successfully' };
  }

  async findAll(queryDto: QueryMedicinesDto): Promise<ApiResponse> {
    const { page = 1, limit = 100, search, active } = queryDto;
    const skip = (page - 1) * limit;
    const where: Prisma.MedicineWhereInput = { deletedAt: null };
    if (search?.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { description: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }
    if (active !== undefined) {
      where.active = active;
    }
    const [medicines, total] = await Promise.all([
      this.prisma.medicine.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.medicine.count({ where }),
    ]);
    return {
      ok: true,
      data: {
        medicines,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      },
      message: 'Medicines retrieved successfully',
    };
  }

  async findOne(id: string): Promise<ApiResponse> {
    const medicine = await this.prisma.medicine.findFirst({
      where: { id, deletedAt: null },
    });
    if (!medicine) {
      throw new NotFoundException('Medicine not found');
    }
    return { ok: true, data: medicine, message: 'Medicine retrieved successfully' };
  }

  async update(id: string, updateMedicineDto: UpdateMedicineDto): Promise<ApiResponse> {
    const medicine = await this.prisma.medicine.findFirst({
      where: { id, deletedAt: null },
    });
    if (!medicine) {
      throw new NotFoundException('Medicine not found');
    }
    if (updateMedicineDto.name?.trim()) {
      const existing = await this.prisma.medicine.findFirst({
        where: {
          name: { equals: updateMedicineDto.name.trim(), mode: 'insensitive' },
          id: { not: id },
          deletedAt: null,
        },
      });
      if (existing) {
        throw new ConflictException('A medicine with this name already exists');
      }
    }
    const updated = await this.prisma.medicine.update({
      where: { id },
      data: {
        ...(updateMedicineDto.name !== undefined && { name: updateMedicineDto.name.trim() }),
        ...(updateMedicineDto.description !== undefined && {
          description: updateMedicineDto.description?.trim() || null,
        }),
      },
    });
    this.logger.log(`Medicine updated: ${id}`);
    return { ok: true, data: updated, message: 'Medicine updated successfully' };
  }

  async remove(id: string): Promise<ApiResponse> {
    const medicine = await this.prisma.medicine.findFirst({
      where: { id, deletedAt: null },
    });
    if (!medicine) {
      throw new NotFoundException('Medicine not found');
    }
    const pendingCount = await this.prisma.prescriptionMedicine.count({
      where: {
        medicineId: id,
        prescription: { status: 'PENDING', deletedAt: null },
      },
    });
    if (pendingCount > 0) {
      throw new ConflictException('Cannot delete medicine that is used in pending prescriptions');
    }
    await this.prisma.medicine.update({
      where: { id },
      data: { deletedAt: new Date(), active: false },
    });
    this.logger.log(`Medicine deleted: ${id}`);
    return { ok: true, message: 'Medicine deleted successfully' };
  }
}
