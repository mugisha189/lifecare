import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, Min, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class AddPharmacyMedicineDto {
  @ApiProperty({ example: 'medicine-uuid', description: 'Medicine ID from catalog' })
  @IsUUID()
  @IsNotEmpty()
  medicineId: string;

  @ApiProperty({ example: 100, description: 'Quantity in stock', minimum: 0 })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  quantity: number;

  @ApiPropertyOptional({ example: 10, description: 'Minimum stock level for alerts', default: 10 })
  @IsInt()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  minStockLevel?: number;
}
