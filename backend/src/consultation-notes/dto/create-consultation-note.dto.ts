import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AttachmentDto {
  @ApiProperty({ example: 'report.pdf', description: 'File name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'https://storage.example.com/report.pdf', description: 'File URL' })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiProperty({ example: 'application/pdf', description: 'File MIME type' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiPropertyOptional({ example: 1024000, description: 'File size in bytes' })
  @IsOptional()
  size?: number;
}

export class CreateConsultationNoteDto {
  @ApiProperty({ example: 'consultation-uuid', description: 'Consultation ID' })
  @IsUUID()
  @IsNotEmpty()
  consultationId: string;

  @ApiPropertyOptional({ example: 'Patient is responding well to treatment', description: 'Note content' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ type: [AttachmentDto], description: 'File attachments' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  @IsOptional()
  attachments?: AttachmentDto[];

  @ApiPropertyOptional({ example: 'parent-note-uuid', description: 'Parent note ID for replies' })
  @IsUUID()
  @IsOptional()
  parentNoteId?: string;
}
