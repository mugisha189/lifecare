import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ConsultationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BookConsultationDto } from './dto/book-consultation.dto';
import { CancelConsultationDto } from './dto/cancel-consultation.dto';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { QueryConsultationsDto } from './dto/query-consultations.dto';
import { UpdateConsultationStatusDto } from './dto/update-consultation-status.dto';
import { UpdateConsultationDto } from './dto/update-consultation.dto';

@Injectable()
export class ConsultationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createConsultationDto: CreateConsultationDto, userId: string) {
    // Get doctor profile
    const doctorProfile = await this.prisma.doctorProfile.findUnique({
      where: { userId },
    });

    if (!doctorProfile) {
      throw new NotFoundException({
        ok: false,
        message: 'Doctor profile not found',
      });
    }

    // Check if doctor is active
    if (doctorProfile.doctorStatus !== 'ACTIVE') {
      throw new ForbiddenException({
        ok: false,
        message: 'Doctor profile is not active',
      });
    }

    if (createConsultationDto.hospitalId && doctorProfile.hospitalId !== createConsultationDto.hospitalId) {
      throw new ForbiddenException({
        ok: false,
        message: 'Doctor is not assigned to the selected hospital',
      });
    }

    const patient = await this.prisma.user.findFirst({
      where: {
        id: createConsultationDto.patientId,
        deletedAt: null,
      },
      include: {
        patientProfile: true,
        role: { select: { name: true } },
      },
    });

    if (!patient) {
      throw new NotFoundException({
        ok: false,
        message: 'Patient not found',
      });
    }

    if (patient.role?.name !== 'PATIENT') {
      throw new NotFoundException({
        ok: false,
        message: 'Selected user is not a patient',
      });
    }

    // Check for overlapping consultations
    const consultationDate = new Date(createConsultationDto.date);
    const duration = createConsultationDto.duration || 30; // Default 30 minutes
    const estimatedEndTime = new Date(consultationDate.getTime() + duration * 60 * 1000);

    const overlappingConsultation = await this.prisma.consultation.findFirst({
      where: {
        doctorId: doctorProfile.id,
        status: {
          in: ['SCHEDULED', 'IN_PROGRESS'],
        },
        OR: [
          {
            AND: [{ date: { lte: consultationDate } }, { date: { gte: consultationDate } }],
          },
          {
            AND: [{ date: { lte: estimatedEndTime } }, { date: { gte: estimatedEndTime } }],
          },
        ],
      },
    });

    if (overlappingConsultation) {
      throw new ConflictException({
        ok: false,
        message: 'Doctor has an overlapping consultation at this time',
      });
    }

    // Generate user-friendly code: LifeCare-YYYY-MM-DD-N (N = daily increment)
    const yyyy = consultationDate.getFullYear();
    const mm = String(consultationDate.getMonth() + 1).padStart(2, '0');
    const dd = String(consultationDate.getDate()).padStart(2, '0');
    const startOfDay = new Date(yyyy, consultationDate.getMonth(), consultationDate.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);
    const countSameDay = await this.prisma.consultation.count({
      where: {
        date: { gte: startOfDay, lt: endOfDay },
        deletedAt: null,
      },
    });
    const code = `LifeCare-${yyyy}-${mm}-${dd}-${countSameDay + 1}`;

