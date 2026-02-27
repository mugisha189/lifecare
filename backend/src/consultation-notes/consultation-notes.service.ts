import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApiResponse } from '../types/api-response.interface';
import { CreateConsultationNoteDto } from './dto/create-consultation-note.dto';
import { UpdateConsultationNoteDto } from './dto/update-consultation-note.dto';

@Injectable()
export class ConsultationNotesService {
  private readonly logger = new Logger(ConsultationNotesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createDto: CreateConsultationNoteDto): Promise<ApiResponse> {
    try {
      // Verify consultation exists
      const consultation = await this.prisma.consultation.findFirst({
        where: {
          id: createDto.consultationId,
          deletedAt: null,
        },
      });

      if (!consultation) {
        throw new NotFoundException('Consultation not found');
      }

      let isAuthorized = consultation.patientId === userId;
      if (!isAuthorized) {
        const doctorProfile = await this.prisma.doctorProfile.findUnique({
          where: { userId },
        });
        isAuthorized = doctorProfile?.id === consultation.doctorId;
      }
      if (!isAuthorized) {
        return {
          ok: false,
          message: 'You are not authorized to add notes to this consultation',
        };
      }

      // If parentNoteId provided, verify it exists
      if (createDto.parentNoteId) {
        const parentNote = await this.prisma.consultationNote.findFirst({
          where: {
            id: createDto.parentNoteId,
            consultationId: createDto.consultationId,
            deletedAt: null,
          },
        });

        if (!parentNote) {
          return {
            ok: false,
            message: 'Parent note not found',
          };
        }
      }

      // Create consultation note
      const note = await this.prisma.consultationNote.create({
        data: {
          consultationId: createDto.consultationId,
          userId,
          content: createDto.content,
          attachments: (createDto.attachments || []) as any,
          parentNoteId: createDto.parentNoteId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profilePicture: true,
              role: {
                select: {
                  name: true,
                },
              },
            },
          },
          parentNote: {
            select: {
              id: true,
              content: true,
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
          _count: {
            select: {
              replies: true,
            },
          },
        },
      });

      this.logger.log(`Consultation note created: ${note.id}`);

      return {
        ok: true,
        message: 'Note added successfully',
        data: note,
      };
    } catch (error) {
      this.logger.error('Error creating consultation note:', error);

      if (error instanceof NotFoundException) {
        return {
          ok: false,
          message: error.message,
        };
      }

      return {
        ok: false,
        message: 'Failed to create consultation note',
      };
    }
  }

  async findByConsultation(consultationId: string, userId: string, userRole: string): Promise<ApiResponse> {
    try {
      // Verify consultation exists
      const consultation = await this.prisma.consultation.findFirst({
        where: {
          id: consultationId,
          deletedAt: null,
        },
      });

      if (!consultation) {
        throw new NotFoundException('Consultation not found');
      }

      const isAdmin = userRole === 'ADMIN';
      const isPatient = consultation.patientId === userId;
      let isDoctor = false;
      if (userRole === 'DOCTOR') {
        const doctorProfile = await this.prisma.doctorProfile.findUnique({
          where: { userId },
        });
        isDoctor = doctorProfile?.id === consultation.doctorId;
      }

      if (!isAdmin && !isDoctor && !isPatient) {
        return {
          ok: false,
          message: 'You are not authorized to view notes for this consultation',
        };
      }

      // Get all notes (only top-level notes, replies are included via include)
      const notes = await this.prisma.consultationNote.findMany({
        where: {
          consultationId,
          deletedAt: null,
          parentNoteId: null, // Only get top-level notes
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profilePicture: true,
              role: {
                select: {
                  name: true,
                },
              },
            },
          },
          replies: {
            where: {
              deletedAt: null,
            },
            orderBy: {
              createdAt: 'asc',
            },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  profilePicture: true,
                  role: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
              _count: {
                select: {
                  replies: true,
                },
              },
            },
          },
          _count: {
            select: {
              replies: true,
            },
          },
        },
      });

      return {
        ok: true,
        data: notes,
      };
    } catch (error) {
      this.logger.error('Error fetching consultation notes:', error);

      if (error instanceof NotFoundException) {
        return {
          ok: false,
          message: error.message,
        };
      }

      return {
        ok: false,
        message: 'Failed to fetch consultation notes',
      };
    }
  }

  async update(id: string, userId: string, updateDto: UpdateConsultationNoteDto): Promise<ApiResponse> {
    try {
      // Find the note
      const note = await this.prisma.consultationNote.findFirst({
        where: {
          id,
          deletedAt: null,
        },
      });

      if (!note) {
        throw new NotFoundException('Note not found');
      }

      // Only the creator can edit their note
      if (note.userId !== userId) {
        return {
          ok: false,
          message: 'You can only edit your own notes',
        };
      }

      // Update the note
      const updatedNote = await this.prisma.consultationNote.update({
        where: { id },
        data: {
          content: updateDto.content,
          attachments: (updateDto.attachments || note.attachments) as any,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profilePicture: true,
              role: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      this.logger.log(`Consultation note updated: ${id}`);

      return {
        ok: true,
        message: 'Note updated successfully',
        data: updatedNote,
      };
    } catch (error) {
      this.logger.error('Error updating consultation note:', error);

      if (error instanceof NotFoundException) {
        return {
          ok: false,
          message: error.message,
        };
      }

      return {
        ok: false,
        message: 'Failed to update consultation note',
      };
    }
  }

  async delete(id: string, userId: string, userRole: string): Promise<ApiResponse> {
    try {
      // Find the note
      const note = await this.prisma.consultationNote.findFirst({
        where: {
          id,
          deletedAt: null,
        },
      });

      if (!note) {
        throw new NotFoundException('Note not found');
      }

      // Only creator or admin can delete
      const isAdmin = userRole === 'ADMIN';
      const isOwner = note.userId === userId;

      if (!isAdmin && !isOwner) {
        return {
          ok: false,
          message: 'You can only delete your own notes',
        };
      }

      // Soft delete
      await this.prisma.consultationNote.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        },
      });

      this.logger.log(`Consultation note deleted: ${id}`);

      return {
        ok: true,
        message: 'Note deleted successfully',
      };
    } catch (error) {
      this.logger.error('Error deleting consultation note:', error);

      if (error instanceof NotFoundException) {
        return {
          ok: false,
          message: error.message,
        };
      }

      return {
        ok: false,
        message: 'Failed to delete consultation note',
      };
    }
  }
}
