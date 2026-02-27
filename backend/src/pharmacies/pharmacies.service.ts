import { Injectable, Logger, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApiResponse } from '../types/api-response.interface';
import { CreatePharmacyDto } from './dto/create-pharmacy.dto';
import { UpdatePharmacyDto } from './dto/update-pharmacy.dto';
import { AddPharmacyMedicineDto } from './dto/add-pharmacy-medicine.dto';
import { UpdatePharmacyMedicineDto } from './dto/update-pharmacy-medicine.dto';

@Injectable()
export class PharmaciesService {
  private readonly logger = new Logger(PharmaciesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createPharmacyDto: CreatePharmacyDto): Promise<ApiResponse> {
    try {
      const existingPharmacy = await this.prisma.pharmacy.findFirst({
        where: {
          name: createPharmacyDto.name,
          deletedAt: null,
        },
      });

      if (existingPharmacy) {
        throw new ConflictException('Pharmacy with this name already exists');
      }

      const pharmacy = await this.prisma.pharmacy.create({
        data: {
          ...createPharmacyDto,
          country: createPharmacyDto.country || 'Rwanda',
          active: createPharmacyDto.active ?? true,
        },
      });

      this.logger.log(`Pharmacy created successfully: ${pharmacy.id}`);

      return {
        ok: true,
        message: 'Pharmacy created successfully',
        data: pharmacy,
      };
    } catch (error) {
      this.logger.error('Error creating pharmacy:', error);

      if (error instanceof ConflictException) {
        return {
          ok: false,
          message: error.message,
        };
      }

      return {
        ok: false,
        message: 'Failed to create pharmacy',
      };
    }
  }

  async findMyPharmacies(userId: string): Promise<ApiResponse> {
    try {
      const pharmacist = await this.prisma.pharmacistProfile.findFirst({
        where: { userId, deletedAt: null },
        select: { pharmacyId: true },
      });
      const pharmacyId = pharmacist?.pharmacyId ?? null;
      if (!pharmacyId) {
        return { ok: true, data: [] };
      }
      const pharmacy = await this.prisma.pharmacy.findFirst({
        where: { id: pharmacyId, deletedAt: null },
      });
      return { ok: true, data: pharmacy ? [pharmacy] : [] };
    } catch (error) {
      this.logger.error('Error fetching my pharmacies:', error);
      return { ok: false, message: 'Failed to retrieve pharmacies' };
    }
  }

  async findAll(): Promise<ApiResponse> {
    try {
      const pharmacies = await this.prisma.pharmacy.findMany({
        where: {
          deletedAt: null,
        },
        orderBy: {
          name: 'asc',
        },
        include: {
          _count: {
            select: {
              pharmacists: true,
            },
          },
        },
      });

      return {
        ok: true,
        data: pharmacies,
      };
    } catch (error) {
      this.logger.error('Error fetching pharmacies:', error);
      return {
        ok: false,
        message: 'Failed to retrieve pharmacies',
      };
    }
  }

  async findOne(id: string): Promise<ApiResponse> {
    try {
      const pharmacy = await this.prisma.pharmacy.findFirst({
        where: {
          id,
          deletedAt: null,
        },
        include: {
          _count: {
            select: {
              pharmacists: true,
            },
          },
        },
      });

      if (!pharmacy) {
        throw new NotFoundException(`Pharmacy with ID "${id}" not found`);
      }

      return {
        ok: true,
        data: pharmacy,
      };
    } catch (error) {
      this.logger.error(`Error fetching pharmacy ${id}:`, error);

      if (error instanceof NotFoundException) {
        return {
          ok: false,
          message: error.message,
        };
      }

      return {
        ok: false,
        message: 'Failed to retrieve pharmacy',
      };
    }
  }

  async update(id: string, updatePharmacyDto: UpdatePharmacyDto): Promise<ApiResponse> {
    try {
      const existingPharmacy = await this.prisma.pharmacy.findFirst({
        where: {
          id,
          deletedAt: null,
        },
      });

      if (!existingPharmacy) {
        throw new NotFoundException(`Pharmacy with ID "${id}" not found`);
      }

      if (updatePharmacyDto.name && updatePharmacyDto.name !== existingPharmacy.name) {
        const duplicatePharmacy = await this.prisma.pharmacy.findFirst({
          where: {
            name: updatePharmacyDto.name,
            deletedAt: null,
            NOT: {
              id,
            },
          },
        });

        if (duplicatePharmacy) {
          throw new ConflictException('Pharmacy with this name already exists');
        }
      }

      const pharmacy = await this.prisma.pharmacy.update({
        where: { id },
        data: updatePharmacyDto,
      });

      this.logger.log(`Pharmacy updated successfully: ${id}`);

      return {
        ok: true,
        message: 'Pharmacy updated successfully',
        data: pharmacy,
      };
    } catch (error) {
      this.logger.error(`Error updating pharmacy ${id}:`, error);

      if (error instanceof NotFoundException || error instanceof ConflictException) {
        return {
          ok: false,
          message: error.message,
        };
      }

      return {
        ok: false,
        message: 'Failed to update pharmacy',
      };
    }
  }