    // Create the consultation (symptoms/chief complaint not stored)
    const consultation = await this.prisma.consultation.create({
      data: {
        code,
        doctorId: doctorProfile.id,
        patientId: createConsultationDto.patientId,
        date: consultationDate,
        duration: duration,
        clinicalNotes: createConsultationDto.clinicalNotes,
        followUpRequired: createConsultationDto.followUpRequired || false,
        followUpDate: createConsultationDto.followUpDate ? new Date(createConsultationDto.followUpDate) : null,
        status: ConsultationStatus.SCHEDULED,
      },
      include: {
        doctor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profilePicture: true,
                phoneNumber: true,
              },
            },
          },
        },
        patient: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
            phoneNumber: true,
          },
        },
      },
    });

    return {
      ok: true,
      data: consultation,
      message: 'Consultation created successfully',
    };
  }

  async bookByPatient(patientUserId: string, dto: BookConsultationDto) {
    const patientProfile = await this.prisma.patientProfile.findFirst({
      where: { userId: patientUserId, deletedAt: null },
    });
    if (!patientProfile) {
      throw new NotFoundException({
        ok: false,
        message: 'Patient profile not found',
      });
    }

    const doctorProfile = await this.prisma.doctorProfile.findFirst({
      where: { id: dto.doctorId, deletedAt: null },
    });
    if (!doctorProfile) {
      throw new NotFoundException({
        ok: false,
        message: 'Doctor not found',
      });
    }
    if (doctorProfile.doctorStatus !== 'ACTIVE') {
      throw new ForbiddenException({
        ok: false,
        message: 'Doctor is not available for booking',
      });
    }

    const consultationDate = new Date(dto.date);
    const duration = dto.duration || 30;
    const estimatedEndTime = new Date(consultationDate.getTime() + duration * 60 * 1000);

    const overlappingConsultation = await this.prisma.consultation.findFirst({
      where: {
        doctorId: doctorProfile.id,
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
        deletedAt: null,
        OR: [
          {
            AND: [{ date: { lte: consultationDate } }, { date: { gte: consultationDate } }],
          },
          {
            AND: [{ date: { lte: estimatedEndTime } }, { date: { gte: estimatedEndTime } }],
          },
        ],
      },
    });
    if (overlappingConsultation) {
      throw new ConflictException({
        ok: false,
        message: 'This time slot is no longer available',
      });
    }

    const yyyy = consultationDate.getFullYear();
    const mm = String(consultationDate.getMonth() + 1).padStart(2, '0');
    const dd = String(consultationDate.getDate()).padStart(2, '0');
    const startOfDay = new Date(yyyy, consultationDate.getMonth(), consultationDate.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);
    const countSameDay = await this.prisma.consultation.count({
      where: {
        date: { gte: startOfDay, lt: endOfDay },
        deletedAt: null,
      },
    });
    const code = `LifeCare-${yyyy}-${mm}-${dd}-${countSameDay + 1}`;

    const consultation = await this.prisma.consultation.create({
      data: {
        code,
        doctorId: doctorProfile.id,
        patientId: patientUserId,
        date: consultationDate,
        duration,
        status: ConsultationStatus.SCHEDULED,
      },
      include: {
        doctor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profilePicture: true,
                phoneNumber: true,
              },
            },
          },
        },
        patient: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
            phoneNumber: true,
          },
        },
      },
    });

    return {
      ok: true,
      data: consultation,
      message: 'Consultation booked successfully',
    };
  }

  async findAll(queryConsultationsDto: QueryConsultationsDto) {
    const { page = 1, limit = 10, patientId, doctorId, date, status, search, excludeConsultationId } = queryConsultationsDto;

    const where: Prisma.ConsultationWhereInput = {
      deletedAt: null,
    };

    if (status) {
      where.status = status as ConsultationStatus;
    }

    if (patientId) {
      where.patientId = patientId;
    }

    if (excludeConsultationId) {
      where.id = { not: excludeConsultationId };
    }

    if (doctorId) {
      where.doctorId = doctorId;
    }

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);

      where.date = {
        gte: startDate,
        lt: endDate,
      };
    } else if (!patientId && !doctorId) {
      where.date = {
        gte: new Date(),
      };
    }

    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      where.OR = [
        { doctor: { user: { name: { contains: term, mode: 'insensitive' } } } },
        { patient: { name: { contains: term, mode: 'insensitive' } } },
      ];
    }

    const orderBy = patientId ? { date: 'desc' as const } : { date: 'asc' as const };

    const [consultations, total] = await Promise.all([
      this.prisma.consultation.findMany({
        where,
        include: {
          doctor: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  profilePicture: true,
                  phoneNumber: true,
                },
              },
            },
          },
          patient: {
            select: {
              id: true,
              name: true,
              profilePicture: true,
              phoneNumber: true,
            },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.consultation.count({ where }),
    ]);

    return {
      ok: true,
      data: consultations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByCode(code: string) {
    const consultation = await this.prisma.consultation.findFirst({
      where: { code: code.trim(), deletedAt: null },
      include: {
        doctor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profilePicture: true,
                phoneNumber: true,
              },
            },
          },
        },
        patient: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
            phoneNumber: true,
          },
        },
        prescriptions: {
          where: { deletedAt: null },
          include: {
            medicines: {
              include: { medicine: true },
            },
          },
        },
      },
    });
    if (!consultation) {
      throw new NotFoundException({
        ok: false,
        message: 'Consultation not found for this code',
      });
    }
    return { ok: true, data: consultation };
  }

  async findOne(id: string) {
    const consultation = await this.prisma.consultation.findUnique({
      where: { id, deletedAt: null },
      include: {
        doctor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profilePicture: true,
                phoneNumber: true,
              },
            },
            hospital: true,
          },
        },
        patient: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
            phoneNumber: true,
          },
        },
        prescriptions: {
          where: {
            deletedAt: null,
          },
          include: {
            medicines: {
              include: { medicine: true },
            },
          },
        },
        labTests: {
          where: {
            deletedAt: null,
          },
          include: {
            labTestType: {
              include: {
                questions: true,
              },
            },
          },
        },
      },
    });

    if (!consultation) {
      throw new NotFoundException({
        ok: false,
        message: 'Consultation not found',
      });
    }

    return {
      ok: true,
      data: consultation,
    };
  }

  async findDoctorConsultations(userId: string, status?: string, hospitalId?: string) {
    const doctorProfile = await this.prisma.doctorProfile.findUnique({
      where: { userId },
    });

    if (!doctorProfile) {
      throw new NotFoundException({
        ok: false,
        message: 'Doctor profile not found',
      });
    }

    const where: Prisma.ConsultationWhereInput = {
      doctorId: doctorProfile.id,
      deletedAt: null,
    };

    if (hospitalId?.trim()) {
      where.doctor = { hospitalId: hospitalId.trim() };
    }

    if (status) {
      where.status = status as ConsultationStatus;
    }

    const consultations = await this.prisma.consultation.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
            phoneNumber: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    return {
      ok: true,
      data: consultations,
    };
  }

  async findPatientConsultations(userId: string, status?: string) {
    const patientProfile = await this.prisma.patientProfile.findUnique({
      where: { userId },
    });

    if (!patientProfile) {
      return { ok: true, data: [] };
    }

    const where: Prisma.ConsultationWhereInput = {
      patientId: userId,
      deletedAt: null,
    };

    if (status) {
      // Map client "PENDING" to Prisma SCHEDULED (enum has SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED)
      const normalizedStatus =
        status.toUpperCase() === 'PENDING' ? ConsultationStatus.SCHEDULED : (status as ConsultationStatus);
      const validStatuses: ConsultationStatus[] = [
        ConsultationStatus.SCHEDULED,
        ConsultationStatus.IN_PROGRESS,
        ConsultationStatus.COMPLETED,
        ConsultationStatus.CANCELLED,
      ];
      if (validStatuses.includes(normalizedStatus)) {
        where.status = normalizedStatus;
      }
    }

    const consultations = await this.prisma.consultation.findMany({
      where,
      include: {
        doctor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profilePicture: true,
                phoneNumber: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    return {
      ok: true,
      data: consultations,
    };
  }

  async update(id: string, updateConsultationDto: UpdateConsultationDto, userId: string) {
    // Get doctor profile
    const doctorProfile = await this.prisma.doctorProfile.findUnique({
      where: { userId },
    });

    if (!doctorProfile) {
      throw new NotFoundException({
        ok: false,
        message: 'Doctor profile not found',
      });
    }

    // Find the consultation
    const consultation = await this.prisma.consultation.findUnique({
      where: { id, deletedAt: null },
    });

    if (!consultation) {
      throw new NotFoundException({
        ok: false,
        message: 'Consultation not found',
      });
    }

    // Check ownership
    if (consultation.doctorId !== doctorProfile.id) {
      throw new ForbiddenException({
        ok: false,
        message: 'You are not authorized to update this consultation',
      });
    }

    // Cannot update completed or cancelled consultations
    if (consultation.status === 'COMPLETED' || consultation.status === 'CANCELLED') {
      throw new ConflictException({
        ok: false,
        message: 'Cannot update completed or cancelled consultation',
      });
    }

    // Update the consultation
    await this.prisma.consultation.update({
      where: { id },
      data: {
        ...updateConsultationDto,
        date: updateConsultationDto.date ? new Date(updateConsultationDto.date) : undefined,
        followUpDate: updateConsultationDto.followUpDate ? new Date(updateConsultationDto.followUpDate) : undefined,
      },
    });

    return {
      ok: true,
      message: 'Consultation updated successfully',
    };
  }

  async updateStatus(id: string, updateConsultationStatusDto: UpdateConsultationStatusDto, userId: string) {
    // Get doctor profile
    const doctorProfile = await this.prisma.doctorProfile.findUnique({
      where: { userId },
    });

    if (!doctorProfile) {
      throw new NotFoundException({
        ok: false,
        message: 'Doctor profile not found',
      });
    }

    // Find the consultation
    const consultation = await this.prisma.consultation.findUnique({
      where: { id, deletedAt: null },
    });

    if (!consultation) {
      throw new NotFoundException({
        ok: false,
        message: 'Consultation not found',
      });
    }

    // Check ownership
    if (consultation.doctorId !== doctorProfile.id) {
      throw new ForbiddenException({
        ok: false,
        message: 'You are not authorized to update this consultation',
      });
    }

    // Validate status transition
    const { status } = updateConsultationStatusDto;

    if (consultation.status === ConsultationStatus.COMPLETED || consultation.status === ConsultationStatus.CANCELLED) {
      throw new ConflictException({
        ok: false,
        message: 'Cannot update completed or cancelled consultation',
      });
    }

    // Update status
    await this.prisma.consultation.update({
      where: { id },
      data: { status: status },
    });

    return {
      ok: true,
      message: 'Consultation status updated successfully',
    };
  }

  async cancel(id: string, cancelConsultationDto: CancelConsultationDto, userId: string) {
    // Get doctor profile
    const doctorProfile = await this.prisma.doctorProfile.findUnique({
      where: { userId },
    });

    if (!doctorProfile) {
      throw new NotFoundException({
        ok: false,
        message: 'Doctor profile not found',
      });
    }

    // Find the consultation
    const consultation = await this.prisma.consultation.findUnique({
      where: { id, deletedAt: null },
    });

    if (!consultation) {
      throw new NotFoundException({
        ok: false,
        message: 'Consultation not found',
      });
    }

    // Check ownership (doctor or patient can cancel)
    const isDoctor = consultation.doctorId === doctorProfile.id;
    const isPatient = consultation.patientId === userId;

    if (!isDoctor && !isPatient) {
      throw new ForbiddenException({
        ok: false,
        message: 'You are not authorized to cancel this consultation',
      });
    }

    // Cannot cancel completed or already cancelled consultations
    if (consultation.status === 'COMPLETED' || consultation.status === 'CANCELLED') {
      throw new ConflictException({
        ok: false,
        message: 'Cannot cancel completed or already cancelled consultation',
      });
    }

    // Cancel the consultation
    await this.prisma.consultation.update({
      where: { id },
      data: {
        status: ConsultationStatus.CANCELLED,
      },
    });

    return {
      ok: true,
      message: 'Consultation cancelled successfully',
    };
  }

  async remove(id: string, userId: string) {
    // Get doctor profile
    const doctorProfile = await this.prisma.doctorProfile.findUnique({
      where: { userId },
    });

    if (!doctorProfile) {
      throw new NotFoundException({
        ok: false,
        message: 'Doctor profile not found',
      });
    }

    // Find the consultation
    const consultation = await this.prisma.consultation.findUnique({
      where: { id, deletedAt: null },
    });

    if (!consultation) {
      throw new NotFoundException({
        ok: false,
        message: 'Consultation not found',
      });
    }

    // Check ownership
    if (consultation.doctorId !== doctorProfile.id) {
      throw new ForbiddenException({
        ok: false,
        message: 'You are not authorized to delete this consultation',
      });
    }

    // Cannot delete ongoing consultations
    if (consultation.status === 'IN_PROGRESS') {
      throw new ConflictException({
        ok: false,
        message: 'Cannot delete ongoing consultation',
      });
    }

    // Soft delete
    await this.prisma.consultation.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return {
      ok: true,
      message: 'Consultation deleted successfully',
    };
  }
}
