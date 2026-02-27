import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePharmacyMedicineDto {
  @ApiPropertyOptional({ example: 50, description: 'Quantity in stock', minimum: 0 })
  @IsInt()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  quantity?: number;

  @ApiPropertyOptional({ example: 10, description: 'Minimum stock level', minimum: 0 })
  @IsInt()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  minStockLevel?: number;
}
