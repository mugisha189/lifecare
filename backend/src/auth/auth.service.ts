import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ActivityType } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import type { StringValue } from 'ms';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { ApiResponse } from '../types/api-response.interface';
import { UsersService } from '../users/users.service';
import { hashOtp } from '../utils/otp.util';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SwitchRoleDto } from './dto/switch-role.dto';

export interface JwtPayload {
  sub: string;
  email: string;
  roleId: string;
  roleName: string;
  type: 'access' | 'refresh';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
  ) {}

  /**
   * @description SELF-REGISTRATION - User signup with auth tokens
   * @param registerDto User registration data
   * @returns ApiResponse with user, access/refresh tokens, and verification status
   * @note Calls UsersService.create() + generates JWT tokens. Sends OTP via email & SMS
   */
  async register(registerDto: RegisterDto): Promise<ApiResponse> {
    try {
      // If no roleId provided, default to PATIENT (for mobile app registrations)
      let roleId = registerDto.roleId;
      if (!roleId) {
        const patientRole = await this.prisma.role.findFirst({
          where: { name: 'PATIENT' },
        });
        
        if (!patientRole) {
          return {
            ok: false,
            message: 'Patient role not found. Please contact support.',
          };
        }
        
        roleId = patientRole.id;
        this.logger.log('No roleId provided, defaulting to PATIENT role');
      }
      
      // Delegate user creation to UsersService
      // Skip verification - users are auto-verified
      const createUserResult = await this.usersService.create(
        {
          name: registerDto.name,
          email: registerDto.email,
          phoneNumber: registerDto.phoneNumber,
          roleId: roleId,
          gender: registerDto.gender,
          country: registerDto.country,
          city: registerDto.city,
          password: registerDto.password,
        },
        { sendVerification: false }
      );

      if (!createUserResult.ok || !createUserResult.data) {
        return createUserResult;
      }

      const user = createUserResult.data as {
        id: string;
        name: string;
        email: string;
        phoneNumber: string;
        role: { id: string; name: string };
      };

      // Log activity
      await this.logUserActivity(user.id, ActivityType.SIGN_UP);

      // Generate tokens (only for self-registration)
      const tokens = await this.generateTokens(user.id, user.email, user.role.id, user.role.name);

      this.logger.log(`User registered successfully (self-registration): ${user.id}`);

      return {
        ok: true,
        message: 'Registration successful.',
        data: {
          user,
          ...tokens,
          requiresVerification: false,
        },
      };
    } catch (error) {
      this.logger.error('Error during registration:', error);
      return {
        ok: false,
        message: 'Registration failed. Please try again.',
      };
    }
  }

  async login(loginDto: LoginDto): Promise<ApiResponse> {
    try {
      // Find user by email or phone number
      const user = await this.prisma.user.findFirst({
        where: {
          OR: [{ email: loginDto.identifier }, { phoneNumber: loginDto.identifier }],
          deletedAt: null,
        },
        include: {
          role: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
          doctorProfile: {
            select: {
              id: true,
            },
          },
          pharmacistProfile: {
            select: {
              id: true,
            },
          },
          labStaffProfile: {
            select: {
              id: true,
            },
          },
          patientProfile: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid email/phone or password');
      }

      // Check if account is suspended
      if (user.isAccountSuspended) {
        return {
          ok: false,
          message: 'Your account has been suspended. Please contact support.',
        };
      }

      // Check if account is active
      if (!user.active) {
        return {
          ok: false,
          message: 'Your account is inactive. Please contact support.',
        };
      }

      // Verify password
      if (!user.passwordHash) {
        return {
          ok: false,
          message: 'Password not set. Please set your password first.',
        };
      }

      const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid email/phone or password');
      }

      // Update last login
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });

      // Log activity
      await this.logUserActivity(user.id, ActivityType.LOG_IN, {
        ipAddress: loginDto.ipAddress,
        userAgent: loginDto.userAgent,
      });

      // Generate tokens
      const tokens = await this.generateTokens(user.id, user.email, user.role.id, user.role.name);

      // Prepare user data (exclude passwordHash)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash: _passwordHash, ...userData } = user;

      this.logger.log(`User logged in successfully: ${user.id}`);

      return {
        ok: true,
        message: 'Login successful',
        data: {
          user: userData,
          ...tokens,
        },
      };
    } catch (error) {
      this.logger.error('Error during login:', error);

      if (error instanceof UnauthorizedException) {
        return {
          ok: false,
          message: error.message,
        };
      }

      return {
        ok: false,
        message: 'Login failed. Please try again.',
      };
    }
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<ApiResponse> {
    try {
      // Verify the refresh token (JWT only; refresh tokens are not stored in DB)
      let payload: JwtPayload;
      try {
        payload = await this.jwtService.verifyAsync(refreshTokenDto.refreshToken, {
          secret: this.configService.get<string>('jwt.refreshSecret'),
        });
      } catch {
        throw new UnauthorizedException(
          'Invalid or expired refresh token'
        );
      }

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException(
          'Invalid token type'
        );
      }

      // Get user
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!user || user.deletedAt) {
        throw new NotFoundException(
          `User not found: ${payload.sub}`
        );
      }

      if (user.isAccountSuspended || !user.active) {
        throw new UnauthorizedException(
          'Account is suspended or inactive'
        );
      }

      // Generate new access + refresh tokens (same as login; no DB storage)
      const tokens = await this.generateTokens(user.id, user.email, user.role.id, user.role.name);

      this.logger.log(`Token refreshed for user: ${user.id}`);

      return {
        ok: true,
        message: 'Token refreshed successfully',
        data: tokens,
      };
    } catch (error) {
      this.logger.error('Error refreshing token:', error);

      if (error instanceof UnauthorizedException || error instanceof NotFoundException) {
        return {
          ok: false,
          message: error.message,
        };
      }

      return {
        ok: false,
        message: 'Failed to refresh token',
      };
    }
  }

  async logout(userId: string, refreshToken?: string): Promise<ApiResponse> {
    try {
      // Revoke refresh token if provided
      if (refreshToken) {
        await this.prisma.refreshToken.updateMany({
          where: {
            userId,
            token: refreshToken,
            revokedAt: null,
          },
          data: { revokedAt: new Date() },
        });
      } else {
        // Revoke all refresh tokens for the user
        await this.prisma.refreshToken.updateMany({
          where: {
            userId,
            revokedAt: null,
          },
          data: { revokedAt: new Date() },
        });
      }

      // Log activity
      await this.logUserActivity(userId, ActivityType.LOG_OUT);

      this.logger.log(`User logged out: ${userId}`);

      return {
        ok: true,
        message: 'Logged out successfully',
      };
    } catch (error) {
      this.logger.error('Error during logout:', error);
      return {
        ok: false,
        message: 'Logout failed',
      };
    }
  }

  async validateUser(identifier: string, password: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { phoneNumber: identifier }],
        deletedAt: null,
      },
      include: {
        role: true,
      },
    });

    if (!user || !user.passwordHash) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (isPasswordValid) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash: _passwordHash, ...result } = user;
      return result;
    }

    return null;
  }

  private async generateTokens(userId: string, email: string, roleId: string, roleName: string): Promise<AuthTokens> {
    const accessTokenPayload: JwtPayload = {
      sub: userId,
      email,
      roleId,
      roleName,
      type: 'access',
    };

    const refreshTokenPayload: JwtPayload = {
      sub: userId,
      email,
      roleId,
      roleName,
      type: 'refresh',
    };

    const accessTokenExpiresIn = this.configService.get<string>('jwt.expiresIn', '1h') as StringValue;
    const refreshTokenExpiresIn = this.configService.get<string>('jwt.refreshExpiresIn', '7d') as StringValue;

    // Both tokens are JWTs: access with shorter expiry, refresh with longer (e.g. 7d). No DB storage.
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessTokenPayload, {
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: accessTokenExpiresIn,
      }),
      this.jwtService.signAsync(refreshTokenPayload, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: refreshTokenExpiresIn,
      }),
    ]);

    const expiresIn = this.parseExpiresIn(accessTokenExpiresIn);

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  private parseExpiresIn(expiresIn: string): number {
    const value = parseInt(expiresIn.slice(0, -1));
    const unit = expiresIn.slice(-1);

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 24 * 60 * 60;
      default:
        return 3600; // Default to 1 hour
    }
  }

  async getCurrentUser(userId: string): Promise<ApiResponse> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId, deletedAt: null },
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
          doctorProfile: {
            select: {
              id: true,
              doctorStatus: true,
              verificationStatus: true,
              averageRating: true,
              totalConsultations: true,
            },
          },
          patientProfile: {
            select: {
              id: true,
              verificationStatus: true,
              loyaltyPoints: true,
              totalConsultations: true,
              averageRating: true,
            },
          },
          pharmacistProfile: {
            select: {
              id: true,
              pharmacistStatus: true,
              verificationStatus: true,
              totalPrescriptions: true,
            },
          },
          labStaffProfile: {
            select: {
              id: true,
              labStaffStatus: true,
              verificationStatus: true,
              totalTests: true,
            },
          },
        },
      });

      if (!user) {
        throw new NotFoundException(
          `User not found: ${userId}`
        );
      }

      // Determine available roles for switching
      const availableRoles = await this.getAvailableRoles(user);

      return {
        ok: true,
        data: {
          ...user,
          availableRoles,
          canSwitchRole: availableRoles.length > 1,
        },
      };
    } catch (error) {
      this.logger.error('Error fetching current user:', error);

      if (error instanceof NotFoundException) {
        return {
          ok: false,
          message: error.message,
        };
      }

      return {
        ok: false,
        message: 'Failed to retrieve user information',
      };
    }
  }

  async updateProfile(userId: string, updateData: UpdateProfileDto): Promise<ApiResponse> {
    try {
      // Check if user exists
      const existingUser = await this.prisma.user.findUnique({
        where: { id: userId, deletedAt: null },
      });

      if (!existingUser) {
        throw new NotFoundException(
          `User not found: ${userId}`
        );
      }

      // Check for duplicate phone number if being updated
      if (updateData.phoneNumber && updateData.phoneNumber !== existingUser.phoneNumber) {
        const duplicate = await this.prisma.user.findFirst({
          where: {
            phoneNumber: updateData.phoneNumber,
            id: { not: userId },
            deletedAt: null,
          },
        });

        if (duplicate) {
          return {
            ok: false,
            message: 'Phone number is already in use',
          };
        }
      }

      // Update user
      await this.prisma.user.update({
        where: { id: userId },
        data: updateData,
      });

      // Log activity
      await this.logUserActivity(userId, ActivityType.UPDATED_PROFILE);

      this.logger.log(`User profile updated: ${userId}`);

      return {
        ok: true,
        message: 'Profile updated successfully',
      };
    } catch (error) {
      this.logger.error('Error updating profile:', error);

      if (error instanceof NotFoundException) {
        return {
          ok: false,
          message: error.message,
        };
      }

      return {
        ok: false,
        message: 'Failed to update profile',
      };
    }
  }

  async deleteAccount(userId: string): Promise<ApiResponse> {
    return this.usersService.remove(userId);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<ApiResponse> {
    try {
      // Get user with password
      const user = await this.prisma.user.findUnique({
        where: { id: userId, deletedAt: null },
        select: {
          id: true,
          email: true,
          name: true,
          passwordHash: true,
        },
      });

      if (!user || !user.passwordHash) {
        return {
          ok: false,
          message: 'Password not set. Please set your password first.',
        };
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);

      if (!isPasswordValid) {
        return {
          ok: false,
          message: 'Current password is incorrect',
        };
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(newPassword, 10);

      // Update password
      await this.prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newPasswordHash },
      });

      // Revoke all refresh tokens for security
      await this.prisma.refreshToken.updateMany({
        where: {
          userId,
          revokedAt: null,
        },
        data: { revokedAt: new Date() },
      });

      // Send password changed email notification
      try {
        await this.mailService.sendPasswordChangedEmail({
          email: user.email,
          name: user.name,
        });
      } catch (emailError) {
        this.logger.warn(`Failed to send password change email to ${user.email}:`, emailError);
        // Continue execution even if email fails
      }

      this.logger.log(`Password changed for user: ${userId}`);

      return {
        ok: true,
        message: 'Password changed successfully',
      };
    } catch (error) {
      this.logger.error('Error changing password:', error);

      return {
        ok: false,
        message: 'Failed to change password',
      };
    }
  }

  async verifyOtp(otp: string): Promise<ApiResponse> {
    try {
      // Hash the provided OTP
      const hashedOtp = hashOtp(otp);

      // Find valid verification token by hashed OTP
      const verificationToken = await this.prisma.verificationToken.findFirst({
        where: {
          token: hashedOtp,
          type: 'EMAIL_VERIFICATION',
          expiresAt: { gte: new Date() },
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });

      if (!verificationToken) {
        return {
          ok: false,
          message: 'Invalid or expired OTP',
        };
      }

      // Update user verification status
      await this.prisma.user.update({
        where: { id: verificationToken.userId },
        data: {
          isEmailVerified: true,
          verificationStatus: 'VERIFIED',
        },
      });

      // Delete used token
      await this.prisma.verificationToken.delete({
        where: { id: verificationToken.id },
      });

      // Log activity
      await this.logUserActivity(verificationToken.userId, ActivityType.UPDATED_PROFILE);

      this.logger.log(`Email verified successfully for user: ${verificationToken.userId}`);

      return {
        ok: true,
        message: 'Email verified successfully',
      };
    } catch (error) {
      this.logger.error('Error verifying OTP:', error);

      return {
        ok: false,
        message: 'Email verification failed',
      };
    }
  }

  async resendOtp(email: string): Promise<ApiResponse> {
    try {
      // Find user
      const user = await this.prisma.user.findUnique({
        where: { email, deletedAt: null },
        select: {
          id: true,
          email: true,
          name: true,
          phoneNumber: true,
          isEmailVerified: true,
        },
      });

      if (!user) {
        throw new NotFoundException(
          `User not found: ${email}`
        );
      }

      // Check if already verified
      if (user.isEmailVerified) {
        return {
          ok: false,
          message: 'Email is already verified',
        };
      }

      // Delete old tokens
      await this.prisma.verificationToken.deleteMany({
        where: {
          userId: user.id,
          type: 'EMAIL_VERIFICATION',
        },
      });

      // Generate new OTP
      const otp = this.mailService.generateOTP();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);

      // Hash OTP before storing (security best practice)
      const hashedOtp = hashOtp(otp);

      // Store hashed token
      await this.prisma.verificationToken.create({
        data: {
          userId: user.id,
          token: hashedOtp,
          type: 'EMAIL_VERIFICATION',
          expiresAt,
        },
      });

      // Send OTP via email
      try {
        await this.mailService.sendOTPEmail({
          email: user.email,
          name: user.name,
          otp,
        });
      } catch (emailError) {
        this.logger.warn(`Failed to send OTP email to ${user.email}:`, emailError);
      }

      // SMS service removed - OTP is sent via email only

      this.logger.log(`OTP resent successfully to user: ${user.id}`);

      return {
        ok: true,
        message: 'OTP resent successfully',
      };
    } catch (error) {
      this.logger.error('Error resending OTP:', error);

      if (error instanceof NotFoundException) {
        return {
          ok: false,
          message: error.message,
        };
      }

      return {
        ok: false,
        message: 'Failed to resend OTP',
      };
    }
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    try {
      // Find user
      const user = await this.prisma.user.findUnique({
        where: { email, deletedAt: null },
        select: {
          id: true,
          email: true,
          name: true,
          phoneNumber: true,
        },
      });

      if (!user) {
        // Don't reveal if user exists or not for security
        return {
          ok: true,
          message: 'Password reset OTP sent to your email and phone',
        };
      }

      // Delete old password reset tokens
      await this.prisma.verificationToken.deleteMany({
        where: {
          userId: user.id,
          type: 'PASSWORD_RESET',
        },
      });

      // Generate OTP for password reset
      const otp = this.mailService.generateOTP();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);

      // Hash OTP before storing (security best practice)
      const hashedOtp = hashOtp(otp);

      // Store hashed token
      await this.prisma.verificationToken.create({
        data: {
          userId: user.id,
          token: hashedOtp,
          type: 'PASSWORD_RESET',
          expiresAt,
        },
      });

      // Send OTP via email
      try {
        await this.mailService.sendOTPEmail({
          email: user.email,
          name: user.name,
          otp,
        });
      } catch (emailError) {
        this.logger.warn(`Failed to send password reset email to ${user.email}:`, emailError);
      }

      // SMS service removed - password reset OTP is sent via email only

      this.logger.log(`Password reset OTP sent to user: ${user.id}`);

      return {
        ok: true,
        message: 'Password reset OTP sent to your email and phone',
      };
    } catch (error) {
      this.logger.error('Error in forgot password:', error);

      return {
        ok: false,
        message: 'Failed to send password reset OTP',
      };
    }
  }

  async resetPassword(email: string, otp: string, newPassword: string): Promise<ApiResponse> {
    try {
      // Hash the provided OTP
      const hashedOtp = hashOtp(otp);

      // Find valid password reset token by hashed OTP and email
      const resetToken = await this.prisma.verificationToken.findFirst({
        where: {
          token: hashedOtp,
          type: 'PASSWORD_RESET',
          expiresAt: { gte: new Date() },
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });

      if (!resetToken || resetToken.user.email !== email) {
        return {
          ok: false,
          message: 'Invalid or expired OTP',
        };
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(newPassword, 10);

      // Update password
      await this.prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash: newPasswordHash },
      });

      // Delete used token
      await this.prisma.verificationToken.delete({
        where: { id: resetToken.id },
      });

      // Revoke all refresh tokens for security
      await this.prisma.refreshToken.updateMany({
        where: {
          userId: resetToken.userId,
          revokedAt: null,
        },
        data: { revokedAt: new Date() },
      });

      // Send password changed email notification
      try {
        await this.mailService.sendPasswordChangedEmail({
          email: resetToken.user.email,
          name: resetToken.user.name,
        });
      } catch (emailError) {
        this.logger.warn(`Failed to send password change email to ${resetToken.user.email}:`, emailError);
      }

      // Log activity
      await this.logUserActivity(resetToken.userId, ActivityType.UPDATED_PROFILE);

      this.logger.log(`Password reset successfully for user: ${resetToken.userId}`);

      return {
        ok: true,
        message: 'Password reset successfully',
      };
    } catch (error) {
      this.logger.error('Error resetting password:', error);

      return {
        ok: false,
        message: 'Failed to send password reset OTP',
      };
    }
  }

  private async logUserActivity(
    userId: string,
    activityType: ActivityType,
    metadata?: { ipAddress?: string; userAgent?: string }
  ): Promise<void> {
    try {
      await this.prisma.userActivity.create({
        data: {
          userId,
          activityType,
          ipAddress: metadata?.ipAddress,
          userAgent: metadata?.userAgent,
        },
      });
    } catch (error) {
      this.logger.warn('Failed to log user activity:', error);
    }
  }

  /**
   * @description Get available roles that a user can switch to
   * @param user User object with driver and passenger profiles
   * @returns Array of available role names
   */
  private async getAvailableRoles(user: {
    doctorProfile: { doctorStatus: string } | null;
    patientProfile: { id: string } | null;
    pharmacistProfile: { pharmacistStatus: string } | null;
    labStaffProfile: { labStaffStatus: string } | null;
  }): Promise<string[]> {
    const roles: string[] = [];

    // Check if user has an active doctor profile
    if (user.doctorProfile) {
      const canBeDoctor =
        user.doctorProfile.doctorStatus === 'ACTIVE' ||
        user.doctorProfile.doctorStatus === 'INACTIVE' ||
        user.doctorProfile.doctorStatus === 'ON_LEAVE';

      if (canBeDoctor) {
        roles.push('DOCTOR');
      }
    }

    // Check if user has a patient profile
    if (user.patientProfile) {
      roles.push('PATIENT');
    }

    // Check if user has an active pharmacist profile
    if (user.pharmacistProfile && user.pharmacistProfile.pharmacistStatus === 'ACTIVE') {
      roles.push('PHARMACIST');
    }

    // Check if user has an active lab staff profile
    if (user.labStaffProfile && user.labStaffProfile.labStaffStatus === 'ACTIVE') {
      roles.push('LABORATORY_STAFF');
    }

    return roles;
  }

  /**
   * @description Get detailed profile status for user
   * @param userId The user ID
   * @returns ApiResponse with profile status and available actions
   */
  async getProfileStatus(userId: string): Promise<ApiResponse> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId, deletedAt: null },
        include: {
          role: true,
          doctorProfile: {
            select: {
              id: true,
              doctorStatus: true,
              verificationStatus: true,
              hasUploadedDocuments: true,
              areDocumentsVerified: true,
              averageRating: true,
              totalConsultations: true,
              createdAt: true,
            },
          },
          patientProfile: {
            select: {
              id: true,
              verificationStatus: true,
              loyaltyPoints: true,
              totalConsultations: true,
              averageRating: true,
              createdAt: true,
            },
          },
          pharmacistProfile: {
            select: {
              id: true,
              pharmacistStatus: true,
              verificationStatus: true,
              totalPrescriptions: true,
              createdAt: true,
            },
          },
          labStaffProfile: {
            select: {
              id: true,
              labStaffStatus: true,
              verificationStatus: true,
              totalTests: true,
              createdAt: true,
            },
          },
        },
      });

      if (!user) {
        throw new NotFoundException(
          `User not found: ${userId}`
        );
      }

      // Determine available roles
      const availableRoles = await this.getAvailableRoles(user);

      // Determine what actions user can take
      const actions = {
        canSwitchRole: availableRoles.length > 1,
        canCreateDoctorProfile: !user.doctorProfile,
        canCreatePatientProfile: !user.patientProfile,
        canCreatePharmacistProfile: !user.pharmacistProfile,
        canCreateLabStaffProfile: !user.labStaffProfile,
      };

      return {
        ok: true,
        data: {
          currentRole: user.role.name,
          hasDoctorProfile: !!user.doctorProfile,
          hasPatientProfile: !!user.patientProfile,
          hasPharmacistProfile: !!user.pharmacistProfile,
          hasLabStaffProfile: !!user.labStaffProfile,
          doctorProfile: user.doctorProfile
            ? {
                status: user.doctorProfile.doctorStatus,
                verificationStatus: user.doctorProfile.verificationStatus,
                hasDocuments: user.doctorProfile.hasUploadedDocuments,
                documentsVerified: user.doctorProfile.areDocumentsVerified,
                canPractice:
                  user.doctorProfile.doctorStatus === 'ACTIVE' ||
                  user.doctorProfile.doctorStatus === 'INACTIVE' ||
                  user.doctorProfile.doctorStatus === 'ON_LEAVE',
                totalConsultations: user.doctorProfile.totalConsultations,
                rating: user.doctorProfile.averageRating,
              }
            : null,
          patientProfile: user.patientProfile
            ? {
                verificationStatus: user.patientProfile.verificationStatus,
                loyaltyPoints: user.patientProfile.loyaltyPoints,
                totalConsultations: user.patientProfile.totalConsultations,
                rating: user.patientProfile.averageRating,
              }
            : null,
          pharmacistProfile: user.pharmacistProfile
            ? {
                status: user.pharmacistProfile.pharmacistStatus,
                verificationStatus: user.pharmacistProfile.verificationStatus,
                totalPrescriptions: user.pharmacistProfile.totalPrescriptions,
              }
            : null,
          labStaffProfile: user.labStaffProfile
            ? {
                status: user.labStaffProfile.labStaffStatus,
                verificationStatus: user.labStaffProfile.verificationStatus,
                totalTests: user.labStaffProfile.totalTests,
              }
            : null,
          availableRoles,
          actions,
          recommendations: this.getRecommendations(user, actions),
        },
      };
    } catch (error) {
      this.logger.error('Error fetching profile status:', error);

      if (error instanceof NotFoundException) {
        return {
          ok: false,
          message: error.message,
        };
      }

      return {
        ok: false,
        message: 'Failed to retrieve user information',
      };
    }
  }

  /**
   * @description Get recommendations for user based on profile status
   * @param user User object with profiles
   * @param actions Available actions
   * @returns Array of recommendation strings
   */
  private getRecommendations(
    user: {
      doctorProfile: { doctorStatus: string; hasUploadedDocuments: boolean } | null;
      patientProfile: { id: string } | null;
      pharmacistProfile: { pharmacistStatus: string } | null;
      labStaffProfile: { labStaffStatus: string } | null;
    },
    actions: {
      canCreateDoctorProfile: boolean;
      canCreatePatientProfile: boolean;
      canCreatePharmacistProfile: boolean;
      canCreateLabStaffProfile: boolean;
    }
  ): string[] {
    const recommendations: string[] = [];

    if (actions.canCreateDoctorProfile) {
      recommendations.push('Create a doctor profile to start providing consultations');
    }

    if (actions.canCreatePatientProfile) {
      recommendations.push('Create a patient profile to access healthcare services');
    }

    if (actions.canCreatePharmacistProfile) {
      recommendations.push('Create a pharmacist profile to manage prescriptions');
    }

    if (actions.canCreateLabStaffProfile) {
      recommendations.push('Create a lab staff profile to perform lab tests');
    }

    if (user.doctorProfile && user.doctorProfile.doctorStatus === 'SUSPENDED') {
      recommendations.push('Your doctor profile is suspended. Contact support for assistance.');
    }

    return recommendations;
  }

  /**
   * @description Switch user role between DOCTOR, PATIENT, PHARMACIST, and LABORATORY_STAFF
   * @param userId The user ID requesting role switch
   * @param switchRoleDto The role to switch to
   * @returns ApiResponse with new tokens for the switched role
   */
  async switchRole(userId: string, switchRoleDto: SwitchRoleDto): Promise<ApiResponse> {
    try {
      // Get user with all profiles
      const user = await this.prisma.user.findUnique({
        where: { id: userId, deletedAt: null },
        include: {
          role: true,
          doctorProfile: true,
          patientProfile: true,
          pharmacistProfile: true,
          labStaffProfile: true,
        },
      });

      if (!user) {
        throw new NotFoundException(
          `User not found: ${userId}`
        );
      }

      // Check if user is suspended or inactive
      if (user.isAccountSuspended) {
        return {
          ok: false,
          message: 'Your account has been suspended. Please contact support.',
        };
      }

      if (!user.active) {
        return {
          ok: false,
          message: 'Your account is inactive. Please contact support.',
        };
      }

      // Get the target role from database
      const targetRole = await this.prisma.role.findUnique({
        where: { name: switchRoleDto.role },
      });

      if (!targetRole) {
        return {
          ok: false,
          message: `Role not found: ${switchRoleDto.role}`,
        };
      }

      // Check if already in the requested role (FIRST CHECK)
      if (user.roleId === targetRole.id) {
        return {
          ok: false,
          message: `You are already in the ${switchRoleDto.role} role`,
        };
      }

      // Validate that user can switch to this role
      if (switchRoleDto.role === 'DOCTOR') {
        if (!user.doctorProfile) {
          return {
            ok: false,
            message: 'Doctor profile is required to switch to DOCTOR role',
          };
        }

        // Check if doctor profile is active
        if (user.doctorProfile.doctorStatus === 'SUSPENDED') {
          return {
            ok: false,
            message: 'Your doctor profile is suspended. Contact support for assistance.',
          };
        }
      } else if (switchRoleDto.role === 'PATIENT') {
        if (!user.patientProfile) {
          return {
            ok: false,
            message: 'Patient profile is required to switch to PATIENT role',
          };
        }
      } else if (switchRoleDto.role === 'PHARMACIST') {
        if (!user.pharmacistProfile) {
          return {
            ok: false,
            message: 'Pharmacist profile is required to switch to PHARMACIST role',
          };
        }

        if (user.pharmacistProfile.pharmacistStatus === 'SUSPENDED') {
          return {
            ok: false,
            message: 'Your pharmacist profile is suspended. Contact support for assistance.',
          };
        }
      } else if (switchRoleDto.role === 'LABORATORY_STAFF') {
        if (!user.labStaffProfile) {
          return {
            ok: false,
            message: 'Lab staff profile is required to switch to LABORATORY_STAFF role',
          };
        }

        if (user.labStaffProfile.labStaffStatus === 'SUSPENDED') {
          return {
            ok: false,
            message: 'Your lab staff profile is suspended. Contact support for assistance.',
          };
        }
      }

      // Update user's role
      await this.prisma.user.update({
        where: { id: userId },
        data: { roleId: targetRole.id },
      });

      // Revoke all existing refresh tokens for security
      await this.prisma.refreshToken.updateMany({
        where: {
          userId,
          revokedAt: null,
        },
        data: { revokedAt: new Date() },
      });

      // Generate new tokens with updated role
      const tokens = await this.generateTokens(userId, user.email, targetRole.id, targetRole.name);

      // Log activity
      await this.logUserActivity(userId, ActivityType.UPDATED_PROFILE, {
        ipAddress: undefined,
        userAgent: undefined,
      });

      this.logger.log(`User ${userId} switched role to ${switchRoleDto.role}`);

      return {
        ok: true,
        message: `Role switched to ${switchRoleDto.role} successfully`,
        data: {
          role: {
            id: targetRole.id,
            name: targetRole.name,
          },
          ...tokens,
        },
      };
    } catch (error) {
      this.logger.error('Error switching role:', error);

      if (error instanceof NotFoundException) {
        return {
          ok: false,
          message: error.message,
        };
      }

      return {
        ok: false,
        message: 'Failed to switch role',
      };
    }
  }
}
