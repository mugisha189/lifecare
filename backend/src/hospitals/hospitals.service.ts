import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApiResponse } from '../types/api-response.interface';
import { CreateHospitalDto } from './dto/create-hospital.dto';
import { UpdateHospitalDto } from './dto/update-hospital.dto';

@Injectable()
export class HospitalsService {
  private readonly logger = new Logger(HospitalsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createHospitalDto: CreateHospitalDto): Promise<ApiResponse> {
    try {
      // Check if hospital with same name already exists
      const existingHospital = await this.prisma.hospital.findFirst({
        where: {
          name: createHospitalDto.name,
          deletedAt: null,
        },
      });

      if (existingHospital) {
        throw new ConflictException('Hospital with this name already exists');
      }

      const hospital = await this.prisma.hospital.create({
        data: {
          ...createHospitalDto,
          country: createHospitalDto.country || 'Rwanda',
          active: createHospitalDto.active ?? true,
        },
      });

      this.logger.log(`Hospital created successfully: ${hospital.id}`);

      return {
        ok: true,
        message: 'Hospital created successfully',
        data: hospital,
      };
    } catch (error) {
      this.logger.error('Error creating hospital:', error);

      if (error instanceof ConflictException) {
        return {
          ok: false,
          message: error.message,
        };
      }

      return {
        ok: false,
        message: 'Failed to create hospital',
      };
    }
  }

  async findMyHospitals(userId: string, roleName: string): Promise<ApiResponse> {
    try {
      let hospitalId: string | null = null;
      if (roleName === 'DOCTOR') {
        const doctor = await this.prisma.doctorProfile.findFirst({
          where: { userId, deletedAt: null },
          select: { hospitalId: true },
        });
        hospitalId = doctor?.hospitalId ?? null;
      } else if (roleName === 'LABORATORY_STAFF') {
        const labStaff = await this.prisma.labStaffProfile.findFirst({
          where: { userId, deletedAt: null },
          select: { hospitalId: true },
        });
        hospitalId = labStaff?.hospitalId ?? null;
      }
      if (!hospitalId) {
        return { ok: true, data: [] };
      }
      const hospital = await this.prisma.hospital.findFirst({
        where: { id: hospitalId, deletedAt: null },
      });
      return { ok: true, data: hospital ? [hospital] : [] };
    } catch (error) {
      this.logger.error('Error fetching my hospitals:', error);
      return { ok: false, message: 'Failed to retrieve hospitals' };
    }
  }

  async findAll(): Promise<ApiResponse> {
    try {
      const hospitals = await this.prisma.hospital.findMany({
        where: {
          deletedAt: null,
        },
        orderBy: {
          name: 'asc',
        },
        include: {
          _count: {
            select: {
              doctors: true,
              pharmacists: true,
              labStaff: true,
            },
          },
        },
      });

      return {
        ok: true,
        data: hospitals,
      };
    } catch (error) {
      this.logger.error('Error fetching hospitals:', error);
      return {
        ok: false,
        message: 'Failed to retrieve hospitals',
      };
    }
  }

  async findOne(id: string): Promise<ApiResponse> {
    try {
      const hospital = await this.prisma.hospital.findFirst({
        where: {
          id,
          deletedAt: null,
        },
        include: {
          _count: {
            select: {
              doctors: true,
              pharmacists: true,
              labStaff: true,
            },
          },
        },
      });

      if (!hospital) {
        throw new NotFoundException(`Hospital with ID "${id}" not found`);
      }

      return {
        ok: true,
        data: hospital,
      };
    } catch (error) {
      this.logger.error(`Error fetching hospital ${id}:`, error);

      if (error instanceof NotFoundException) {
        return {
          ok: false,
          message: error.message,
        };
      }

      return {
        ok: false,
        message: 'Failed to retrieve hospital',
      };
    }
  }

  async update(id: string, updateHospitalDto: UpdateHospitalDto): Promise<ApiResponse> {
    try {
      // Check if hospital exists
      const existingHospital = await this.prisma.hospital.findFirst({
        where: {
          id,
          deletedAt: null,
        },
      });

      if (!existingHospital) {
        throw new NotFoundException(`Hospital with ID "${id}" not found`);
      }

      // Check if name is being changed and if it's already taken
      if (updateHospitalDto.name && updateHospitalDto.name !== existingHospital.name) {
        const duplicateHospital = await this.prisma.hospital.findFirst({
          where: {
            name: updateHospitalDto.name,
            deletedAt: null,
            NOT: {
              id,
            },
          },
        });

        if (duplicateHospital) {
          throw new ConflictException('Hospital with this name already exists');
        }
      }

      const hospital = await this.prisma.hospital.update({
        where: { id },
        data: updateHospitalDto,
      });

      this.logger.log(`Hospital updated successfully: ${id}`);

      return {
        ok: true,
        message: 'Hospital updated successfully',
        data: hospital,
      };
    } catch (error) {
      this.logger.error(`Error updating hospital ${id}:`, error);

      if (error instanceof NotFoundException || error instanceof ConflictException) {
        return {
          ok: false,
          message: error.message,
        };
      }

      return {
        ok: false,
        message: 'Failed to update hospital',
      };
    }
  }

