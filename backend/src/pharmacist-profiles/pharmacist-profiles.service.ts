import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApiResponse } from '../types/api-response.interface';
import { CreatePharmacistProfileDto } from './dto/create-pharmacist-profile.dto';
import { UpdatePharmacistProfileDto } from './dto/update-pharmacist-profile.dto';
import { QueryPharmacistProfilesDto } from './dto/query-pharmacist-profiles.dto';
import { CreatePharmacistProfileSelfDto } from './dto/create-pharmacist-profile-self.dto';

@Injectable()
export class PharmacistProfilesService {
  private readonly logger = new Logger(PharmacistProfilesService.name);
  private readonly CACHE_PREFIX = 'pharmacist-profile:';
  private readonly CACHE_LIST_KEY = 'pharmacist-profiles:list';
  private readonly CACHE_USER_PREFIX = 'pharmacist-profile:user:';
  private readonly CACHE_TTL = 300;

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(userId: string, createPharmacistProfileDto: CreatePharmacistProfileDto): Promise<ApiResponse> {
    try {
      const { licenseNumber, licenseExpiryDate, ...profileData } = createPharmacistProfileDto;

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

      // Check if pharmacist profile already exists for this user
      const existingProfile = await this.prisma.pharmacistProfile.findUnique({
        where: { userId },
      });

      if (existingProfile) {
        return {
          ok: false,
          message: 'Pharmacist profile already exists for this user',
        };
      }

      // Check if license number is already in use
      if (licenseNumber) {
        const existingLicense = await this.prisma.pharmacistProfile.findUnique({
          where: { licenseNumber },
        });

        if (existingLicense) {
          return {
            ok: false,
            message: `License number ${licenseNumber} is already in use`,
          };
        }
      }

      // Create pharmacist profile
      const pharmacistProfile = await this.prisma.pharmacistProfile.create({
        data: {
          userId,
          licenseNumber,
          licenseExpiryDate: licenseExpiryDate ? new Date(licenseExpiryDate) : null,
          hospitalId: profileData.hospitalId,
          yearsOfExperience: profileData.yearsOfExperience,
          qualifications: profileData.qualifications || [],
          pharmacistStatus: profileData.pharmacistStatus,
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
              prescriptions: true,
            },
          },
        },
      });

      this.logger.log(`Pharmacist profile created: ${pharmacistProfile.id}`);

