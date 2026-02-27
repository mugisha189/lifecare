import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsArray } from 'class-validator';
import { LabTestQuestionTypeEnum } from './create-lab-test-type-question.dto';

export class UpdateLabTestTypeQuestionDto {
  @ApiPropertyOptional({ example: 'Hemoglobin level (g/dL)', description: 'Question label' })
  @IsString()
  @IsOptional()
  label?: string;

  @ApiPropertyOptional({ enum: LabTestQuestionTypeEnum, description: 'Input type for the answer' })
  @IsEnum(LabTestQuestionTypeEnum)
  @IsOptional()
  type?: LabTestQuestionTypeEnum;

  @ApiPropertyOptional({
    example: ['Positive', 'Negative'],
    description: 'For CHOICES type: array of option strings',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  options?: string[];
}