  async remove(id: string): Promise<ApiResponse> {
    try {
      const hospital = await this.prisma.hospital.findFirst({
        where: {
          id,
          deletedAt: null,
        },
      });

      if (!hospital) {
        throw new NotFoundException(`Hospital with ID "${id}" not found`);
      }

      await this.prisma.hospital.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        },
      });

      this.logger.log(`Hospital deleted successfully: ${id}`);

      return {
        ok: true,
        message: 'Hospital deleted successfully',
      };
    } catch (error) {
      this.logger.error(`Error deleting hospital ${id}:`, error);

      if (error instanceof NotFoundException) {
        return {
          ok: false,
          message: error.message,
        };
      }

      return {
        ok: false,
        message: 'Failed to delete hospital',
      };
    }
  }

  async toggleActive(id: string, active: boolean): Promise<ApiResponse> {
    try {
      const hospital = await this.prisma.hospital.findFirst({
        where: {
          id,
          deletedAt: null,
        },
      });

      if (!hospital) {
        throw new NotFoundException(`Hospital with ID "${id}" not found`);
      }

      await this.prisma.hospital.update({
        where: { id },
        data: { active },
      });

      this.logger.log(`Hospital status toggled: ${id} - Active: ${active}`);

      return {
        ok: true,
        message: `Hospital ${active ? 'activated' : 'deactivated'} successfully`,
      };
    } catch (error) {
      this.logger.error(`Error toggling hospital status ${id}:`, error);

      if (error instanceof NotFoundException) {
        return {
          ok: false,
          message: error.message,
        };
      }

      return {
        ok: false,
        message: 'Failed to update hospital status',
      };
    }
  }

  async getHospitalDoctors(id: string): Promise<ApiResponse> {
    try {
      const hospital = await this.prisma.hospital.findFirst({
        where: {
          id,
          deletedAt: null,
        },
      });

      if (!hospital) {
        throw new NotFoundException(`Hospital with ID "${id}" not found`);
      }

      const doctors = await this.prisma.doctorProfile.findMany({
        where: {
          hospitalId: id,
          deletedAt: null,
          doctorStatus: 'ACTIVE',
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phoneNumber: true,
              profilePicture: true,
            },
          },
        },
      });

      return {
        ok: true,
        data: doctors,
      };
    } catch (error) {
      this.logger.error(`Error fetching hospital doctors ${id}:`, error);

      if (error instanceof NotFoundException) {
        return {
          ok: false,
          message: error.message,
        };
      }

      return {
        ok: false,
        message: 'Failed to retrieve hospital doctors',
      };
    }
  }

  async assignDoctor(hospitalId: string, userId: string): Promise<ApiResponse> {
    try {
      const hospital = await this.prisma.hospital.findFirst({
        where: {
          id: hospitalId,
          deletedAt: null,
        },
      });

      if (!hospital) {
        throw new NotFoundException(`Hospital with ID "${hospitalId}" not found`);
      }

      // Find doctor profile by user ID
      const doctor = await this.prisma.doctorProfile.findFirst({
        where: {
          userId,
          deletedAt: null,
        },
      });

      if (!doctor) {
        return {
          ok: false,
          message: `This user does not have a doctor profile yet. Please ask them to complete their profile first.`,
        };
      }

      await this.prisma.doctorProfile.update({
        where: { id: doctor.id },
        data: {
          hospitalId,
        },
      });

      this.logger.log(`Doctor ${doctor.id} assigned to hospital ${hospitalId}`);

      return {
        ok: true,
        message: 'Doctor assigned to hospital successfully',
      };
    } catch (error) {
      this.logger.error(`Error assigning doctor to hospital:`, error);

      if (error instanceof NotFoundException) {
        return {
          ok: false,
          message: error.message,
        };
      }

      return {
        ok: false,
        message: 'Failed to assign doctor to hospital',
      };
    }
  }

  async removeDoctor(hospitalId: string, doctorId: string): Promise<ApiResponse> {
    try {
      const hospital = await this.prisma.hospital.findFirst({
        where: {
          id: hospitalId,
          deletedAt: null,
        },
      });

      if (!hospital) {
        throw new NotFoundException(`Hospital with ID "${hospitalId}" not found`);
      }

      const doctor = await this.prisma.doctorProfile.findFirst({
        where: {
          id: doctorId,
          hospitalId,
          deletedAt: null,
        },
      });

      if (!doctor) {
        throw new NotFoundException(`Doctor not found in this hospital`);
      }

      await this.prisma.doctorProfile.update({
        where: { id: doctorId },
        data: {
          hospitalId: null,
        },
      });

      this.logger.log(`Doctor ${doctorId} removed from hospital ${hospitalId}`);

      return {
        ok: true,
        message: 'Doctor removed from hospital successfully',
      };
    } catch (error) {
      this.logger.error(`Error removing doctor from hospital:`, error);

      if (error instanceof NotFoundException) {
        return {
          ok: false,
          message: error.message,
        };
      }

      return {
        ok: false,
        message: 'Failed to remove doctor from hospital',
      };
    }
  }

  async getHospitalLabStaff(id: string): Promise<ApiResponse> {
    try {
      const hospital = await this.prisma.hospital.findFirst({
        where: {
          id,
          deletedAt: null,
        },
      });

      if (!hospital) {
        throw new NotFoundException(`Hospital with ID "${id}" not found`);
      }

      const labStaff = await this.prisma.labStaffProfile.findMany({
        where: {
          hospitalId: id,
          deletedAt: null,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phoneNumber: true,
              profilePicture: true,
              role: true,
            },
          },
        },
      });

      return {
        ok: true,
        data: labStaff,
      };
    } catch (error) {
      this.logger.error(`Error fetching hospital lab staff ${id}:`, error);

      if (error instanceof NotFoundException) {
        return {
          ok: false,
          message: error.message,
        };
      }

      return {
        ok: false,
        message: 'Failed to retrieve hospital lab staff',
      };
    }
  }

  async assignLabStaff(hospitalId: string, userId: string): Promise<ApiResponse> {
    try {
      const hospital = await this.prisma.hospital.findFirst({
        where: {
          id: hospitalId,
          deletedAt: null,
        },
      });

      if (!hospital) {
        throw new NotFoundException(`Hospital with ID "${hospitalId}" not found`);
      }

      // Find lab staff profile by user ID
      const labStaff = await this.prisma.labStaffProfile.findFirst({
        where: {
          userId,
          deletedAt: null,
        },
      });

      if (!labStaff) {
        return {
          ok: false,
          message: `This user does not have a lab staff profile yet. Please ask them to complete their profile first.`,
        };
      }

      await this.prisma.labStaffProfile.update({
        where: { id: labStaff.id },
        data: {
          hospitalId,
        },
      });

      this.logger.log(`Lab staff ${labStaff.id} assigned to hospital ${hospitalId}`);

      return {
        ok: true,
        message: 'Lab staff assigned to hospital successfully',
      };
    } catch (error) {
      this.logger.error(`Error assigning lab staff to hospital:`, error);

      if (error instanceof NotFoundException) {
        return {
          ok: false,
          message: error.message,
        };
      }

      return {
        ok: false,
        message: 'Failed to assign lab staff to hospital',
      };
    }
  }

  async removeLabStaff(hospitalId: string, labStaffId: string): Promise<ApiResponse> {
    try {
      const hospital = await this.prisma.hospital.findFirst({
        where: {
          id: hospitalId,
          deletedAt: null,
        },
      });

      if (!hospital) {
        throw new NotFoundException(`Hospital with ID "${hospitalId}" not found`);
      }

      const labStaff = await this.prisma.labStaffProfile.findFirst({
        where: {
          id: labStaffId,
          hospitalId,
          deletedAt: null,
        },
      });

      if (!labStaff) {
        throw new NotFoundException(`Lab staff not found in this hospital`);
      }

      await this.prisma.labStaffProfile.update({
        where: { id: labStaffId },
        data: {
          hospitalId: null,
        },
      });

      this.logger.log(`Lab staff ${labStaffId} removed from hospital ${hospitalId}`);

      return {
        ok: true,
        message: 'Lab staff removed from hospital successfully',
      };
    } catch (error) {
      this.logger.error(`Error removing lab staff from hospital:`, error);

      if (error instanceof NotFoundException) {
        return {
          ok: false,
          message: error.message,
        };
      }

      return {
        ok: false,
        message: 'Failed to remove lab staff from hospital',
      };
    }
  }
}
