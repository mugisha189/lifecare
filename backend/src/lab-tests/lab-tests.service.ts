import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApiResponse } from '../types/api-response.interface';
import { CreateLabTestDto } from './dto/create-lab-test.dto';
import { CompleteLabTestDto } from './dto/complete-lab-test.dto';

@Injectable()
export class LabTestsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateLabTestDto): Promise<ApiResponse> {
    const doctorProfile = await this.prisma.doctorProfile.findUnique({
      where: { userId },
    });

    if (!doctorProfile) {
      throw new NotFoundException('Doctor profile not found');
    }

    if (doctorProfile.doctorStatus !== 'ACTIVE') {
      throw new ForbiddenException('Doctor profile is not active');
    }

    const labTestType = await this.prisma.labTestType.findFirst({
      where: { id: dto.labTestTypeId, deletedAt: null },
    });

    if (!labTestType) {
      throw new NotFoundException('Lab test type not found');
    }

    const patient = await this.prisma.user.findFirst({
      where: { id: dto.patientId, deletedAt: null },
      include: { role: { select: { name: true } } },
    });

    if (!patient || patient.role?.name !== 'PATIENT') {
      throw new NotFoundException('Patient not found');
    }

    if (dto.consultationId) {
      const consultation = await this.prisma.consultation.findFirst({
        where: { id: dto.consultationId, deletedAt: null },
      });
      if (!consultation) {
        throw new NotFoundException('Consultation not found');
      }
      if (consultation.doctorId !== doctorProfile.id || consultation.patientId !== dto.patientId) {
        throw new ForbiddenException('Consultation does not belong to this doctor and patient');
      }
    }

    const labTest = await this.prisma.labTest.create({
      data: {
        consultationId: dto.consultationId,
        patientId: dto.patientId,
        doctorId: doctorProfile.id,
        labTestTypeId: labTestType.id,
        testType: labTestType.name,
        testName: labTestType.name,
        notes: dto.notes?.trim() || null,
        status: 'PENDING',
      },
      include: {
        patient: { select: { id: true, name: true, email: true } },
        requestedBy: { include: { user: { select: { name: true } } } },
        labTestType: { select: { id: true, name: true } },
      },
    });

    return { ok: true, message: 'Lab test recommended successfully', data: labTest };
  }

  async findOne(id: string, userId?: string): Promise<ApiResponse> {
    const labTest = await this.prisma.labTest.findFirst({
      where: { id, deletedAt: null },
      include: {
        patient: { select: { id: true, name: true, email: true } },
        requestedBy: { include: { user: { select: { name: true } } } },
        performedBy: { include: { user: { select: { name: true } } } },
        labTestType: {
          select: {
            id: true,
            name: true,
            description: true,
            questions: {
              where: { deletedAt: null },
              orderBy: { order: 'asc' },
              select: { id: true, label: true, type: true, options: true, order: true },
            },
          },
        },
      },
    });

    if (!labTest) {
      throw new NotFoundException('Lab test not found');
    }

    return { ok: true, data: labTest };
  }

  async complete(id: string, userId: string, dto: CompleteLabTestDto): Promise<ApiResponse> {
    const labStaffProfile = await this.prisma.labStaffProfile.findFirst({
      where: { userId, deletedAt: null },
    });

    if (!labStaffProfile) {
      throw new NotFoundException('Lab staff profile not found');
    }

    const labTest = await this.prisma.labTest.findFirst({
      where: { id, deletedAt: null },
      include: {
        labTestType: {
          select: {
            questions: {
              where: { deletedAt: null },
              select: { id: true },
            },
          },
        },
      },
    });

    if (!labTest) {
      throw new NotFoundException('Lab test not found');
    }

    if (labTest.status === 'COMPLETED') {
      throw new ForbiddenException('This lab test is already completed');
    }

    if (labTest.labTestTypeId && labTest.labTestType && labTest.labTestType.questions.length > 0) {
      const questionIds = labTest.labTestType.questions.map((q) => q.id);
      const providedIds = Object.keys(dto.results);
      const invalid = providedIds.filter((id) => !questionIds.includes(id));
      if (invalid.length > 0) {
        throw new ForbiddenException(`Invalid question IDs: ${invalid.join(', ')}`);
      }
    }

    const updated = await this.prisma.labTest.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        results: dto.results as object,
        resultsDate: new Date(),
        labStaffId: labStaffProfile.id,
      },
      include: {
        patient: { select: { id: true, name: true, email: true } },
        requestedBy: { include: { user: { select: { name: true } } } },
        performedBy: { include: { user: { select: { name: true } } } },
        labTestType: { select: { id: true, name: true } },
      },
    });

    return { ok: true, message: 'Lab test completed successfully', data: updated };
  }

  async findByConsultation(consultationId: string): Promise<ApiResponse> {
    const consultation = await this.prisma.consultation.findFirst({
      where: { id: consultationId, deletedAt: null },
    });

    if (!consultation) {
      throw new NotFoundException('Consultation not found');
    }

    const labTests = await this.prisma.labTest.findMany({
      where: { consultationId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        requestedBy: { include: { user: { select: { name: true } } } },
        labTestType: { select: { id: true, name: true } },
      },
    });

    return { ok: true, data: labTests };
  }

  async findMyLabTests(userId: string, hospitalId?: string): Promise<ApiResponse> {
    const labStaffProfile = await this.prisma.labStaffProfile.findFirst({
      where: { userId, deletedAt: null },
      select: { id: true, hospitalId: true },
    });

    if (!labStaffProfile) {
      throw new NotFoundException('Lab staff profile not found');
    }

    const targetHospitalId = hospitalId?.trim() || labStaffProfile.hospitalId;
    if (!targetHospitalId) {
      return { ok: true, data: [] };
    }

    const labTests = await this.prisma.labTest.findMany({
      where: {
        deletedAt: null,
        OR: [
          { requestedBy: { hospitalId: targetHospitalId } },
          { performedBy: { hospitalId: targetHospitalId } },
          { consultation: { doctor: { hospitalId: targetHospitalId } } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        patient: { select: { id: true, name: true, email: true } },
        requestedBy: { include: { user: { select: { name: true } } } },
        performedBy: { include: { user: { select: { name: true } } } },
        labTestType: { select: { id: true, name: true } },
      },
    });

    return { ok: true, data: labTests };
  }
}
