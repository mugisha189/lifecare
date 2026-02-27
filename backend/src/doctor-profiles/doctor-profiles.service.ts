import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApiResponse } from '../types/api-response.interface';
import { CreateDoctorProfileDto } from './dto/create-doctor-profile.dto';
import { UpdateDoctorProfileDto } from './dto/update-doctor-profile.dto';
import { QueryDoctorProfilesDto } from './dto/query-doctor-profiles.dto';
import { CreateDoctorProfileSelfDto } from './dto/create-doctor-profile-self.dto';

@Injectable()
export class DoctorProfilesService {
  private readonly logger = new Logger(DoctorProfilesService.name);
  private readonly CACHE_PREFIX = 'doctor-profile:';
  private readonly CACHE_LIST_KEY = 'doctor-profiles:list';
  private readonly CACHE_USER_PREFIX = 'doctor-profile:user:';
  private readonly CACHE_TTL = 300;

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(userId: string, createDoctorProfileDto: CreateDoctorProfileDto): Promise<ApiResponse> {
    try {
      const { licenseNumber, licenseExpiryDate, documents, ...profileData } = createDoctorProfileDto;

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

      // Check if doctor profile already exists for this user
      const existingProfile = await this.prisma.doctorProfile.findUnique({
        where: { userId },
      });

      if (existingProfile) {
        return {
          ok: false,
          message: 'Doctor profile already exists for this user',
        };
      }

      // Check if license number is already in use
      if (licenseNumber) {
        const existingLicense = await this.prisma.doctorProfile.findUnique({
          where: { licenseNumber },
        });

        if (existingLicense) {
          return {
            ok: false,
            message: `License number ${licenseNumber} is already in use`,
          };
        }
      }

      // Create doctor profile with documents
      const doctorProfile = await this.prisma.doctorProfile.create({
        data: {
          userId,
          licenseNumber,
          licenseExpiryDate: licenseExpiryDate ? new Date(licenseExpiryDate) : null,
          specialization: profileData.specialization,
          yearsOfExperience: profileData.yearsOfExperience,
          qualifications: profileData.qualifications || [],
          bio: profileData.bio,
          hospitalId: profileData.hospitalId,
          emergencyContactName: profileData.emergencyContactName,
          emergencyContactPhone: profileData.emergencyContactPhone,
          doctorStatus: profileData.doctorStatus,
          doctorDocuments: {
            create: documents.map(doc => ({
              documentType: doc.documentType,
              documentURL: doc.documentURL,
              expiryDate: doc.expiryDate ? new Date(doc.expiryDate) : null,
              status: 'PENDING',
            })),
          },
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
          doctorDocuments: true,
          _count: {
            select: {
              doctorDocuments: true,
              consultations: true,
              reviews: true,
            },
          },
        },
      });

      this.logger.log(`Doctor profile created with ${documents.length} documents: ${doctorProfile.id}`);

      return {
        ok: true,
        message: 'Doctor profile created successfully',
        data: doctorProfile,
      };
    } catch (error) {
      this.logger.error('Error creating doctor profile:', error);
      return {
        ok: false,
        message: 'Internal server error',
      };
    }
  }

