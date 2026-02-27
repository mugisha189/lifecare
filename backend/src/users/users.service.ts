import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma, VerificationStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { hashOtp } from '../utils/otp.util';
import { ApiResponse } from '../types/api-response.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SuspendUserDto } from './dto/suspend-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly CACHE_PREFIX = 'user:';
  private readonly CACHE_LIST_KEY = 'users:list';
  private readonly CACHE_TTL = 300;

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) { }

  /**
   * @description ADMIN REGISTRATION - Creates user account (no auth tokens)
   * @param createUserDto User data for registration
   * @param options Optional: sendWelcomeEmail, sendVerification (default: true)
   * @returns ApiResponse with created user data
   * @note Sends OTP via email & SMS. Called by admin endpoints or AuthService.register()
   */
  async create(
    createUserDto: CreateUserDto,
    options?: { sendWelcomeEmail?: boolean; sendVerification?: boolean }
  ): Promise<ApiResponse> {
    try {
      // Check if user already exists (excluding soft-deleted users)
      const existingUser = await this.prisma.user.findFirst({
        where: {
          OR: [{ email: createUserDto.email }, { phoneNumber: createUserDto.phoneNumber }],
          deletedAt: null,
        },
      });

      if (existingUser) {
        throw new ConflictException(
          'Email or phone number already exists'
        );
      }

      // Check if role exists
      const role = await this.prisma.role.findUnique({
        where: { id: createUserDto.roleId },
      });

      if (!role) {
        throw new NotFoundException(
          `Role not found: ${createUserDto.roleId}`
        );
      }

      // Hash password if provided
      let passwordHash: string | undefined;
      if (createUserDto.password) {
        passwordHash = await bcrypt.hash(createUserDto.password, 10);
      }

      // Create user (auto-verify users created by admin)
      const user = await this.prisma.user.create({
        data: {
          name: createUserDto.name,
          email: createUserDto.email,
          phoneNumber: createUserDto.phoneNumber,
          roleId: createUserDto.roleId,
          gender: createUserDto.gender,
          nid: createUserDto.nid,
          profilePicture: createUserDto.profilePicture,
          country: createUserDto.country || 'Rwanda',
          city: createUserDto.city,
          passwordHash,
          verificationStatus: VerificationStatus.VERIFIED,
          isEmailVerified: true,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
          gender: true,
          country: true,
          city: true,
          verificationStatus: true,
          isEmailVerified: true,
          createdAt: true,
          role: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
      });

      // Generate and send OTP for verification (if requested, default true for admin-created users)
      if (options?.sendVerification !== false) {
        const otp = this.mailService.generateOTP();

        // Store OTP in database with expiration (10 minutes)
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 10);

        // Hash OTP before storing (security best practice)
        const hashedOtp = hashOtp(otp);

        await this.prisma.verificationToken.create({
          data: {
            userId: user.id,
            token: hashedOtp,
            type: 'EMAIL_VERIFICATION',
            expiresAt,
          },
        });

        // Send verification email with OTP
        try {
          await this.mailService.sendOTPEmail({
            email: user.email,
            name: user.name,
            otp,
          });
        } catch (emailError) {
          this.logger.warn(`Failed to send verification email to ${user.email}:`, emailError);
          // Continue execution even if email fails
        }

        // SMS service removed - verification is done via email only
      }

      // Send welcome email if requested (typically for admin-created users)
      if (options?.sendWelcomeEmail) {
        try {
          await this.mailService.sendWelcomeEmail({
            email: user.email,
            name: user.name,
          });
        } catch (emailError) {
          this.logger.warn(`Failed to send welcome email to ${user.email}:`, emailError);
          // Continue execution even if email fails
        }
      }

      this.logger.log(`User created successfully (admin registration): ${user.id}`);

      return {
        ok: true,
        message: 'User created successfully',
        data: user,
      };
    } catch (error) {
      this.logger.error('Error creating user:', error);

      if (error instanceof ConflictException || error instanceof NotFoundException) {
        return {
          ok: false,
          message: error.message,
        };
      }

      return {
        ok: false,
        message: 'Failed to create user',
      };
    }
  }

  async getRoles(): Promise<ApiResponse> {
    try {
      const roles = await this.prisma.role.findMany({
        select: {
          id: true,
          name: true,
          description: true,
        },
        orderBy: { name: 'asc' },
      });

      return {
        ok: true,
        data: roles,
      };
    } catch (error) {
      this.logger.error('Error retrieving roles:', error);
      return {
        ok: false,
        message: 'Failed to retrieve roles',
      };
    }
  }

  async findAll(): Promise<ApiResponse> {
    try {
      const users = await this.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
          gender: true,
          profilePicture: true,
          country: true,
          city: true,
          verificationStatus: true,
          isEmailVerified: true,
          isAccountSuspended: true,
          active: true,
          lastLogin: true,
          createdAt: true,
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return {
        ok: true,
        data: users,
      };
    } catch (error) {
      this.logger.error('Error fetching users:', error);
      return {
        ok: false,
        message: 'Failed to retrieve users list',
      };
    }
  }

  async findOne(id: string): Promise<ApiResponse> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
          gender: true,
          nid: true,
          profilePicture: true,
          country: true,
          city: true,
          verificationStatus: true,
          isEmailVerified: true,
          isAccountSuspended: true,
          active: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
          role: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
      });

      if (!user) {
        return {
          ok: false,
          message: `User not found: ${id}`,
        };
      }

      return {
        ok: true,
        data: user,
      };
    } catch (error) {
      this.logger.error(`Error fetching user ${id}:`, error);

      if (error instanceof NotFoundException) {
        return {
          ok: false,
          message: error.message,
        };
      }

      return {
        ok: false,
        message: 'Failed to retrieve user',
      };
    }
  }

  async searchUsers(query?: string, roleName?: string, limit: number = 20): Promise<ApiResponse> {
    try {
      const whereConditions: any = {
        deletedAt: null,
      };

      // Filter by role if provided
      if (roleName) {
        whereConditions.role = {
          name: roleName,
        };
        // When searching for PATIENT, only return users who have completed patient profile (so they can be used in consultations)
        if (roleName === 'PATIENT') {
          whereConditions.patientProfile = {
            isNot: null,
          };
        }
      }

      // Search conditions
      if (query && query.trim()) {
        const searchQuery = query.trim().toLowerCase();
        whereConditions.OR = [
          { name: { contains: searchQuery, mode: 'insensitive' } },
          { email: { contains: searchQuery, mode: 'insensitive' } },
          { phoneNumber: { contains: searchQuery, mode: 'insensitive' } },
          { nid: { contains: searchQuery, mode: 'insensitive' } },
        ];
      }

      const users = await this.prisma.user.findMany({
        where: whereConditions,
        take: limit,
        orderBy: {
          name: 'asc',
        },
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
          nid: true,
          profilePicture: true,
          verificationStatus: true,
          active: true,
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return {
        ok: true,
        data: users,
      };
    } catch (error) {
      this.logger.error('Error searching users:', error);
      return {
        ok: false,
        message: 'Failed to search users',
      };
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<ApiResponse> {
    try {
      // Check if user exists
      const existingUser = await this.findOne(id);
      if (!existingUser.ok) {
        return existingUser;
      }

      // Check for duplicate email or phone
      if (updateUserDto.email || updateUserDto.phoneNumber) {
        const duplicate = await this.prisma.user.findFirst({
          where: {
            AND: [
              { id: { not: id } },
              {
                OR: [
                  ...(updateUserDto.email ? [{ email: updateUserDto.email }] : []),
                  ...(updateUserDto.phoneNumber ? [{ phoneNumber: updateUserDto.phoneNumber }] : []),
                ],
              },
            ],
          },
        });

        if (duplicate) {
          throw new ConflictException(
            'Email or phone number is already in use'
          );
        }
      }

      // Prepare update data with proper typing
      const updateData: Prisma.UserUpdateInput = {};

      // Copy all fields except password
      Object.keys(updateUserDto).forEach(key => {
        if (key !== 'password') {
          updateData[key as keyof Prisma.UserUpdateInput] = updateUserDto[key as keyof UpdateUserDto];
        }
      });

      // Hash password if provided
      if (updateUserDto.password) {
        updateData.passwordHash = await bcrypt.hash(updateUserDto.password, 10);
      }

      await this.prisma.user.update({
        where: { id },
        data: updateData,
      });

      // Invalidate cache

      this.logger.log(`User updated successfully: ${id}`);

      return {
        ok: true,
        message: 'User updated successfully',
      };
    } catch (error) {
      this.logger.error(`Error updating user ${id}:`, error);

      if (error instanceof ConflictException) {
        return {
          ok: false,
          message: error.message,
        };
      }

      return {
        ok: false,
        message: 'Failed to update user',
      };
    }
  }

  async remove(id: string): Promise<ApiResponse> {
    try {
      // Check if user exists
      const existingUser = await this.findOne(id);
      if (!existingUser.ok) {
        return existingUser;
      }

      // Soft delete the user
      await this.prisma.user.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          active: false,
        },
      });

      // Invalidate cache

      this.logger.log(`User soft deleted: ${id}`);

      return {
        ok: true,
        message: 'User deleted successfully',
      };
    } catch (error) {
      this.logger.error(`Error deleting user ${id}:`, error);

      return {
        ok: false,
        message: 'Failed to delete user',
      };
    }
  }

  async toggleActivation(id: string, active: boolean): Promise<ApiResponse> {
    try {
      // Check if user exists
      const existingUser = await this.findOne(id);
      if (!existingUser.ok) {
        return existingUser;
      }

      // Update active status
      await this.prisma.user.update({
        where: { id },
        data: { active },
      });

      // Invalidate cache

      this.logger.log(`User ${active ? 'activated' : 'deactivated'}: ${id}`);

      return {
        ok: true,
        message: active ? 'User activated successfully' : 'User deactivated successfully',
      };
    } catch (error) {
      this.logger.error(`Error toggling activation for user ${id}:`, error);

      return {
        ok: false,
        message: 'Failed to update user',
      };
    }
  }

  async suspendUser(id: string, suspensionData: SuspendUserDto, suspendedById?: string): Promise<ApiResponse> {
    try {
      // Check if user exists
      const existingUser = await this.findOne(id);
      if (!existingUser.ok) {
        return existingUser;
      }

      const user = existingUser.data as {
        email: string;
        name: string;
      };

      // Suspend user
      await this.prisma.user.update({
        where: { id },
        data: { isAccountSuspended: true },
      });

      // Create suspension history record
      await this.prisma.suspensionHistory.create({
        data: {
          userId: id,
          reason: suspensionData.reason,
          additionalNotes: suspensionData.additionalNotes,
          suspendedUntil: suspensionData.suspendedUntil ? new Date(suspensionData.suspendedUntil) : null,
          suspendedById,
        },
      });

      // Send suspension email
      try {
        await this.mailService.sendAccountSuspensionEmail({
          email: user.email,
          name: user.name,
          reason: suspensionData.reason,
          suspendedUntil: suspensionData.suspendedUntil ? new Date(suspensionData.suspendedUntil) : undefined,
        });
      } catch (emailError) {
        this.logger.warn(`Failed to send suspension email to ${user.email}:`, emailError);
        // Continue execution even if email fails
      }

      // Invalidate cache

      this.logger.log(`User suspended: ${id}`);

      return {
        ok: true,
        message: 'User suspended successfully',
      };
    } catch (error) {
      this.logger.error(`Error suspending user ${id}:`, error);

      return {
        ok: false,
        message: 'Failed to suspend user',
      };
    }
  }

  async unsuspendUser(id: string): Promise<ApiResponse> {
    try {
      // Check if user exists
      const existingUser = await this.findOne(id);
      if (!existingUser.ok) {
        return existingUser;
      }

      const user = existingUser.data as {
        email: string;
        name: string;
      };

      // Unsuspend user
      await this.prisma.user.update({
        where: { id },
        data: { isAccountSuspended: false },
      });

      // Send unsuspension email
      try {
        await this.mailService.sendAccountUnsuspensionEmail({
          email: user.email,
          name: user.name,
        });
      } catch (emailError) {
        this.logger.warn(`Failed to send unsuspension email to ${user.email}:`, emailError);
        // Continue execution even if email fails
      }

      // Invalidate cache

      this.logger.log(`User unsuspended: ${id}`);

      return {
        ok: true,
        message: 'User unsuspended successfully',
      };
    } catch (error) {
      this.logger.error(`Error unsuspending user ${id}:`, error);

      return {
        ok: false,
        message: 'Failed to unsuspend user',
      };
    }
  }

  async getUserActivity(id: string): Promise<ApiResponse> {
    try {
      // Check if user exists
      const existingUser = await this.findOne(id);
      if (!existingUser.ok) {
        return existingUser;
      }

      // Get user activities
      const activities = await this.prisma.userActivity.findMany({
        where: { userId: id },
        orderBy: { activityTime: 'desc' },
        take: 100, // Limit to last 100 activities
        select: {
          id: true,
          activityType: true,
          activityTime: true,
          ipAddress: true,
          userAgent: true,
          metadata: true,
          createdAt: true,
        },
      });

      return {
        ok: true,
        data: activities,
      };
    } catch (error) {
      this.logger.error(`Error fetching activities for user ${id}:`, error);

      return {
        ok: false,
        message: 'Failed to retrieve user activity',
      };
    }
  }

  // Redis-based cache invalidation removed; user reads always hit the database.
}