  async remove(id: string): Promise<ApiResponse> {
    try {
      const pharmacy = await this.prisma.pharmacy.findFirst({
        where: {
          id,
          deletedAt: null,
        },
      });

      if (!pharmacy) {
        throw new NotFoundException(`Pharmacy with ID "${id}" not found`);
      }

      await this.prisma.pharmacy.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        },
      });

      this.logger.log(`Pharmacy deleted successfully: ${id}`);

      return {
        ok: true,
        message: 'Pharmacy deleted successfully',
      };
    } catch (error) {
      this.logger.error(`Error deleting pharmacy ${id}:`, error);

      if (error instanceof NotFoundException) {
        return {
          ok: false,
          message: error.message,
        };
      }

      return {
        ok: false,
        message: 'Failed to delete pharmacy',
      };
    }
  }

  async toggleActive(id: string, active: boolean): Promise<ApiResponse> {
    try {
      const pharmacy = await this.prisma.pharmacy.findFirst({
        where: {
          id,
          deletedAt: null,
        },
      });

      if (!pharmacy) {
        throw new NotFoundException(`Pharmacy with ID "${id}" not found`);
      }

      await this.prisma.pharmacy.update({
        where: { id },
        data: { active },
      });

      this.logger.log(`Pharmacy status toggled: ${id} - Active: ${active}`);

      return {
        ok: true,
        message: `Pharmacy ${active ? 'activated' : 'deactivated'} successfully`,
      };
    } catch (error) {
      this.logger.error(`Error toggling pharmacy status ${id}:`, error);

      if (error instanceof NotFoundException) {
        return {
          ok: false,
          message: error.message,
        };
      }

      return {
        ok: false,
        message: 'Failed to update pharmacy status',
      };
    }
  }

  async getPharmacyPharmacists(id: string): Promise<ApiResponse> {
    try {
      const pharmacy = await this.prisma.pharmacy.findFirst({
        where: {
          id,
          deletedAt: null,
        },
      });

      if (!pharmacy) {
        throw new NotFoundException(`Pharmacy with ID "${id}" not found`);
      }

      const pharmacists = await this.prisma.pharmacistProfile.findMany({
        where: {
          pharmacyId: id,
          deletedAt: null,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phoneNumber: true,
              profilePicture: true,
              role: true,
            },
          },
        },
      });

      return {
        ok: true,
        data: pharmacists,
      };
    } catch (error) {
      this.logger.error(`Error fetching pharmacy pharmacists ${id}:`, error);

      if (error instanceof NotFoundException) {
        return {
          ok: false,
          message: error.message,
        };
      }

      return {
        ok: false,
        message: 'Failed to retrieve pharmacy pharmacists',
      };
    }
  }

  async assignPharmacist(pharmacyId: string, userId: string): Promise<ApiResponse> {
    try {
      const pharmacy = await this.prisma.pharmacy.findFirst({
        where: {
          id: pharmacyId,
          deletedAt: null,
        },
      });

      if (!pharmacy) {
        throw new NotFoundException(`Pharmacy with ID "${pharmacyId}" not found`);
      }

      // Find pharmacist profile by user ID
      const pharmacist = await this.prisma.pharmacistProfile.findFirst({
        where: {
          userId,
          deletedAt: null,
        },
      });

      if (!pharmacist) {
        return {
          ok: false,
          message: `This user does not have a pharmacist profile yet. Please ask them to complete their profile first.`,
        };
      }

      await this.prisma.pharmacistProfile.update({
        where: { id: pharmacist.id },
        data: {
          pharmacyId,
        },
      });

      this.logger.log(`Pharmacist ${pharmacist.id} assigned to pharmacy ${pharmacyId}`);

      return {
        ok: true,
        message: 'Pharmacist assigned to pharmacy successfully',
      };
    } catch (error) {
      this.logger.error(`Error assigning pharmacist to pharmacy:`, error);

      if (error instanceof NotFoundException) {
        return {
          ok: false,
          message: error.message,
        };
      }

      return {
        ok: false,
        message: 'Failed to assign pharmacist to pharmacy',
      };
    }
  }

  async removePharmacist(pharmacyId: string, pharmacistId: string): Promise<ApiResponse> {
    try {
      const pharmacy = await this.prisma.pharmacy.findFirst({
        where: {
          id: pharmacyId,
          deletedAt: null,
        },
      });

      if (!pharmacy) {
        throw new NotFoundException(`Pharmacy with ID "${pharmacyId}" not found`);
      }

      const pharmacist = await this.prisma.pharmacistProfile.findFirst({
        where: {
          id: pharmacistId,
          pharmacyId,
          deletedAt: null,
        },
      });

      if (!pharmacist) {
        throw new NotFoundException(`Pharmacist not found in this pharmacy`);
      }

      await this.prisma.pharmacistProfile.update({
        where: { id: pharmacistId },
        data: {
          pharmacyId: null,
        },
      });

      this.logger.log(`Pharmacist ${pharmacistId} removed from pharmacy ${pharmacyId}`);

      return {
        ok: true,
        message: 'Pharmacist removed from pharmacy successfully',
      };
    } catch (error) {
      this.logger.error(`Error removing pharmacist from pharmacy:`, error);

      if (error instanceof NotFoundException) {
        return {
          ok: false,
          message: error.message,
        };
      }

      return {
        ok: false,
        message: 'Failed to remove pharmacist from pharmacy',
      };
    }
  }

  async getMyPharmacyId(userId: string): Promise<string | null> {
    const pharmacist = await this.prisma.pharmacistProfile.findFirst({
      where: { userId, deletedAt: null },
      select: { pharmacyId: true },
    });
    return pharmacist?.pharmacyId ?? null;
  }

  async getMyInventory(userId: string): Promise<ApiResponse> {
    const pharmacyId = await this.getMyPharmacyId(userId);
    if (!pharmacyId) {
      throw new ForbiddenException('You are not assigned to a pharmacy');
    }
    const pharmacy = await this.prisma.pharmacy.findFirst({
      where: { id: pharmacyId, active: true, deletedAt: null },
    });
    if (!pharmacy) {
      throw new ForbiddenException('Your pharmacy is not active');
    }
    const items = await this.prisma.pharmacyMedicine.findMany({
      where: { pharmacyId },
      include: { medicine: true },
      orderBy: [{ inventoryDate: 'desc' }, { medicine: { name: 'asc' } }],
    });
    return { ok: true, data: items, message: 'Inventory retrieved successfully' };
  }

  async addMedicineToMyPharmacy(userId: string, dto: AddPharmacyMedicineDto): Promise<ApiResponse> {
    const pharmacyId = await this.getMyPharmacyId(userId);
    if (!pharmacyId) {
      throw new ForbiddenException('You are not assigned to a pharmacy');
    }
    const pharmacy = await this.prisma.pharmacy.findFirst({
      where: { id: pharmacyId, active: true, deletedAt: null },
    });
    if (!pharmacy) {
      throw new ForbiddenException('Your pharmacy is not active');
    }
    const medicine = await this.prisma.medicine.findFirst({
      where: { id: dto.medicineId, active: true, deletedAt: null },
    });
    if (!medicine) {
      throw new NotFoundException('Medicine not found or inactive');
    }
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const existing = await this.prisma.pharmacyMedicine.findUnique({
      where: {
        pharmacyId_medicineId_inventoryDate: {
          pharmacyId,
          medicineId: dto.medicineId,
          inventoryDate: today,
        },
      },
      include: { medicine: true },
    });
    if (existing) {
      const updated = await this.prisma.pharmacyMedicine.update({
        where: { id: existing.id },
        data: { quantity: { increment: dto.quantity } },
        include: { medicine: true },
      });
      this.logger.log(`Pharmacy ${pharmacyId} incremented medicine ${dto.medicineId} quantity by ${dto.quantity}`);
      return { ok: true, data: updated, message: 'Inventory quantity updated' };
    }
    const created = await this.prisma.pharmacyMedicine.create({
      data: {
        pharmacyId,
        medicineId: dto.medicineId,
        inventoryDate: today,
        quantity: dto.quantity,
        minStockLevel: dto.minStockLevel ?? 10,
      },
      include: { medicine: true },
    });
    this.logger.log(`Pharmacy ${pharmacyId} added medicine ${dto.medicineId} to inventory`);
    return { ok: true, data: created, message: 'Medicine added to inventory' };
  }

  async updateMyPharmacyMedicine(
    userId: string,
    pharmacyMedicineId: string,
    dto: UpdatePharmacyMedicineDto,
  ): Promise<ApiResponse> {
    const pharmacyId = await this.getMyPharmacyId(userId);
    if (!pharmacyId) {
      throw new ForbiddenException('You are not assigned to a pharmacy');
    }
    const pm = await this.prisma.pharmacyMedicine.findFirst({
      where: { id: pharmacyMedicineId, pharmacyId },
      include: { medicine: true },
    });
    if (!pm) {
      throw new NotFoundException('Inventory item not found');
    }
    const updated = await this.prisma.pharmacyMedicine.update({
      where: { id: pharmacyMedicineId },
      data: {
        ...(dto.quantity !== undefined && { quantity: dto.quantity }),
        ...(dto.minStockLevel !== undefined && { minStockLevel: dto.minStockLevel }),
      },
      include: { medicine: true },
    });
    return { ok: true, data: updated, message: 'Inventory updated' };
  }

  async removeMyPharmacyMedicine(userId: string, pharmacyMedicineId: string): Promise<ApiResponse> {
    const pharmacyId = await this.getMyPharmacyId(userId);
    if (!pharmacyId) {
      throw new ForbiddenException('You are not assigned to a pharmacy');
    }
    const pm = await this.prisma.pharmacyMedicine.findFirst({
      where: { id: pharmacyMedicineId, pharmacyId },
    });
    if (!pm) {
      throw new NotFoundException('Inventory item not found');
    }
    await this.prisma.pharmacyMedicine.delete({
      where: { id: pharmacyMedicineId },
    });
    this.logger.log(`Pharmacy ${pharmacyId} removed medicine ${pm.medicineId} from inventory`);
    return { ok: true, message: 'Medicine removed from inventory' };
  }
}