  async findAll(queryDto: QueryDoctorProfilesDto): Promise<ApiResponse> {
    try {
      const { areDocumentsVerified, minRating, doctorStatus, page = 1, limit = 10 } = queryDto;

      // Build where clause
      const where = {
        deletedAt: null,
        ...(areDocumentsVerified !== undefined && { areDocumentsVerified }),
        ...(minRating !== undefined && { averageRating: { gte: minRating } }),
        ...(doctorStatus !== undefined && { doctorStatus }),
      };

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Get total count
      const total = await this.prisma.doctorProfile.count({ where });

      // Get doctor profiles
      const doctorProfiles = await this.prisma.doctorProfile.findMany({
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
          doctorDocuments: {
            where: { deletedAt: null },
          },
          _count: {
            select: {
              doctorDocuments: true,
              consultations: true,
              reviews: true,
            },
          },
        },
      });

      const result = {
        doctorProfiles,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };

      return { ok: true, data: result };
    } catch (error) {
      this.logger.error('Error fetching doctor profiles:', error);
      return {
        ok: false,
        message: 'Internal server error',
      };
    }
  }

  async findOne(id: string): Promise<ApiResponse> {
    try {
      const doctorProfile = await this.prisma.doctorProfile.findUnique({
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
          doctorDocuments: {
            where: { deletedAt: null },
          },
          _count: {
            select: {
              consultations: true,
              reviews: true,
            },
          },
        },
      });

      if (!doctorProfile || doctorProfile.deletedAt) {
        return {
          ok: false,
          message: 'Doctor profile not found',
        };
      }

      return { ok: true, data: doctorProfile };
    } catch (error) {
      this.logger.error('Error fetching doctor profile:', error);
      return {
        ok: false,
        message: 'Internal server error',
      };
    }
  }

  async findByUserId(userId: string): Promise<ApiResponse> {
    try {
      const doctorProfile = await this.prisma.doctorProfile.findUnique({
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
          doctorDocuments: {
            where: { deletedAt: null },
          },
          _count: {
            select: {
              consultations: true,
              reviews: true,
            },
          },
        },
      });

      if (!doctorProfile || doctorProfile.deletedAt) {
        return {
          ok: false,
          message: 'Doctor profile not found',
        };
      }

      return { ok: true, data: doctorProfile };
    } catch (error) {
      this.logger.error('Error fetching doctor profile by user ID:', error);
      return {
        ok: false,
        message: 'Internal server error',
      };
    }
  }

  async updateByUserId(userId: string, updateDoctorProfileDto: UpdateDoctorProfileDto): Promise<ApiResponse> {
    try {
      const { licenseExpiryDate, documents, ...updateData } = updateDoctorProfileDto;

      // Find the doctor profile by userId
      const doctorProfile = await this.prisma.doctorProfile.findUnique({
        where: { userId },
      });

      if (!doctorProfile || doctorProfile.deletedAt) {
        return {
          ok: false,
          message: 'Doctor profile not found',
        };
      }

      // Check if license number is being updated and if it's already in use
      if (updateDoctorProfileDto.licenseNumber) {
        const existingLicense = await this.prisma.doctorProfile.findFirst({
          where: {
            licenseNumber: updateDoctorProfileDto.licenseNumber,
            id: { not: doctorProfile.id },
          },
        });

        if (existingLicense) {
          return {
            ok: false,
            message: `License number ${updateDoctorProfileDto.licenseNumber} is already in use`,
          };
        }
      }

      // If documents are provided, delete old ones and add new ones
      if (documents && documents.length > 0) {
        // Delete existing documents
        await this.prisma.doctorDocument.deleteMany({
          where: { doctorProfileId: doctorProfile.id },
        });
      }

      // Update the doctor profile
      const updatedDoctorProfile = await this.prisma.doctorProfile.update({
        where: { userId },
        data: {
          ...updateData,
          licenseExpiryDate: licenseExpiryDate ? new Date(licenseExpiryDate) : undefined,
          ...(documents &&
            documents.length > 0 && {
              doctorDocuments: {
                create: documents.map(doc => ({
                  documentType: doc.documentType,
                  documentURL: doc.documentURL,
                  expiryDate: doc.expiryDate ? new Date(doc.expiryDate) : null,
                  status: 'PENDING',
                })),
              },
            }),
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
          doctorDocuments: {
            where: { deletedAt: null },
          },
          _count: {
            select: {
              doctorDocuments: true,
              consultations: true,
              reviews: true,
            },
          },
        },
      });

      this.logger.log(
        `Doctor profile updated for user: ${userId}${documents ? ` with ${documents.length} documents` : ''}`
      );

      return {
        ok: true,
        message: 'Doctor profile updated successfully',
        data: updatedDoctorProfile,
      };
    } catch (error) {
      this.logger.error('Error updating doctor profile:', error);
      return {
        ok: false,
        message: 'Internal server error',
      };
    }
  }

  async remove(id: string): Promise<ApiResponse> {
    try {
      // Find the doctor profile
      const doctorProfile = await this.prisma.doctorProfile.findUnique({
        where: { id },
      });

      if (!doctorProfile || doctorProfile.deletedAt) {
        return {
          ok: false,
          message: 'Doctor profile not found',
        };
      }

      // Soft delete the doctor profile
      await this.prisma.doctorProfile.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      this.logger.log(`Doctor profile deleted: ${id}`);

      return {
        ok: true,
        message: 'Doctor profile deleted successfully',
      };
    } catch (error) {
      this.logger.error('Error deleting doctor profile:', error);
      return {
        ok: false,
        message: 'Internal server error',
      };
    }
  }

  async verifyProfile(id: string): Promise<ApiResponse> {
    try {
      // Find the doctor profile
      const doctorProfile = await this.prisma.doctorProfile.findUnique({
        where: { id },
      });

      if (!doctorProfile || doctorProfile.deletedAt) {
        return {
          ok: false,
          message: 'Doctor profile not found',
        };
      }

      // Simply update the verification status
      const updatedProfile = await this.prisma.doctorProfile.update({
        where: { id },
        data: {
          verificationStatus: 'VERIFIED',
          areDocumentsVerified: true,
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
          hospital: true,
          doctorDocuments: {
            where: { deletedAt: null },
          },
          _count: {
            select: {
              doctorDocuments: true,
              consultations: true,
              reviews: true,
            },
          },
        },
      });

      this.logger.log(`Doctor profile verified: ${id}`);

      return {
        ok: true,
        message: 'Doctor profile verified successfully',
        data: updatedProfile,
      };
    } catch (error) {
      this.logger.error('Error verifying doctor profile:', error);
      return {
        ok: false,
        message: 'Internal server error',
      };
    }
  }

  // Helper method to build cache key
  private buildCacheKey(queryDto: QueryDoctorProfilesDto): string {
    const parts = ['doctor-profiles'];
    if (queryDto.areDocumentsVerified !== undefined) parts.push(`verified:${queryDto.areDocumentsVerified}`);
    if (queryDto.minRating !== undefined) parts.push(`rating:${queryDto.minRating}`);
    if (queryDto.doctorStatus !== undefined) parts.push(`status:${queryDto.doctorStatus}`);
    parts.push(`page:${queryDto.page || 1}`);
    parts.push(`limit:${queryDto.limit || 10}`);
    return parts.join(':');
  }

  // ======================
  // SELF-SERVICE METHODS FOR DOCTORS
  // ======================

  async createSelf(userId: string, createDto: CreateDoctorProfileSelfDto): Promise<ApiResponse> {
    try {
      // Check if doctor profile already exists
      const existingProfile = await this.prisma.doctorProfile.findUnique({
        where: { userId },
      });

      if (existingProfile) {
        return {
          ok: false,
          message: 'Doctor profile already exists for this user',
        };
      }

      // Check if license number is already in use
      if (createDto.licenseNumber) {
        const existingLicense = await this.prisma.doctorProfile.findUnique({
          where: { licenseNumber: createDto.licenseNumber },
        });

        if (existingLicense) {
          return {
            ok: false,
            message: `License number ${createDto.licenseNumber} is already in use`,
          };
        }
      }

      // Create doctor profile (simplified version)
      const doctorProfile = await this.prisma.doctorProfile.create({
        data: {
          userId,
          licenseNumber: createDto.licenseNumber,
          specialization: createDto.specialization,
          qualifications: createDto.qualifications || [],
          bio: createDto.bio,
          hospitalId: createDto.hospitalId,
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

      this.logger.log(`Doctor profile created successfully for user: ${userId}`);

      return {
        ok: true,
        message: 'Doctor profile created successfully',
        data: doctorProfile,
      };
    } catch (error) {
      this.logger.error('Error creating doctor profile:', error);
      return {
        ok: false,
        message: 'Internal server error',
      };
    }
  }

  // ======================
  // HELPER METHODS
  // ======================

  private async updateDoctorProfileFlags(doctorProfileId: string): Promise<void> {
    try {
      // Get all documents
      const documents = await this.prisma.doctorDocument.findMany({
        where: {
          doctorProfileId,
          deletedAt: null,
        },
      });

      const hasUploadedDocuments = documents.length > 0;
      const areDocumentsVerified = hasUploadedDocuments && documents.every(doc => doc.status === 'APPROVED');

      // Update doctor profile
      await this.prisma.doctorProfile.update({
        where: { id: doctorProfileId },
        data: {
          hasUploadedDocuments,
          areDocumentsVerified,
          lastDocumentUploadAt: hasUploadedDocuments ? new Date() : null,
          documentUploadAttempts: hasUploadedDocuments ? { increment: 1 } : undefined,
        },
      });
    } catch (error) {
      this.logger.error('Error updating doctor profile flags:', error);
    }
  }

  // Redis-based cache invalidation removed; doctor profile reads always hit the database.
}
