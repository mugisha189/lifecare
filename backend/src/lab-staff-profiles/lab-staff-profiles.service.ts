import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApiResponse } from '../types/api-response.interface';
import { CreateLabStaffProfileDto } from './dto/create-lab-staff-profile.dto';
import { UpdateLabStaffProfileDto } from './dto/update-lab-staff-profile.dto';
import { QueryLabStaffProfilesDto } from './dto/query-lab-staff-profiles.dto';
import { CreateLabStaffProfileSelfDto } from './dto/create-lab-staff-profile-self.dto';

@Injectable()
export class LabStaffProfilesService {
  private readonly logger = new Logger(LabStaffProfilesService.name);
  private readonly CACHE_PREFIX = 'lab-staff-profile:';
  private readonly CACHE_LIST_KEY = 'lab-staff-profiles:list';
  private readonly CACHE_USER_PREFIX = 'lab-staff-profile:user:';
  private readonly CACHE_TTL = 300;

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(userId: string, createLabStaffProfileDto: CreateLabStaffProfileDto): Promise<ApiResponse> {
    try {
      const { licenseNumber, licenseExpiryDate, ...profileData } = createLabStaffProfileDto;

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

      // Check if lab staff profile already exists for this user
      const existingProfile = await this.prisma.labStaffProfile.findUnique({
        where: { userId },
      });

      if (existingProfile) {
        return {
          ok: false,
          message: 'Lab staff profile already exists for this user',
        };
      }

      // Check if license number is already in use (if provided)
      if (licenseNumber) {
        const existingLicense = await this.prisma.labStaffProfile.findUnique({
          where: { licenseNumber },
        });

        if (existingLicense) {
          return {
            ok: false,
            message: `License number ${licenseNumber} is already in use`,
          };
        }
      }

      // Create lab staff profile
      const labStaffProfile = await this.prisma.labStaffProfile.create({
        data: {
          userId,
          licenseNumber,
          licenseExpiryDate: licenseExpiryDate ? new Date(licenseExpiryDate) : null,
          hospitalId: profileData.hospitalId,
          yearsOfExperience: profileData.yearsOfExperience,
          qualifications: profileData.qualifications || [],
          labStaffStatus: profileData.labStaffStatus,
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
          hospital: true,
          _count: {
            select: {
              labTests: true,
            },
          },
        },
      });

      this.logger.log(`Lab staff profile created: ${labStaffProfile.id}`);

      return {
        ok: true,
        message: 'Lab staff profile created successfully',
        data: labStaffProfile,
      };
    } catch (error) {
      this.logger.error('Error creating lab staff profile:', error);
      return {
        ok: false,
        message: 'Internal server error',
      };
    }
  }

