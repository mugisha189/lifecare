import { Body, Controller, Get, HttpCode, HttpStatus, Ip, Logger, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse as ApiResponseDecorator, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { ApiResponse } from '../types/api-response.interface';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { SwitchRoleDto } from './dto/switch-role.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponseDecorator({
    status: 201,
    description: 'User registered successfully',
  })
  @ApiResponseDecorator({ status: 400, description: 'Bad Request' })
  @ApiResponseDecorator({ status: 409, description: 'User already exists' })
  async register(@Body() registerDto: RegisterDto): Promise<ApiResponse> {
    this.logger.log(`Registration attempt for email: ${registerDto.email}`);
    return this.authService.register(registerDto);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email/phone and password' })
  @ApiResponseDecorator({
    status: 200,
    description: 'User logged in successfully',
  })
  @ApiResponseDecorator({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto, @Ip() ip: string, @Req() req: Request): Promise<ApiResponse> {
    // Attach IP address and user agent to the DTO
    loginDto.ipAddress = ip;
    loginDto.userAgent = req.headers['user-agent'] || '';

    this.logger.log(`Login attempt for identifier: ${loginDto.identifier}`);
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponseDecorator({
    status: 200,
    description: 'Token refreshed successfully',
  })
  @ApiResponseDecorator({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<ApiResponse> {
    this.logger.log('Token refresh attempt');
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Logout user and revoke refresh tokens' })
  @ApiResponseDecorator({
    status: 200,
    description: 'User logged out successfully',
  })
  @ApiResponseDecorator({ status: 401, description: 'Unauthorized' })
  async logout(
    @Req() req: Request & { user: { sub: string } },
    @Body() body?: { refreshToken?: string }
  ): Promise<ApiResponse> {
    const userId = req.user.sub;
    this.logger.log(`Logout request for user: ${userId}`);
    return this.authService.logout(userId, body?.refreshToken);
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiResponseDecorator({
    status: 200,
    description: 'User profile retrieved successfully',
  })
  @ApiResponseDecorator({ status: 401, description: 'Unauthorized' })
  async getCurrentUser(@CurrentUser('sub') userId: string): Promise<ApiResponse> {
    this.logger.log(`Profile request for user: ${userId}`);
    return this.authService.getCurrentUser(userId);
  }

  @Patch('me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponseDecorator({
    status: 200,
    description: 'Profile updated successfully',
  })
  @ApiResponseDecorator({ status: 401, description: 'Unauthorized' })
  @ApiResponseDecorator({ status: 409, description: 'Phone number already in use' })
  async updateProfile(
    @CurrentUser('sub') userId: string,
    @Body() updateProfileDto: UpdateProfileDto
  ): Promise<ApiResponse> {
    this.logger.log(`Profile update request for user: ${userId}`);
    return this.authService.updateProfile(userId, updateProfileDto);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponseDecorator({
    status: 200,
    description: 'Password changed successfully',
  })
  @ApiResponseDecorator({ status: 401, description: 'Unauthorized' })
  @ApiResponseDecorator({ status: 400, description: 'Invalid current password' })
  async changePassword(
    @CurrentUser('sub') userId: string,
    @Body() changePasswordDto: ChangePasswordDto
  ): Promise<ApiResponse> {
    this.logger.log(`Password change request for user: ${userId}`);
    return this.authService.changePassword(userId, changePasswordDto.currentPassword, changePasswordDto.newPassword);
  }

  @Post('delete-account')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete current user account (soft delete)' })
  @ApiResponseDecorator({
    status: 200,
    description: 'Account deleted successfully',
  })
  @ApiResponseDecorator({ status: 401, description: 'Unauthorized' })
  async deleteAccount(@CurrentUser('sub') userId: string): Promise<ApiResponse> {
    this.logger.log(`Account deletion request for user: ${userId}`);
    return this.authService.deleteAccount(userId);
  }

  @Public()
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email with OTP code' })
  @ApiResponseDecorator({
    status: 200,
    description: 'Email verified successfully',
  })
  @ApiResponseDecorator({ status: 400, description: 'Invalid or expired OTP' })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto): Promise<ApiResponse> {
    this.logger.log(`OTP verification attempt`);
    return this.authService.verifyOtp(verifyOtpDto.otp);
  }

  @Public()
  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend OTP verification code' })
  @ApiResponseDecorator({
    status: 200,
    description: 'OTP resent successfully',
  })
  @ApiResponseDecorator({ status: 400, description: 'Email already verified' })
  @ApiResponseDecorator({ status: 404, description: 'User not found' })
  async resendOtp(@Body() resendOtpDto: ResendOtpDto): Promise<ApiResponse> {
    this.logger.log(`OTP resend request for email: ${resendOtpDto.email}`);
    return this.authService.resendOtp(resendOtpDto.email);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset OTP' })
  @ApiResponseDecorator({
    status: 200,
    description: 'Password reset OTP sent successfully',
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<ApiResponse> {
    this.logger.log(`Password reset request for email: ${forgotPasswordDto.email}`);
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with OTP' })
  @ApiResponseDecorator({
    status: 200,
    description: 'Password reset successfully',
  })
  @ApiResponseDecorator({ status: 400, description: 'Invalid or expired OTP' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<ApiResponse> {
    this.logger.log(`Password reset attempt for email: ${resetPasswordDto.email}`);
    return this.authService.resetPassword(resetPasswordDto.email, resetPasswordDto.otp, resetPasswordDto.newPassword);
  }

  @Post('switch-role')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Switch user role between DOCTOR, PATIENT, PHARMACIST, and LABORATORY_STAFF',
    description:
      'Allows users with multiple profiles to switch between DOCTOR, PATIENT, PHARMACIST, and LABORATORY_STAFF roles. Returns new JWT tokens with the updated role.',
  })
  @ApiResponseDecorator({
    status: 200,
    description: 'Role switched successfully',
  })
  @ApiResponseDecorator({ status: 400, description: 'Invalid role or missing profile' })
  @ApiResponseDecorator({ status: 401, description: 'Unauthorized' })
  @ApiResponseDecorator({ status: 404, description: 'User not found' })
  async switchRole(@CurrentUser('sub') userId: string, @Body() switchRoleDto: SwitchRoleDto): Promise<ApiResponse> {
    this.logger.log(`Role switch request from user ${userId} to ${switchRoleDto.role}`);
    return this.authService.switchRole(userId, switchRoleDto);
  }

  @Get('profile-status')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Check user profile status',
    description:
      'Returns detailed information about which profiles the user has, their status, and what actions are available (create profile, switch role, etc.)',
  })
  @ApiResponseDecorator({
    status: 200,
    description: 'Profile status retrieved successfully',
  })
  @ApiResponseDecorator({ status: 401, description: 'Unauthorized' })
  async getProfileStatus(@CurrentUser('sub') userId: string): Promise<ApiResponse> {
    this.logger.log(`Profile status check for user: ${userId}`);
    return this.authService.getProfileStatus(userId);
  }
}
