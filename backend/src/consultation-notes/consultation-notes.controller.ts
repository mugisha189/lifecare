import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UseGuards, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiResponse as ApiResponseDecorator, ApiTags } from '@nestjs/swagger';
import { ConsultationNotesService } from './consultation-notes.service';
import { CreateConsultationNoteDto } from './dto/create-consultation-note.dto';
import { UpdateConsultationNoteDto } from './dto/update-consultation-note.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiResponse } from '../types/api-response.interface';
import type { Request } from 'express';

interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination?: string;
  filename: string;
  path?: string;
  buffer?: Buffer;
}

@ApiTags('Consultation Notes')
@Controller('consultation-notes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ConsultationNotesController {
  constructor(private readonly consultationNotesService: ConsultationNotesService) {}

  private getUserRoleFromRequest(req: any): string {
    return req.user?.roleName || '';
  }

  @Post('upload')
  @Roles('ADMIN', 'DOCTOR', 'PATIENT')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @ApiOperation({ summary: 'Upload a file for a consultation note' })
  @ApiResponseDecorator({ status: HttpStatus.CREATED, description: 'File uploaded successfully' })
  async uploadFile(@UploadedFile() file: UploadedFile | undefined): Promise<ApiResponse> {
    if (!file) {
      return { ok: false, message: 'No file provided' };
    }
    const url = `/uploads/consultation-notes/${file.filename}`;
    return {
      ok: true,
      data: { url, name: file.originalname || file.filename, type: file.mimetype, size: file.size },
    };
  }

  @Post()
  @Roles('ADMIN', 'DOCTOR', 'PATIENT')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a note to a consultation' })
  @ApiResponseDecorator({
    status: HttpStatus.CREATED,
    description: 'Note added successfully',
  })
  async create(
    @CurrentUser('sub') userId: string,
    @Body() createDto: CreateConsultationNoteDto,
  ): Promise<ApiResponse> {
    return await this.consultationNotesService.create(userId, createDto);
  }

  @Get('consultation/:consultationId')
  @Roles('ADMIN', 'DOCTOR', 'PATIENT')
  @ApiOperation({ summary: 'Get all notes for a consultation' })
  @ApiParam({ name: 'consultationId', description: 'Consultation ID' })
  @ApiResponseDecorator({
    status: HttpStatus.OK,
    description: 'Notes retrieved successfully',
  })
  async findByConsultation(
    @Param('consultationId') consultationId: string,
    @CurrentUser('sub') userId: string,
    @Req() req: Request & { user: any },
  ): Promise<ApiResponse> {
    const userRole = this.getUserRoleFromRequest(req);
    return await this.consultationNotesService.findByConsultation(consultationId, userId, userRole);
  }

  @Patch(':id')
  @Roles('ADMIN', 'DOCTOR', 'PATIENT')
  @ApiOperation({ summary: 'Update a consultation note' })
  @ApiParam({ name: 'id', description: 'Note ID' })
  @ApiResponseDecorator({
    status: HttpStatus.OK,
    description: 'Note updated successfully',
  })
  async update(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body() updateDto: UpdateConsultationNoteDto,
  ): Promise<ApiResponse> {
    return await this.consultationNotesService.update(id, userId, updateDto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'DOCTOR', 'PATIENT')
  @ApiOperation({ summary: 'Delete a consultation note' })
  @ApiParam({ name: 'id', description: 'Note ID' })
  @ApiResponseDecorator({
    status: HttpStatus.OK,
    description: 'Note deleted successfully',
  })
  async delete(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Req() req: Request & { user: any },
  ): Promise<ApiResponse> {
    const userRole = this.getUserRoleFromRequest(req);
    return await this.consultationNotesService.delete(id, userId, userRole);
  }
}
