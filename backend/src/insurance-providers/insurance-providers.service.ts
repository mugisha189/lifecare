import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApiResponse } from '../types/api-response.interface';
import { CreateInsuranceProviderDto } from './dto/create-insurance-provider.dto';
import { UpdateInsuranceProviderDto } from './dto/update-insurance-provider.dto';
import { QueryInsuranceProvidersDto } from './dto/query-insurance-providers.dto';

@Injectable()
export class InsuranceProvidersService {
  private readonly logger = new Logger(InsuranceProvidersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(
    createInsuranceProviderDto: CreateInsuranceProviderDto,
  ): Promise<ApiResponse> {
    try {
      // Validate that dividend percentages sum to 100
      const totalDividend =
        createInsuranceProviderDto.patientDividendPercent +
        createInsuranceProviderDto.insuranceDividendPercent;

      if (totalDividend !== 100) {
        throw new BadRequestException(
          'Patient and insurance dividend percentages must sum to 100%',
        );
      }

      // Check if insurance provider with same name already exists
      const existingProvider = await this.prisma.insuranceProvider.findFirst({
        where: {
          name: createInsuranceProviderDto.name,
          deletedAt: null,
        },
      });

      if (existingProvider) {
        throw new ConflictException(
          'Insurance provider with this name already exists',
        );
      }

      const insuranceProvider = await this.prisma.insuranceProvider.create({
        data: {
          ...createInsuranceProviderDto,
          active: true,
        },
      });

      this.logger.log(
        `Insurance provider created successfully: ${insuranceProvider.id}`,
      );

      return {
        ok: true,
        message: 'Insurance provider created successfully',
        data: insuranceProvider,
      };
    } catch (error) {
      this.logger.error('Error creating insurance provider:', error);

      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        return {
          ok: false,
          message: error.message,
        };
      }

      return {
        ok: false,
        message: 'Failed to create insurance provider',
      };
    }
  }

  async findAll(query?: QueryInsuranceProvidersDto): Promise<ApiResponse> {
    try {
      const { search, active, page = 1, limit = 50 } = query || {};

      const where: any = {
        deletedAt: null,
      };

      if (search) {
        where.name = {
          contains: search,
          mode: 'insensitive',
        };
      }

      if (active !== undefined) {
        where.active = active;
      }

      const skip = (page - 1) * limit;

      const [insuranceProviders, total] = await Promise.all([
        this.prisma.insuranceProvider.findMany({
          where,
          orderBy: {
            name: 'asc',
          },
          skip,
          take: limit,
          include: {
            _count: {
              select: {
                patients: true,
              },
            },
          },
        }),
        this.prisma.insuranceProvider.count({ where }),
      ]);

      return {
        ok: true,
        data: {
          insuranceProviders,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      this.logger.error('Error fetching insurance providers:', error);
      return {
        ok: false,
        message: 'Failed to retrieve insurance providers',
      };
    }
  }

  async findOne(id: string): Promise<ApiResponse> {
    try {
      const insuranceProvider = await this.prisma.insuranceProvider.findFirst({
        where: {
          id,
          deletedAt: null,
        },
        include: {
          _count: {
            select: {
              patients: true,
            },
          },
        },
      });

      if (!insuranceProvider) {
        throw new NotFoundException(
          `Insurance provider with ID "${id}" not found`,
        );
      }

      return {
        ok: true,
        data: insuranceProvider,
      };
    } catch (error) {
      this.logger.error(`Error fetching insurance provider ${id}:`, error);

      if (error instanceof NotFoundException) {
        return {
          ok: false,
          message: error.message,
        };
      }

      return {
        ok: false,
        message: 'Failed to retrieve insurance provider',
      };
    }
  }

  async update(
    id: string,
    updateInsuranceProviderDto: UpdateInsuranceProviderDto,
  ): Promise<ApiResponse> {
    try {
      // Check if insurance provider exists
      const existingProvider = await this.prisma.insuranceProvider.findFirst({
        where: {
          id,
          deletedAt: null,
        },
      });

      if (!existingProvider) {
        throw new NotFoundException(
          `Insurance provider with ID "${id}" not found`,
        );
      }

      // Validate dividend percentages if provided
      const patientPercent =
        updateInsuranceProviderDto.patientDividendPercent ??
        existingProvider.patientDividendPercent;
      const insurancePercent =
        updateInsuranceProviderDto.insuranceDividendPercent ??
        existingProvider.insuranceDividendPercent;

      if (patientPercent + insurancePercent !== 100) {
        throw new BadRequestException(
          'Patient and insurance dividend percentages must sum to 100%',
        );
      }

      // Check if name is being changed and if it's already taken
      if (
        updateInsuranceProviderDto.name &&
        updateInsuranceProviderDto.name !== existingProvider.name
      ) {
        const duplicateProvider = await this.prisma.insuranceProvider.findFirst(
          {
            where: {
              name: updateInsuranceProviderDto.name,
              deletedAt: null,
              NOT: {
                id,
              },
            },
          },
        );

        if (duplicateProvider) {
          throw new ConflictException(
            'Insurance provider with this name already exists',
          );
        }
      }

      const insuranceProvider = await this.prisma.insuranceProvider.update({
        where: { id },
        data: updateInsuranceProviderDto,
      });

      this.logger.log(`Insurance provider updated successfully: ${id}`);

      return {
        ok: true,
        message: 'Insurance provider updated successfully',
        data: insuranceProvider,
      };
    } catch (error) {
      this.logger.error(`Error updating insurance provider ${id}:`, error);

      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        return {
          ok: false,
          message: error.message,
        };
      }

      return {
        ok: false,
        message: 'Failed to update insurance provider',
      };
    }
  }

  async remove(id: string): Promise<ApiResponse> {
    try {
      const insuranceProvider = await this.prisma.insuranceProvider.findFirst({
        where: {
          id,
          deletedAt: null,
        },
      });

      if (!insuranceProvider) {
        throw new NotFoundException(
          `Insurance provider with ID "${id}" not found`,
        );
      }

      // Check if provider has active patients
      const patientCount = await this.prisma.patientProfile.count({
        where: {
          insuranceProviderId: id,
          deletedAt: null,
        },
      });

      if (patientCount > 0) {
        return {
          ok: false,
          message: `Cannot delete insurance provider with ${patientCount} active patient(s). Please deactivate it instead.`,
        };
      }

      await this.prisma.insuranceProvider.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        },
      });

