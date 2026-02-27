import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Helper service for role-aware data access
 * Provides methods to safely query data based on user's current role context
 */
@Injectable()
export class RoleContextHelper {
  private readonly logger = new Logger(RoleContextHelper.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get user with all profiles for role-aware operations
   * @param userId User ID
   * @returns User with all healthcare profiles
   */
  async getUserWithProfiles(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
      include: {
        role: true,
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
  }

  /**
   * Get doctor profile ID for the user (if exists)
   * @param userId User ID
   * @returns Doctor profile ID or null
   */
  async getDoctorProfileId(userId: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        doctorProfile: {
          select: { id: true },
        },
      },
    });

    return user?.doctorProfile?.id || null;
  }

  /**
   * Get patient profile ID for the user (if exists)
   * @param userId User ID
   * @returns Patient profile ID or null
   */
  async getPatientProfileId(userId: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        patientProfile: {
          select: { id: true },
        },
      },
    });

    return user?.patientProfile?.id || null;
  }

  /**
   * Check if user can perform doctor-specific actions
   * @param userId User ID
   * @returns True if user has active doctor profile
   */
  async canActAsDoctor(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        doctorProfile: {
          select: { doctorStatus: true },
        },
      },
    });

    if (!user?.doctorProfile) {
      return false;
    }

    const activeStatuses = ['ACTIVE', 'INACTIVE', 'ON_LEAVE'];
    return activeStatuses.includes(user.doctorProfile.doctorStatus);
  }

  /**
   * Check if user can perform patient-specific actions
   * @param userId User ID
   * @returns True if user has patient profile
   */
  async canActAsPatient(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        patientProfile: {
          select: { id: true },
        },
      },
    });

    return !!user?.patientProfile;
  }

  /**
   * Get doctor's consultation history
   * Use this when user is in DOCTOR role
   * @param userId User ID
   * @returns Consultations provided by the doctor
   */
  async getDoctorConsultations(userId: string) {
    const doctorProfileId = await this.getDoctorProfileId(userId);

    if (!doctorProfileId) {
      return [];
    }

    return this.prisma.consultation.findMany({
      where: {
        doctorId: doctorProfileId,
        deletedAt: null,
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get patient's consultation history
   * Use this when user is in PATIENT role
   * @param userId User ID
   * @returns Consultations for the patient
   */
  async getPatientConsultations(userId: string) {
    return this.prisma.consultation.findMany({
      where: {
        patientId: userId,
        deletedAt: null,
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
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get patient's prescription history
   * @param userId User ID
   * @returns Prescriptions for the patient
   */
  async getPatientPrescriptions(userId: string) {
    return this.prisma.prescription.findMany({
      where: {
        patientId: userId,
        deletedAt: null,
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
        medicines: {
          include: {
            medicine: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get combined healthcare history
   * @param userId User ID
   * @returns Combined history with role context
   */
  async getCombinedHealthcareHistory(userId: string) {
    const [doctorConsultations, patientConsultations, patientPrescriptions] = await Promise.all([
      this.getDoctorConsultations(userId),
      this.getPatientConsultations(userId),
      this.getPatientPrescriptions(userId),
    ]);

    return {
      asDoctor: doctorConsultations.map(consultation => ({
        ...consultation,
        roleContext: 'DOCTOR' as const,
        date: consultation.date,
      })),
      asPatient: {
        consultations: patientConsultations.map(consultation => ({
          ...consultation,
          roleContext: 'PATIENT' as const,
          date: consultation.date,
        })),
        prescriptions: patientPrescriptions.map(prescription => ({
          ...prescription,
          roleContext: 'PATIENT' as const,
          date: prescription.createdAt,
        })),
      },
      totalAsDoctor: doctorConsultations.length,
      totalAsPatient: patientConsultations.length,
      totalPrescriptions: patientPrescriptions.length,
    };
  }

  /**
   * Get doctor statistics
   * @param userId User ID
   * @returns Doctor performance metrics
   */
  async getDoctorStats(userId: string) {
    const doctorProfile = await this.prisma.doctorProfile.findUnique({
      where: { userId },
      select: {
        averageRating: true,
        totalConsultations: true,
      },
    });

    if (!doctorProfile) {
      return null;
    }

    return doctorProfile;
  }

  /**
   * Get patient statistics
   * @param userId User ID
   * @returns Patient activity metrics
   */
  async getPatientStats(userId: string) {
    const patientProfile = await this.prisma.patientProfile.findUnique({
      where: { userId },
      select: {
        loyaltyPoints: true,
        totalConsultations: true,
        averageRating: true,
      },
    });

    if (!patientProfile) {
      return null;
    }

    return patientProfile;
  }

  /**
   * Get complete dashboard data based on current role
   * @param userId User ID
   * @param currentRole Current user role
   * @returns Role-specific dashboard data
   */
  async getDashboardData(userId: string, currentRole: string) {
    if (currentRole === 'DOCTOR') {
      const [stats, recentConsultations] = await Promise.all([
        this.getDoctorStats(userId),
        this.getDoctorConsultations(userId),
      ]);

      return {
        role: 'DOCTOR',
        stats,
        recentActivity: recentConsultations.slice(0, 10),
        canSwitch: await this.canActAsPatient(userId),
      };
    } else if (currentRole === 'PATIENT') {
      const [stats, recentConsultations, recentPrescriptions] = await Promise.all([
        this.getPatientStats(userId),
        this.getPatientConsultations(userId),
        this.getPatientPrescriptions(userId),
      ]);

      return {
        role: 'PATIENT',
        stats,
        recentActivity: {
          consultations: recentConsultations.slice(0, 10),
          prescriptions: recentPrescriptions.slice(0, 10),
        },
        canSwitch: await this.canActAsDoctor(userId),
      };
    }

    return null;
  }

  /**
   * Validate that user can access specific data based on role
   * @param userId User ID
   * @param resourceType Type of resource being accessed
   * @param resourceId Resource ID
   * @returns True if user has permission to access
   */
  async validateResourceAccess(
    userId: string,
    resourceType: 'consultation' | 'prescription' | 'medicine',
    resourceId: string
  ): Promise<boolean> {
    switch (resourceType) {
      case 'consultation': {
        const consultation = await this.prisma.consultation.findUnique({
          where: { id: resourceId },
          include: {
            doctor: {
              select: { userId: true },
            },
          },
        });
        return consultation?.doctor.userId === userId || consultation?.patientId === userId;
      }

      case 'prescription': {
        const prescription = await this.prisma.prescription.findUnique({
          where: { id: resourceId },
          include: {
            doctor: {
              select: { userId: true },
            },
          },
        });
        return prescription?.doctor.userId === userId || prescription?.patientId === userId;
      }

      case 'medicine': {
        // Medicines are accessible to all authenticated users (pharmacists, admins can manage)
        return true;
      }

      default:
        return false;
    }
  }
}