  async findAll(queryDto: QueryLabStaffProfilesDto): Promise<ApiResponse> {
    try {
      const { labStaffStatus, page = 1, limit = 10 } = queryDto;

      // Build where clause
      const where = {
        deletedAt: null,
        ...(labStaffStatus !== undefined && { labStaffStatus }),
      };

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Get total count
      const total = await this.prisma.labStaffProfile.count({ where });

      // Get lab staff profiles
      const labStaffProfiles = await this.prisma.labStaffProfile.findMany({
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
          hospital: true,
          _count: {
            select: {
              labTests: true,
            },
          },
        },
      });

      const result = {
        labStaffProfiles,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };

      return { ok: true, data: result };
    } catch (error) {
      this.logger.error('Error fetching lab staff profiles:', error);
      return {
        ok: false,
        message: 'Internal server error',
      };
    }
  }

  async findOne(id: string): Promise<ApiResponse> {
    try {
      const labStaffProfile = await this.prisma.labStaffProfile.findUnique({
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
          hospital: true,
          _count: {
            select: {
              labTests: true,
            },
          },
        },
      });

      if (!labStaffProfile || labStaffProfile.deletedAt) {
        return {
          ok: false,
          message: 'Lab staff profile not found',
        };
      }

      return { ok: true, data: labStaffProfile };
    } catch (error) {
      this.logger.error('Error fetching lab staff profile:', error);
      return {
        ok: false,
        message: 'Internal server error',
      };
    }
  }

  async findByUserId(userId: string): Promise<ApiResponse> {
    try {
      const labStaffProfile = await this.prisma.labStaffProfile.findUnique({
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
          hospital: true,
          _count: {
            select: {
              labTests: true,
            },
          },
        },
      });

      if (!labStaffProfile || labStaffProfile.deletedAt) {
        return {
          ok: false,
          message: 'Lab staff profile not found',
        };
      }

      return { ok: true, data: labStaffProfile };
    } catch (error) {
      this.logger.error('Error fetching lab staff profile by user ID:', error);
      return {
        ok: false,
        message: 'Internal server error',
      };
    }
  }

  async updateByUserId(userId: string, updateLabStaffProfileDto: UpdateLabStaffProfileDto): Promise<ApiResponse> {
    try {
      const { licenseExpiryDate, ...updateData } = updateLabStaffProfileDto;

      // Find the lab staff profile by userId
      const labStaffProfile = await this.prisma.labStaffProfile.findUnique({
        where: { userId },
      });

      if (!labStaffProfile || labStaffProfile.deletedAt) {
        return {
          ok: false,
          message: 'Lab staff profile not found',
        };
      }

      // Check if license number is being updated and if it's already in use
      if (updateLabStaffProfileDto.licenseNumber) {
        const existingLicense = await this.prisma.labStaffProfile.findFirst({
          where: {
            licenseNumber: updateLabStaffProfileDto.licenseNumber,
            id: { not: labStaffProfile.id },
          },
        });

        if (existingLicense) {
          return {
            ok: false,
            message: `License number ${updateLabStaffProfileDto.licenseNumber} is already in use`,
          };
        }
      }

      // Update the lab staff profile
      const updatedLabStaffProfile = await this.prisma.labStaffProfile.update({
        where: { userId },
        data: {
          ...updateData,
          licenseExpiryDate: licenseExpiryDate ? new Date(licenseExpiryDate) : undefined,
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
          hospital: true,
          _count: {
            select: {
              labTests: true,
            },
          },
        },
      });

      this.logger.log(`Lab staff profile updated for user: ${userId}`);

      return {
        ok: true,
        message: 'Lab staff profile updated successfully',
        data: updatedLabStaffProfile,
      };
    } catch (error) {
      this.logger.error('Error updating lab staff profile:', error);
      return {
        ok: false,
        message: 'Internal server error',
      };
    }
  }

  async remove(id: string): Promise<ApiResponse> {
    try {
      // Find the lab staff profile
      const labStaffProfile = await this.prisma.labStaffProfile.findUnique({
        where: { id },
      });

      if (!labStaffProfile || labStaffProfile.deletedAt) {
        return {
          ok: false,
          message: 'Lab staff profile not found',
        };
      }

      // Soft delete the lab staff profile
      await this.prisma.labStaffProfile.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      this.logger.log(`Lab staff profile deleted: ${id}`);

      return {
        ok: true,
        message: 'Lab staff profile deleted successfully',
      };
    } catch (error) {
      this.logger.error('Error deleting lab staff profile:', error);
      return {
        ok: false,
        message: 'Internal server error',
      };
    }
  }

  async verifyProfile(id: string): Promise<ApiResponse> {
    try {
      // Find the lab staff profile
      const labStaffProfile = await this.prisma.labStaffProfile.findUnique({
        where: { id },
      });

      if (!labStaffProfile || labStaffProfile.deletedAt) {
        return {
          ok: false,
          message: 'Lab staff profile not found',
        };
      }

      // Update the verification status
      const updatedProfile = await this.prisma.labStaffProfile.update({
        where: { id },
        data: {
          verificationStatus: 'VERIFIED',
          labStaffStatus: 'ACTIVE',
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
          hospital: true,
          _count: {
            select: {
              labTests: true,
            },
          },
        },
      });

      this.logger.log(`Lab staff profile verified: ${id}`);

      return {
        ok: true,
        message: 'Lab staff profile verified successfully',
        data: updatedProfile,
      };
    } catch (error) {
      this.logger.error('Error verifying lab staff profile:', error);
      return {
        ok: false,
        message: 'Internal server error',
      };
    }
  }

  // Helper method to build cache key
  private buildCacheKey(queryDto: QueryLabStaffProfilesDto): string {
    const parts = ['lab-staff-profiles'];
    if (queryDto.labStaffStatus !== undefined) parts.push(`status:${queryDto.labStaffStatus}`);
    parts.push(`page:${queryDto.page || 1}`);
    parts.push(`limit:${queryDto.limit || 10}`);
    return parts.join(':');
  }

  // ======================
  // SELF-SERVICE METHODS FOR LAB STAFF
  // ======================

  async createSelf(userId: string, createDto: CreateLabStaffProfileSelfDto): Promise<ApiResponse> {
    try {
      // Check if lab staff profile already exists
      const existingProfile = await this.prisma.labStaffProfile.findUnique({
        where: { userId },
      });

      if (existingProfile) {
        return {
          ok: false,
          message: 'Lab staff profile already exists for this user',
        };
      }

      // Check if license number is already in use (if provided)
      if (createDto.licenseNumber) {
        const existingLicense = await this.prisma.labStaffProfile.findUnique({
          where: { licenseNumber: createDto.licenseNumber },
        });

        if (existingLicense) {
          return {
            ok: false,
            message: `License number ${createDto.licenseNumber} is already in use`,
          };
        }
      }

      const { licenseExpiryDate, ...profileData } = createDto;

      // Create lab staff profile
      const labStaffProfile = await this.prisma.labStaffProfile.create({
        data: {
          userId,
          licenseNumber: profileData.licenseNumber,
          licenseExpiryDate: licenseExpiryDate ? new Date(licenseExpiryDate) : null,
          hospitalId: profileData.hospitalId,
          yearsOfExperience: profileData.yearsOfExperience,
          qualifications: profileData.qualifications || [],
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
          hospital: true,
        },
      });

      this.logger.log(`Lab staff profile created by user: ${userId}`);

      return {
        ok: true,
        message: 'Lab staff profile created successfully',
        data: labStaffProfile,
      };
    } catch (error) {
      this.logger.error('Error creating lab staff profile:', error);
      return {
        ok: false,
        message: 'Internal server error',
      };
    }
  }

  // Redis-based cache invalidation removed; lab staff profile reads always hit the database.
}
