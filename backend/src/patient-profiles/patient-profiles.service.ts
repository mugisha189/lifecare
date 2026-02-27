import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApiResponse } from '../types/api-response.interface';
import { CreatePatientProfileDto } from './dto/create-patient-profile.dto';
import { UpdatePatientProfileDto } from './dto/update-patient-profile.dto';
import { QueryPatientProfilesDto } from './dto/query-patient-profiles.dto';
import { CreatePatientProfileSelfDto } from './dto/create-patient-profile-self.dto';

@Injectable()
export class PatientProfilesService {
  private readonly logger = new Logger(PatientProfilesService.name);
  private readonly CACHE_PREFIX = 'patient-profile:';
  private readonly CACHE_LIST_KEY = 'patient-profiles:list';
  private readonly CACHE_USER_PREFIX = 'patient-profile:user:';
  private readonly CACHE_TTL = 300;

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(userId: string, createPatientProfileDto: CreatePatientProfileDto): Promise<ApiResponse> {
    try {
      // Check if user exists
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return {
          ok: false,
          message: 'User not found',
        };
      }

      // Check if patient profile already exists
      const existingProfile = await this.prisma.patientProfile.findUnique({
        where: { userId },
      });

      if (existingProfile) {
        return {
          ok: false,
          message: 'Patient profile already exists for this user',
        };
      }

      // Create patient profile
      const patientProfile = await this.prisma.patientProfile.create({
        data: {
          userId,
          dateOfBirth: createPatientProfileDto.dateOfBirth ? new Date(createPatientProfileDto.dateOfBirth) : null,
          insuranceProviderId: createPatientProfileDto.insuranceProviderId,
          insuranceNumber: createPatientProfileDto.insuranceNumber,
          medicalHistory: createPatientProfileDto.medicalHistory,
          allergies: createPatientProfileDto.allergies || [],
          chronicConditions: createPatientProfileDto.chronicConditions || [],
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          savedAddresses: createPatientProfileDto.savedAddresses,
          specialRequirements: createPatientProfileDto.specialRequirements,
          loyaltyPoints: createPatientProfileDto.loyaltyPoints || 0,
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
          insuranceProvider: true,
        },
      });

      this.logger.log(`Patient profile created: ${patientProfile.id}`);

      return {
        ok: true,
        message: 'Patient profile created successfully',
        data: patientProfile,
      };
    } catch (error) {
      this.logger.error('Error creating patient profile:', error);
      return {
        ok: false,
        message: 'Internal server error',
      };
    }
  }

  async findAll(queryDto: QueryPatientProfilesDto): Promise<ApiResponse> {
    try {
      const { page = 1, limit = 10 } = queryDto;

      // Build where clause
      const where = {
        deletedAt: null,
      };

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Get total count
      const total = await this.prisma.patientProfile.count({ where });

      // Get patient profiles
      const patientProfiles = await this.prisma.patientProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
          insuranceProvider: true,
        },
      });

      const result = {
        patientProfiles,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };

      return { ok: true, data: result };
    } catch (error) {
      this.logger.error('Error fetching patient profiles:', error);
      return {
        ok: false,
        message: 'Internal server error',
      };
    }
  }

  async findOne(id: string): Promise<ApiResponse> {
    try {
      const patientProfile = await this.prisma.patientProfile.findUnique({
        where: { id },
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
          insuranceProvider: true,
        },
      });

      if (!patientProfile || patientProfile.deletedAt) {
        return {
          ok: false,
          message: 'Patient profile not found',
        };
      }

      return { ok: true, data: patientProfile };
    } catch (error) {
      this.logger.error('Error fetching patient profile:', error);
      return {
        ok: false,
        message: 'Internal server error',
      };
    }
  }

  async findByUserId(userId: string): Promise<ApiResponse> {
    try {
      const patientProfile = await this.prisma.patientProfile.findUnique({
        where: { userId },
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
          insuranceProvider: true,
        },
      });

      if (!patientProfile || patientProfile.deletedAt) {
        return {
          ok: false,
          message: 'Patient profile not found',
        };
      }

      return { ok: true, data: patientProfile };
    } catch (error) {
      this.logger.error('Error fetching patient profile by user ID:', error);
      return {
        ok: false,
        message: 'Internal server error',
      };
    }
  }

  async updateByUserId(userId: string, updatePatientProfileDto: UpdatePatientProfileDto): Promise<ApiResponse> {
    try {
      // Find the patient profile by userId
      const patientProfile = await this.prisma.patientProfile.findUnique({
        where: { userId },
      });

      if (!patientProfile || patientProfile.deletedAt) {
        return {
          ok: false,
          message: 'Patient profile not found',
        };
      }

      // Update the patient profile
      const updatedPatientProfile = await this.prisma.patientProfile.update({
        where: { userId },
        data: updatePatientProfileDto,
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
          insuranceProvider: true,
        },
      });

      this.logger.log(`Patient profile updated for user: ${userId}`);

      return {
        ok: true,
        message: 'Patient profile updated successfully',
        data: updatedPatientProfile,
      };
    } catch (error) {
      this.logger.error('Error updating patient profile:', error);
      return {
        ok: false,
        message: 'Internal server error',
      };
    }
  }

  async remove(id: string): Promise<ApiResponse> {
    try {
      // Find the patient profile
      const patientProfile = await this.prisma.patientProfile.findUnique({
        where: { id },
      });

      if (!patientProfile || patientProfile.deletedAt) {
        return {
          ok: false,
          message: 'Patient profile not found',
        };
      }

      // Soft delete
      await this.prisma.patientProfile.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      this.logger.log(`Patient profile deleted: ${id}`);

      return {
        ok: true,
        message: 'Patient profile deleted successfully',
      };
    } catch (error) {
      this.logger.error('Error deleting patient profile:', error);
      return {
        ok: false,
        message: 'Internal server error',
      };
    }
  }

  async createSelf(userId: string, createDto: CreatePatientProfileSelfDto): Promise<ApiResponse> {
    try {
      // Check if patient profile already exists
      const existingProfile = await this.prisma.patientProfile.findUnique({
        where: { userId },
      });

      if (existingProfile) {
        return {
          ok: false,
          message: 'Patient profile already exists for this user',
        };
      }

      // Create patient profile
      const patientProfile = await this.prisma.patientProfile.create({
        data: {
          userId,
          dateOfBirth: createDto.dateOfBirth ? new Date(createDto.dateOfBirth) : null,
          insuranceProviderId: createDto.insuranceProviderId,
          insuranceNumber: createDto.insuranceNumber,
          medicalHistory: createDto.medicalHistory,
          allergies: createDto.allergies || [],
          chronicConditions: createDto.chronicConditions || [],
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          savedAddresses: createDto.savedAddresses,
          specialRequirements: createDto.specialRequirements,
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
          insuranceProvider: true,
        },
      });

      this.logger.log(`Patient profile created by user: ${userId}`);

      return {
        ok: true,
        message: 'Patient profile created successfully',
        data: patientProfile,
      };
    } catch (error) {
      this.logger.error('Error creating patient profile:', error);
      return {
        ok: false,
        message: 'Internal server error',
      };
    }
  }

  async verifyProfile(id: string): Promise<ApiResponse> {
    try {
      // Find the patient profile
      const patientProfile = await this.prisma.patientProfile.findUnique({
        where: { id },
      });

      if (!patientProfile || patientProfile.deletedAt) {
        return {
          ok: false,
          message: 'Patient profile not found',
        };
      }

      // Update patient profile verification status
      const updatedProfile = await this.prisma.patientProfile.update({
        where: { id },
        data: {
          verificationStatus: 'VERIFIED',
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
          insuranceProvider: true,
        },
      });

      this.logger.log(`Patient profile verified: ${id}`);

      return {
        ok: true,
        message: 'Patient profile verified successfully',
        data: updatedProfile,
      };
    } catch (error) {
      this.logger.error('Error verifying patient profile:', error);
      return {
        ok: false,
        message: 'Internal server error',
      };
    }
  }

  // Helper methods
  private buildCacheKey(queryDto: QueryPatientProfilesDto): string {
    const parts = ['patient-profiles'];
    parts.push(`page:${queryDto.page || 1}`);
    parts.push(`limit:${queryDto.limit || 10}`);
    return parts.join(':');
  }

  // Redis-based cache invalidation removed; patient profile reads always hit the database.
}