      return {
        ok: true,
        message: 'Pharmacist profile created successfully',
        data: pharmacistProfile,
      };
    } catch (error) {
      this.logger.error('Error creating pharmacist profile:', error);
      return {
        ok: false,
        message: 'Internal server error',
      };
    }
  }

  async findAll(queryDto: QueryPharmacistProfilesDto): Promise<ApiResponse> {
    try {
      const { pharmacistStatus, page = 1, limit = 10 } = queryDto;

      // Build where clause
      const where = {
        deletedAt: null,
        ...(pharmacistStatus !== undefined && { pharmacistStatus }),
      };

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Get total count
      const total = await this.prisma.pharmacistProfile.count({ where });

      // Get pharmacist profiles
      const pharmacistProfiles = await this.prisma.pharmacistProfile.findMany({
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
              prescriptions: true,
            },
          },
        },
      });

      const result = {
        pharmacistProfiles,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };

      return { ok: true, data: result };
    } catch (error) {
      this.logger.error('Error fetching pharmacist profiles:', error);
      return {
        ok: false,
        message: 'Internal server error',
      };
    }
  }

  async findOne(id: string): Promise<ApiResponse> {
    try {
      const pharmacistProfile = await this.prisma.pharmacistProfile.findUnique({
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
              prescriptions: true,
            },
          },
        },
      });

      if (!pharmacistProfile || pharmacistProfile.deletedAt) {
        return {
          ok: false,
          message: 'Pharmacist profile not found',
        };
      }

      return { ok: true, data: pharmacistProfile };
    } catch (error) {
      this.logger.error('Error fetching pharmacist profile:', error);
      return {
        ok: false,
        message: 'Internal server error',
      };
    }
  }

  async findByUserId(userId: string): Promise<ApiResponse> {
    try {
      const pharmacistProfile = await this.prisma.pharmacistProfile.findUnique({
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
              prescriptions: true,
            },
          },
        },
      });

      if (!pharmacistProfile || pharmacistProfile.deletedAt) {
        return {
          ok: false,
          message: 'Pharmacist profile not found',
        };
      }

      return { ok: true, data: pharmacistProfile };
    } catch (error) {
      this.logger.error('Error fetching pharmacist profile by user ID:', error);
      return {
        ok: false,
        message: 'Internal server error',
      };
    }
  }

  async updateByUserId(userId: string, updatePharmacistProfileDto: UpdatePharmacistProfileDto): Promise<ApiResponse> {
    try {
      const { licenseExpiryDate, ...updateData } = updatePharmacistProfileDto;

      // Find the pharmacist profile by userId
      const pharmacistProfile = await this.prisma.pharmacistProfile.findUnique({
        where: { userId },
      });

      if (!pharmacistProfile || pharmacistProfile.deletedAt) {
        return {
          ok: false,
          message: 'Pharmacist profile not found',
        };
      }

      // Check if license number is being updated and if it's already in use
      if (updatePharmacistProfileDto.licenseNumber) {
        const existingLicense = await this.prisma.pharmacistProfile.findFirst({
          where: {
            licenseNumber: updatePharmacistProfileDto.licenseNumber,
            id: { not: pharmacistProfile.id },
          },
        });

        if (existingLicense) {
          return {
            ok: false,
            message: `License number ${updatePharmacistProfileDto.licenseNumber} is already in use`,
          };
        }
      }

      // Update the pharmacist profile
      const updatedPharmacistProfile = await this.prisma.pharmacistProfile.update({
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
              prescriptions: true,
            },
          },
        },
      });

      this.logger.log(`Pharmacist profile updated for user: ${userId}`);

      return {
        ok: true,
        message: 'Pharmacist profile updated successfully',
        data: updatedPharmacistProfile,
      };
    } catch (error) {
      this.logger.error('Error updating pharmacist profile:', error);
      return {
        ok: false,
        message: 'Internal server error',
      };
    }
  }

  async remove(id: string): Promise<ApiResponse> {
    try {
      // Find the pharmacist profile
      const pharmacistProfile = await this.prisma.pharmacistProfile.findUnique({
        where: { id },
      });

      if (!pharmacistProfile || pharmacistProfile.deletedAt) {
        return {
          ok: false,
          message: 'Pharmacist profile not found',
        };
      }

      // Soft delete the pharmacist profile
      await this.prisma.pharmacistProfile.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      this.logger.log(`Pharmacist profile deleted: ${id}`);

      return {
        ok: true,
        message: 'Pharmacist profile deleted successfully',
      };
    } catch (error) {
      this.logger.error('Error deleting pharmacist profile:', error);
      return {
        ok: false,
        message: 'Internal server error',
      };
    }
  }

  async verifyProfile(id: string): Promise<ApiResponse> {
    try {
      // Find the pharmacist profile
      const pharmacistProfile = await this.prisma.pharmacistProfile.findUnique({
        where: { id },
      });

      if (!pharmacistProfile || pharmacistProfile.deletedAt) {
        return {
          ok: false,
          message: 'Pharmacist profile not found',
        };
      }

      // Update the verification status
      const updatedProfile = await this.prisma.pharmacistProfile.update({
        where: { id },
        data: {
          verificationStatus: 'VERIFIED',
          pharmacistStatus: 'ACTIVE',
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
              prescriptions: true,
            },
          },
        },
      });

      this.logger.log(`Pharmacist profile verified: ${id}`);

      return {
        ok: true,
        message: 'Pharmacist profile verified successfully',
        data: updatedProfile,
      };
    } catch (error) {
      this.logger.error('Error verifying pharmacist profile:', error);
      return {
        ok: false,
        message: 'Internal server error',
      };
    }
  }

  // Helper method to build cache key
  private buildCacheKey(queryDto: QueryPharmacistProfilesDto): string {
    const parts = ['pharmacist-profiles'];
    if (queryDto.pharmacistStatus !== undefined) parts.push(`status:${queryDto.pharmacistStatus}`);
    parts.push(`page:${queryDto.page || 1}`);
    parts.push(`limit:${queryDto.limit || 10}`);
    return parts.join(':');
  }

  // ======================
  // SELF-SERVICE METHODS FOR PHARMACISTS
  // ======================

  async createSelf(userId: string, createDto: CreatePharmacistProfileSelfDto): Promise<ApiResponse> {
    try {
      // Check if pharmacist profile already exists
      const existingProfile = await this.prisma.pharmacistProfile.findUnique({
        where: { userId },
      });

      if (existingProfile) {
        return {
          ok: false,
          message: 'Pharmacist profile already exists for this user',
        };
      }

      // Check if license number is already in use
      if (createDto.licenseNumber) {
        const existingLicense = await this.prisma.pharmacistProfile.findUnique({
          where: { licenseNumber: createDto.licenseNumber },
        });

        if (existingLicense) {
          return {
            ok: false,
            message: `License number ${createDto.licenseNumber} is already in use`,
          };
        }
      }

      // Create pharmacist profile (simplified version)
      const pharmacistProfile = await this.prisma.pharmacistProfile.create({
        data: {
          userId,
          licenseNumber: createDto.licenseNumber,
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

      this.logger.log(`Pharmacist profile created by user: ${userId}`);

      return {
        ok: true,
        message: 'Pharmacist profile created successfully',
        data: pharmacistProfile,
      };
    } catch (error) {
      this.logger.error('Error creating pharmacist profile:', error);
      return {
        ok: false,
        message: 'Internal server error',
      };
    }
  }

  // Redis-based cache invalidation removed; pharmacist profile reads always hit the database.
}
