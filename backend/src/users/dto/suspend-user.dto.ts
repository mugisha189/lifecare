import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SuspensionReason } from '@prisma/client';
import { IsEnum, IsISO8601, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SuspendUserDto {
  @ApiProperty({
    enum: SuspensionReason,
    example: SuspensionReason.MISCONDUCT,
    description: 'Reason for suspension',
  })
  @IsEnum(SuspensionReason)
  @IsNotEmpty()
  reason: SuspensionReason;

  @ApiPropertyOptional({
    example: 'User violated community guidelines by...',
    description: 'Additional details about the suspension',
  })
  @IsOptional()
  @IsString()
  additionalNotes?: string;

  @ApiPropertyOptional({
    example: '2025-12-31T23:59:59Z',
    description: 'Date when suspension ends (optional, indefinite if not provided)',
  })
  @IsOptional()
  @IsISO8601()
  suspendedUntil?: string;
}