      this.logger.log(`Insurance provider deleted successfully: ${id}`);

      return {
        ok: true,
        message: 'Insurance provider deleted successfully',
      };
    } catch (error) {
      this.logger.error(`Error deleting insurance provider ${id}:`, error);

      if (error instanceof NotFoundException) {
        return {
          ok: false,
          message: error.message,
        };
      }

      return {
        ok: false,
        message: 'Failed to delete insurance provider',
      };
    }
  }

  async toggleActive(id: string, active: boolean): Promise<ApiResponse> {
    try {
      const insuranceProvider = await this.prisma.insuranceProvider.findFirst({
        where: {
          id,
          deletedAt: null,
        },
      });

      if (!insuranceProvider) {
        throw new NotFoundException(
          `Insurance provider with ID "${id}" not found`,
        );
      }

      await this.prisma.insuranceProvider.update({
        where: { id },
        data: { active },
      });

      this.logger.log(
        `Insurance provider status toggled: ${id} - Active: ${active}`,
      );

      return {
        ok: true,
        message: `Insurance provider ${active ? 'activated' : 'deactivated'} successfully`,
      };
    } catch (error) {
      this.logger.error(
        `Error toggling insurance provider status ${id}:`,
        error,
      );

      if (error instanceof NotFoundException) {
        return {
          ok: false,
          message: error.message,
        };
      }

      return {
        ok: false,
        message: 'Failed to update insurance provider status',
      };
    }
  }

  async getPatients(id: string): Promise<ApiResponse> {
    try {
      const insuranceProvider = await this.prisma.insuranceProvider.findFirst({
        where: {
          id,
          deletedAt: null,
        },
      });

      if (!insuranceProvider) {
        throw new NotFoundException(
          `Insurance provider with ID "${id}" not found`,
        );
      }

      const patients = await this.prisma.patientProfile.findMany({
        where: {
          insuranceProviderId: id,
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
            },
          },
        },
      });

      return {
        ok: true,
        data: patients,
      };
    } catch (error) {
      this.logger.error(
        `Error fetching insurance provider patients ${id}:`,
        error,
      );

      if (error instanceof NotFoundException) {
        return {
          ok: false,
          message: error.message,
        };
      }

      return {
        ok: false,
        message: 'Failed to retrieve insurance provider patients',
      };
    }
  }
}
