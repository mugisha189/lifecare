import { Injectable, Logger, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrescriptionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ApiResponse } from '../types/api-response.interface';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { QueryPrescriptionsDto } from './dto/query-prescriptions.dto';

@Injectable()
export class PrescriptionsService {
  private readonly logger = new Logger(PrescriptionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new prescription (Doctor only)
   */
  async create(userId: string, createPrescriptionDto: CreatePrescriptionDto): Promise<ApiResponse> {
    try {
      // Get doctor profile
      const doctorProfile = await this.prisma.doctorProfile.findUnique({
        where: { userId },
      });

      if (!doctorProfile) {
        return {
          ok: false,
          message: 'Doctor profile not found',
        };
      }

      const patient = await this.prisma.user.findUnique({
        where: { id: createPrescriptionDto.patientId },
      });

      if (!patient || patient.deletedAt) {
        return {
          ok: false,
          message: 'Patient not found',
        };
      }

      // Verify consultation exists if provided
      if (createPrescriptionDto.consultationId) {
        const consultation = await this.prisma.consultation.findUnique({
          where: { id: createPrescriptionDto.consultationId },
        });

        if (!consultation || consultation.deletedAt) {
          return {
            ok: false,
            message: 'Consultation not found',
          };
        }

        // Verify consultation belongs to this doctor and patient
        if (consultation.doctorId !== doctorProfile.id || consultation.patientId !== createPrescriptionDto.patientId) {
          return {
            ok: false,
            message: 'Consultation does not belong to this doctor and patient',
          };
        }
      }

      // Verify all medicines exist and are active
      const medicineIds = createPrescriptionDto.medicines.map(m => m.medicineId);
      const medicines = await this.prisma.medicine.findMany({
        where: {
          id: { in: medicineIds },
          active: true,
          deletedAt: null,
        },
      });

      if (medicines.length !== medicineIds.length) {
        return {
          ok: false,
          message: 'One or more medicines not found or inactive',
        };
      }

      // Create prescription with medicines in a transaction
      const prescription = await this.prisma.$transaction(async tx => {
        // Create prescription
        const newPrescription = await tx.prescription.create({
          data: {
            consultationId: createPrescriptionDto.consultationId,
            doctorId: doctorProfile.id,
            patientId: createPrescriptionDto.patientId,
            notes: createPrescriptionDto.notes,
            status: PrescriptionStatus.PENDING,
          },
        });

        // Create prescription medicines
        await Promise.all(
          createPrescriptionDto.medicines.map(medicine =>
            tx.prescriptionMedicine.create({
              data: {
                prescriptionId: newPrescription.id,
                medicineId: medicine.medicineId,
                dosage: medicine.dosage,
                frequency: medicine.frequency,
                duration: medicine.duration,
                quantity: medicine.quantity,
                instructions: medicine.instructions,
              },
            })
          )
        );

        return newPrescription;
      });

      // Fetch the complete prescription with relations
      const completePrescription = await this.prisma.prescription.findUnique({
        where: { id: prescription.id },
        include: {
          doctor: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  profilePicture: true,
                },
              },
            },
          },
          patient: {
            select: {
              id: true,
              name: true,
              profilePicture: true,
            },
          },
          consultation: {
            select: {
              id: true,
              date: true,
            },
          },
          medicines: {
            include: {
              medicine: true,
            },
          },
        },
      });

      this.logger.log(`Prescription created: ${prescription.id} for patient ${createPrescriptionDto.patientId} by doctor ${userId}`);

      return {
        ok: true,
        message: 'Prescription created successfully',
        data: completePrescription,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error creating prescription: ${errorMessage}`, errorStack);
      return {
        ok: false,
        message: 'Failed to create prescription',
      };
    }
  }

  /**
   * Get all prescriptions (Admin: all, Patient: own prescriptions)
   */
  async findAll(userId: string, queryDto: QueryPrescriptionsDto): Promise<ApiResponse> {
    try {
      const { page = 1, limit = 10, status } = queryDto;
      const skip = (page - 1) * limit;

      // Check if user is admin
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { role: true },
      });

      const isAdmin = user?.role?.name === 'ADMIN';

      const where = {
        ...(isAdmin ? {} : {
          patientId: userId,
          consultationId: { not: null },
          consultation: { status: 'COMPLETED' as const, deletedAt: null },
        }),
        deletedAt: null,
        ...(status && { status }),
      };

      const [prescriptions, total] = await Promise.all([
        this.prisma.prescription.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            doctor: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    profilePicture: true,
                  },
                },
              },
            },
            patient: {
              select: {
                id: true,
                name: true,
                profilePicture: true,
                email: true,
                phoneNumber: true,
              },
            },
            consultation: {
              select: {
                id: true,
                code: true,
                date: true,
                status: true,
              },
            },
            medicines: {
              include: {
                medicine: true,
              },
            },
            pharmacist: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        }),
        this.prisma.prescription.count({ where }),
      ]);

      return {
        ok: true,
        message: 'Prescriptions retrieved successfully',
        data: {
          prescriptions,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error fetching prescriptions: ${errorMessage}`, errorStack);
      return {
        ok: false,
        message: 'Failed to retrieve prescriptions',
      };
    }
  }

  /**
   * Get prescriptions for a doctor
   */
  async findDoctorPrescriptions(userId: string, queryDto: QueryPrescriptionsDto): Promise<ApiResponse> {
    try {
      const { page = 1, limit = 10, status } = queryDto;
      const skip = (page - 1) * limit;

      // Get doctor profile
      const doctor = await this.prisma.doctorProfile.findUnique({
        where: { userId },
      });

      if (!doctor) {
        return {
          ok: false,
          message: 'Doctor profile not found',
        };
      }

      const where = {
        deletedAt: null,
        doctorId: doctor.id,
        ...(status && { status }),
      };

      const [prescriptions, total] = await Promise.all([
        this.prisma.prescription.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            patient: {
              select: {
                id: true,
                name: true,
                profilePicture: true,
              },
            },
            consultation: {
              select: {
                id: true,
                date: true,
              },
            },
            medicines: {
              include: {
                medicine: true,
              },
            },
            pharmacist: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        }),
        this.prisma.prescription.count({ where }),
      ]);

      return {
        ok: true,
        message: 'Prescriptions retrieved successfully',
        data: {
          prescriptions,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error fetching doctor prescriptions: ${errorMessage}`, errorStack);
      return {
        ok: false,
        message: 'Failed to retrieve prescriptions',
      };
    }
  }

  /**
   * Get prescriptions (Admin: all, Pharmacist: dispensed by them)
   */
  async findPharmacistPrescriptions(userId: string, queryDto: QueryPrescriptionsDto): Promise<ApiResponse> {
    try {
      const { page = 1, limit = 10, status } = queryDto;
      const skip = (page - 1) * limit;

      // Check if user is admin
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { role: true },
      });

      const isAdmin = user?.role?.name === 'ADMIN';
      let pharmacistId: string | undefined;

      if (!isAdmin) {
        const pharmacist = await this.prisma.pharmacistProfile.findUnique({
          where: { userId },
        });
        if (!pharmacist) {
          return {
            ok: false,
            message: 'Pharmacist profile not found',
          };
        }
        pharmacistId = pharmacist.id;
      }

      const where = isAdmin
        ? {
            deletedAt: null,
            ...(status && { status }),
          }
        : {
            deletedAt: null,
            pharmacistId: pharmacistId!,
            status: PrescriptionStatus.DISPENSED,
          };

      const [prescriptions, total] = await Promise.all([
        this.prisma.prescription.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            doctor: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    profilePicture: true,
                  },
                },
              },
            },
            patient: {
              select: {
                id: true,
                name: true,
                profilePicture: true,
                email: true,
                phoneNumber: true,
              },
            },
            medicines: {
              include: {
                medicine: true,
              },
            },
          },
        }),
        this.prisma.prescription.count({ where }),
      ]);

      return {
        ok: true,
        message: 'Prescriptions retrieved successfully',
        data: {
          prescriptions,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error fetching pharmacist prescriptions: ${errorMessage}`, errorStack);
      return {
        ok: false,
        message: 'Failed to retrieve prescriptions',
      };
    }
  }

  /**
   * Get a single prescription by ID
   */
  async findOne(id: string, userId: string): Promise<ApiResponse> {
    try {
      const prescription = await this.prisma.prescription.findFirst({
        where: {
          id,
          deletedAt: null,
          OR: [
            { patientId: userId },
            { doctor: { userId } },
            { pharmacist: { userId } },
          ],
        },
        include: {
          doctor: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  profilePicture: true,
                },
              },
            },
          },
          patient: {
            select: {
              id: true,
              name: true,
              profilePicture: true,
            },
          },
          consultation: {
            select: {
              id: true,
              date: true,
              symptoms: true,
              diagnosis: true,
            },
          },
          medicines: {
            include: {
              medicine: true,
            },
          },
          pharmacist: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!prescription) {
        return {
          ok: false,
          message: 'Prescription not found',
        };
      }

      return {
        ok: true,
        message: 'Prescription retrieved successfully',
        data: prescription,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error fetching prescription: ${errorMessage}`, errorStack);
      return {
        ok: false,
        message: 'Failed to retrieve prescription',
      };
    }
  }

  /**
   * Update prescription status (Pharmacist can dispense, Doctor can cancel)
   */
  async update(id: string, userId: string, updatePrescriptionDto: UpdatePrescriptionDto): Promise<ApiResponse> {
    try {
      const { status } = updatePrescriptionDto;

      // Find prescription
      const prescription = await this.prisma.prescription.findFirst({
        where: {
          id,
          deletedAt: null,
        },
      });

      if (!prescription) {
        return {
          ok: false,
          message: 'Prescription not found',
        };
      }

      // Check permissions based on status update
      if (status === PrescriptionStatus.DISPENSED) {
        // Only pharmacist can dispense
        const pharmacist = await this.prisma.pharmacistProfile.findUnique({
          where: { userId },
        });

        if (!pharmacist) {
          return {
            ok: false,
            message: 'Only pharmacists can dispense prescriptions',
          };
        }

        // Check if prescription is in PENDING status
        if (prescription.status !== PrescriptionStatus.PENDING) {
          return {
            ok: false,
            message: 'Only pending prescriptions can be dispensed',
          };
        }

        // Update prescription with pharmacist and dispensed date
        const updatedPrescription = await this.prisma.prescription.update({
          where: { id },
          data: {
            status: PrescriptionStatus.DISPENSED,
            pharmacistId: pharmacist.id,
            dispensedAt: new Date(),
          },
          include: {
            doctor: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    profilePicture: true,
                  },
                },
              },
            },
            patient: {
              select: {
                id: true,
                name: true,
                profilePicture: true,
              },
            },
            medicines: {
              include: {
                medicine: true,
              },
            },
            pharmacist: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        });

        this.logger.log(`Prescription ${id} dispensed by pharmacist ${userId}`);

        return {
          ok: true,
          message: 'Prescription dispensed successfully',
          data: updatedPrescription,
        };
      } else if (status === PrescriptionStatus.CANCELLED) {
        // Only doctor can cancel
        const doctor = await this.prisma.doctorProfile.findUnique({
          where: { userId },
        });

        if (!doctor || prescription.doctorId !== doctor.id) {
          return {
            ok: false,
            message: 'Only the prescribing doctor can cancel this prescription',
          };
        }

        // Don't allow cancelling already dispensed prescriptions
        if (prescription.status === PrescriptionStatus.DISPENSED) {
          return {
            ok: false,
            message: 'Cannot cancel already dispensed prescription',
          };
        }

        const updatedPrescription = await this.prisma.prescription.update({
          where: { id },
          data: { status: PrescriptionStatus.CANCELLED },
          include: {
            doctor: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    profilePicture: true,
                  },
                },
              },
            },
            patient: {
              select: {
                id: true,
                name: true,
                profilePicture: true,
              },
            },
            medicines: {
              include: {
                medicine: true,
              },
            },
          },
        });

        this.logger.log(`Prescription ${id} cancelled by doctor ${userId}`);

        return {
          ok: true,
          message: 'Prescription cancelled successfully',
          data: updatedPrescription,
        };
      }

      return {
        ok: false,
        message: 'Invalid status update',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error updating prescription: ${errorMessage}`, errorStack);
      return {
        ok: false,
        message: 'Failed to update prescription',
      };
    }
  }

  /**
   * Soft delete a prescription (Doctor only)
   */
  async remove(id: string, userId: string): Promise<ApiResponse> {
    try {
      const prescription = await this.prisma.prescription.findFirst({
        where: {
          id,
          deletedAt: null,
        },
        include: {
          doctor: true,
        },
      });

      if (!prescription) {
        return {
          ok: false,
          message: 'Prescription not found',
        };
      }

      // Only doctor can delete
      const doctor = await this.prisma.doctorProfile.findUnique({
        where: { userId },
      });

      if (!doctor || prescription.doctorId !== doctor.id) {
        return {
          ok: false,
          message: 'Only the prescribing doctor can delete this prescription',
        };
      }

      // Don't allow deleting dispensed prescriptions
      if (prescription.status === PrescriptionStatus.DISPENSED) {
        return {
          ok: false,
          message: 'Cannot delete already dispensed prescription',
        };
      }

      // Soft delete
      await this.prisma.prescription.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      this.logger.log(`Prescription ${id} deleted by doctor ${userId}`);

      return {
        ok: true,
        message: 'Prescription deleted successfully',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error deleting prescription: ${errorMessage}`, errorStack);
      return {
        ok: false,
        message: 'Failed to delete prescription',
      };
    }
  }
}
