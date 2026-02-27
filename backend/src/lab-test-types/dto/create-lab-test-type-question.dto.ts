import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsArray, IsOptional } from 'class-validator';

export enum LabTestQuestionTypeEnum {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  PERCENTAGE = 'PERCENTAGE',
  CHOICES = 'CHOICES',
}

export class CreateLabTestTypeQuestionDto {
  @ApiProperty({ example: 'Hemoglobin level (g/dL)', description: 'Question label' })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({ enum: LabTestQuestionTypeEnum, description: 'Input type for the answer' })
  @IsEnum(LabTestQuestionTypeEnum)
  type: LabTestQuestionTypeEnum;

  @ApiPropertyOptional({
    example: ['Positive', 'Negative', 'Indeterminate'],
    description: 'For CHOICES type: array of option strings',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  options?: string[];
}
