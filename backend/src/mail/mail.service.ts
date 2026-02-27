import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

interface EmailParams {
  to: string;
  subject: string;
  html: string;
}

interface WelcomeEmailParams {
  email: string;
  name: string;
}

interface VerificationEmailParams {
  email: string;
  name: string;
  code: string;
}

interface InitiateVerificationEmailParams {
  email: string;
  names: string;
  verificationCode: string;
}

interface OTPEmailParams {
  email: string;
  name: string;
  otp: string;
}

interface PasswordResetEmailParams {
  email: string;
  name: string;
  resetUrl: string;
}

interface SuspensionEmailParams {
  email: string;
  name: string;
  reason: string;
  suspendedUntil?: Date;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    const mailConfig = this.configService.get<{
      host: string;
      port: number;
      secure: boolean;
      user: string;
      password: string;
      from: string;
    }>('mail');

    this.transporter = nodemailer.createTransport({
      host: mailConfig?.host ?? 'smtp.gmail.com',
      port: mailConfig?.port ?? 587,
      secure: mailConfig?.secure ?? false,
      auth: {
        user: mailConfig?.user ?? '',
        pass: mailConfig?.password ?? '',
      },
    });
  }

  private async sendEmail(params: EmailParams): Promise<void> {
    try {
      const mailOptions: nodemailer.SendMailOptions = {
        from: this.configService.get('mail.from'),
        to: params.to,
        subject: params.subject,
        html: params.html,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully to ${params.to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${params.to}:`, error);
      throw new Error('Failed to send email');
    }
  }

  async sendWelcomeEmail(params: WelcomeEmailParams): Promise<void> {
    const { subject, html } = this.getWelcomeContent(params);
    await this.sendEmail({ to: params.email, subject, html });
  }

  async sendVerificationEmail(params: VerificationEmailParams): Promise<void> {
    const { subject, html } = this.getVerificationContent(params);
    await this.sendEmail({ to: params.email, subject, html });
  }

  async sendOTPEmail(params: OTPEmailParams): Promise<void> {
    const { subject, html } = this.getOTPContent(params);
    await this.sendEmail({ to: params.email, subject, html });
  }

  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendInitiateEmailVerificationEmail(params: InitiateVerificationEmailParams): Promise<void> {
    const { subject, html } = this.getVerificationContent({
      email: params.email,
      name: params.names,
      code: params.verificationCode,
    });
    await this.sendEmail({ to: params.email, subject, html });
  }

  async sendPasswordResetEmail(params: PasswordResetEmailParams): Promise<void> {
    const { subject, html } = this.getPasswordResetContent(params);
    await this.sendEmail({ to: params.email, subject, html });
  }

  async sendAccountSuspensionEmail(params: SuspensionEmailParams): Promise<void> {
    const { subject, html } = this.getSuspensionContent(params);
    await this.sendEmail({ to: params.email, subject, html });
  }

  async sendAccountUnsuspensionEmail(params: Pick<SuspensionEmailParams, 'email' | 'name'>): Promise<void> {
    const { subject, html } = this.getUnsuspensionContent(params);
    await this.sendEmail({ to: params.email, subject, html });
  }

  async sendPasswordChangedEmail(params: WelcomeEmailParams): Promise<void> {
    const { subject, html } = this.getPasswordChangedContent(params);
    await this.sendEmail({ to: params.email, subject, html });
  }

  // Base template
  private getBaseTemplate(content: string): string {
    const footer = {
      copyright: `© ${new Date().getFullYear()} LifeCare. All rights reserved.`,
      automated: 'This is an automated email. Please do not reply.',
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .content { padding: 30px 0; }
          .button { display: inline-block; padding: 12px 30px; background-color: #2563EB; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px 0; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
          .code { font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #2563EB; padding: 15px; background-color: #f5f5f5; border-radius: 5px; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="content">
            ${content}
          </div>
          <div class="footer">
            <p>${footer.copyright}</p>
            <p>${footer.automated}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // OTP Email Content
  private getOTPContent(params: OTPEmailParams): { subject: string; html: string } {
    const content = `
      <p>Hello ${params.name},</p>
      <p>Thank you for registering with LifeCare. Please use the following code to verify your account:</p>
      <div style="text-align: center;">
        <span class="code">${params.otp}</span>
      </div>
      <p>This code will expire in 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    return { 
      subject: 'Your Verification Code', 
      html: this.getBaseTemplate(content) 
    };
  }

  // Verification Email Content
  private getVerificationContent(params: VerificationEmailParams): { subject: string; html: string } {
    const content = `
      <p>Hello ${params.name},</p>
      <p>Please use the following code to verify your email address:</p>
      <div style="text-align: center;">
        <span class="code">${params.code}</span>
      </div>
      <p>This code will expire in 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    return { 
      subject: 'Verify Your Email Address', 
      html: this.getBaseTemplate(content) 
    };
  }

  // Welcome Email Content
  private getWelcomeContent(params: WelcomeEmailParams): { subject: string; html: string } {
    const content = `
      <p>Welcome to LifeCare, ${params.name}!</p>
      <p>Thank you for joining LifeCare. We're excited to have you on board!</p>
      <p>You can now start booking consultations, accessing your medical records, and managing your prescriptions.</p>
      <a href="${this.configService.get('client.url')}" class="button">Get Started</a>
    `;

    return { 
      subject: 'Welcome to LifeCare!', 
      html: this.getBaseTemplate(content) 
    };
  }

  // Password Reset Email Content
  private getPasswordResetContent(params: PasswordResetEmailParams): { subject: string; html: string } {
    const content = `
      <p>Hello ${params.name},</p>
      <p>We received a request to reset your password. Click the button below to reset it:</p>
      <a href="${params.resetUrl}" class="button">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
    `;

    return { 
      subject: 'Reset Your Password', 
      html: this.getBaseTemplate(content) 
    };
  }

  // Account Suspension Email Content
  private getSuspensionContent(params: SuspensionEmailParams): { subject: string; html: string } {
    const durationText = params.suspendedUntil
      ? `until ${params.suspendedUntil.toLocaleDateString()}`
      : 'indefinitely';

    const content = `
      <p>Hello ${params.name},</p>
      <p>Your account has been suspended ${durationText}.</p>
      <p><strong>Reason:</strong> ${params.reason}</p>
      <p>If you believe this is a mistake, please contact our support team.</p>
    `;

    return { 
      subject: 'Account Suspended', 
      html: this.getBaseTemplate(content) 
    };
  }

  // Account Unsuspension Email Content
  private getUnsuspensionContent(params: Pick<SuspensionEmailParams, 'name'>): {
    subject: string;
    html: string;
  } {
    const content = `
      <p>Hello ${params.name},</p>
      <p>Good news! Your account has been reactivated and you can now access all features again.</p>
      <a href="${this.configService.get('client.url')}/login" class="button">Login Now</a>
    `;

    return { 
      subject: 'Account Reactivated', 
      html: this.getBaseTemplate(content) 
    };
  }

  // Password Changed Email Content
  private getPasswordChangedContent(params: WelcomeEmailParams): { subject: string; html: string } {
    const content = `
      <p>Hello ${params.name},</p>
      <p>Your password has been changed successfully.</p>
      <p>If you didn't make this change, please contact our support team immediately.</p>
      <a href="${this.configService.get('client.url')}/support" class="button">Contact Support</a>
    `;

    return { 
      subject: 'Password Changed Successfully', 
      html: this.getBaseTemplate(content) 
    };
  }
}
