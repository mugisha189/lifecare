import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AnalyticsPeriod, QueryPlatformAnalyticsDto } from './dto/query-platform-analytics.dto';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPlatformAnalytics(queryDto: QueryPlatformAnalyticsDto, userId: string) {
    const { period = AnalyticsPeriod.MONTH, startDate, endDate, limit = 10 } = queryDto;
    const dateRange = this.calculateDateRange(period, startDate, endDate);

    // Get user role
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { 
        role: true,
        doctorProfile: { select: { id: true } },
        pharmacistProfile: { select: { id: true } },
        labStaffProfile: { select: { id: true } },
      },
    });

    const isAdmin = user?.role?.name === 'ADMIN';
    const isDoctor = user?.role?.name === 'DOCTOR';
    const isPharmacist = user?.role?.name === 'PHARMACIST';
    const isLabStaff = user?.role?.name === 'LABORATORY_STAFF';

    // Get profile IDs for filtering
    const doctorProfileId = user?.doctorProfile?.id;
    const pharmacistProfileId = user?.pharmacistProfile?.id;
    const labStaffProfileId = user?.labStaffProfile?.id;

    // Run all queries in parallel for better performance
    const [
      totalUsers,
      totalAdmins,
      totalDoctors,
      totalPharmacists,
      totalLabStaff,
      totalPatients,
      totalConsultations,
      consultationsToday,
      completedConsultations,
      cancelledConsultations,
      totalPrescriptions,
      pendingPrescriptions,
      dispensedPrescriptions,
      totalMedicines,
      activeMedicines,
      lowStockMedicines,
      consultationsInPeriod,
      prescriptionsInPeriod,
      recentConsultations,
      recentPrescriptions,
    ] = await Promise.all([
      // User statistics (Admin only)
      isAdmin ? this.prisma.user.count({ where: { deletedAt: null } }) : Promise.resolve(0),
      isAdmin ? this.prisma.user.count({ where: { deletedAt: null, role: { name: 'ADMIN' } } }) : Promise.resolve(0),
      isAdmin ? this.prisma.user.count({ where: { deletedAt: null, role: { name: 'DOCTOR' } } }) : Promise.resolve(0),
      isAdmin ? this.prisma.user.count({ where: { deletedAt: null, role: { name: 'PHARMACIST' } } }) : Promise.resolve(0),
      isAdmin ? this.prisma.user.count({ where: { deletedAt: null, role: { name: 'LABORATORY_STAFF' } } }) : Promise.resolve(0),
      isAdmin ? this.prisma.user.count({ where: { deletedAt: null, role: { name: 'PATIENT' } } }) : Promise.resolve(0),

      // Consultation statistics (filtered by role)
      this.prisma.consultation.count({ 
        where: { 
          deletedAt: null,
          ...(isDoctor && doctorProfileId ? { doctorId: doctorProfileId } : {}),
        } 
      }),
      this.prisma.consultation.count({
        where: {
          deletedAt: null,
          ...(isDoctor && doctorProfileId ? { doctorId: doctorProfileId } : {}),
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      this.prisma.consultation.count({ 
        where: { 
          deletedAt: null, 
          status: 'COMPLETED',
          ...(isDoctor && doctorProfileId ? { doctorId: doctorProfileId } : {}),
        } 
      }),
      this.prisma.consultation.count({ 
        where: { 
          deletedAt: null, 
          status: 'CANCELLED',
          ...(isDoctor && doctorProfileId ? { doctorId: doctorProfileId } : {}),
        } 
      }),

      // Prescription statistics (filtered by role)
      this.prisma.prescription.count({ 
        where: { 
          deletedAt: null,
          ...(isDoctor && doctorProfileId ? { doctorId: doctorProfileId } : {}),
          ...(isPharmacist && pharmacistProfileId ? { pharmacistId: pharmacistProfileId } : {}),
        } 
      }),
      this.prisma.prescription.count({ 
        where: { 
          deletedAt: null, 
          status: 'PENDING',
          ...(isDoctor && doctorProfileId ? { doctorId: doctorProfileId } : {}),
          ...(isPharmacist && pharmacistProfileId ? { pharmacistId: pharmacistProfileId } : {}),
        } 
      }),
      this.prisma.prescription.count({ 
        where: { 
          deletedAt: null, 
          status: 'DISPENSED',
          ...(isDoctor && doctorProfileId ? { doctorId: doctorProfileId } : {}),
          ...(isPharmacist && pharmacistProfileId ? { pharmacistId: pharmacistProfileId } : {}),
        } 
      }),

      // Medicine statistics (Admin and Pharmacist only)
      (isAdmin || isPharmacist) ? this.prisma.medicine.count({ where: { deletedAt: null } }) : Promise.resolve(0),
      (isAdmin || isPharmacist) ? this.prisma.medicine.count({ where: { deletedAt: null, active: true } }) : Promise.resolve(0),
      (isAdmin || isPharmacist) ? this.prisma.$queryRaw<[{ count: bigint }]>`SELECT COUNT(*) FROM pharmacy_medicines WHERE quantity <= min_stock_level`.then(([{ count }]) => Number(count)).catch(() => 0) : Promise.resolve(0),

      // Period-specific data (filtered by role)
      this.prisma.consultation.count({
        where: {
          deletedAt: null,
          ...(isDoctor && doctorProfileId ? { doctorId: doctorProfileId } : {}),
          createdAt: {
            gte: dateRange.start,
            lte: dateRange.end,
          },
        },
      }),
      this.prisma.prescription.count({
        where: {
          deletedAt: null,
          ...(isDoctor && doctorProfileId ? { doctorId: doctorProfileId } : {}),
          ...(isPharmacist && pharmacistProfileId ? { pharmacistId: pharmacistProfileId } : {}),
          createdAt: {
            gte: dateRange.start,
            lte: dateRange.end,
          },
        },
      }),

      // Recent items (filtered by role)
      this.prisma.consultation.findMany({
        where: { 
          deletedAt: null,
          ...(isDoctor && doctorProfileId ? { doctorId: doctorProfileId } : {}),
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          doctor: {
            include: {
              user: true,
            },
          },
          patient: true,
        },
      }),
      this.prisma.prescription.findMany({
        where: { 
          deletedAt: null,
          ...(isDoctor && doctorProfileId ? { doctorId: doctorProfileId } : {}),
          ...(isPharmacist && pharmacistProfileId ? { pharmacistId: pharmacistProfileId } : {}),
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          doctor: {
            include: {
              user: true,
            },
          },
          patient: true,
        },
      }),
    ]);

    return {
      users: {
        total: totalUsers,
        admins: totalAdmins,
        doctors: totalDoctors,
        pharmacists: totalPharmacists,
        labStaff: totalLabStaff,
        patients: totalPatients,
      },
      consultations: {
        total: totalConsultations,
        today: consultationsToday,
        completed: completedConsultations,
        cancelled: cancelledConsultations,
        inPeriod: consultationsInPeriod,
      },
      prescriptions: {
        total: totalPrescriptions,
        pending: pendingPrescriptions,
        dispensed: dispensedPrescriptions,
        inPeriod: prescriptionsInPeriod,
      },
      medicines: {
        total: totalMedicines,
        active: activeMedicines,
        lowStock: lowStockMedicines,
      },
      recent: {
        consultations: recentConsultations,
        prescriptions: recentPrescriptions,
      },
      period: {
        type: period,
        startDate: dateRange.start.toISOString(),
        endDate: dateRange.end.toISOString(),
      },
    };
  }

  private calculateDateRange(
    period: AnalyticsPeriod,
    startDate?: string,
    endDate?: string,
  ): { start: Date; end: Date } {
    const now = new Date();
    const end = endDate ? new Date(endDate) : now;

    let start: Date;

    switch (period) {
      case AnalyticsPeriod.TODAY:
        start = new Date(now.setHours(0, 0, 0, 0));
        break;

      case AnalyticsPeriod.WEEK:
        start = new Date(now);
        start.setDate(now.getDate() - 7);
        break;

      case AnalyticsPeriod.MONTH:
        start = new Date(now);
        start.setMonth(now.getMonth() - 1);
        break;

      case AnalyticsPeriod.YEAR:
        start = new Date(now);
        start.setFullYear(now.getFullYear() - 1);
        break;

      case AnalyticsPeriod.CUSTOM:
        if (!startDate) {
          // Default to last 30 days if no startDate provided
          start = new Date(now);
          start.setDate(now.getDate() - 30);
        } else {
          start = new Date(startDate);
        }
        break;

      default:
        // Default to last 30 days
        start = new Date(now);
        start.setDate(now.getDate() - 30);
    }

    return { start, end };
  }
}
