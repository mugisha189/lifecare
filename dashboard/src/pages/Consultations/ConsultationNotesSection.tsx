import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { consultationNotesApi, getAttachmentUrl } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Send, Paperclip, Reply, Trash2, FileText, Image as ImageIcon, File, Loader2, X } from 'lucide-react';
import { format, isValid } from 'date-fns';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import useAuth from '@/hooks/useAuth';

function formatNoteDate(value: string | Date | null | undefined): string {
  if (value == null) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  return isValid(d) ? format(d, 'MMM d, yyyy h:mm a') : '—';
}

function normalizeNotesList(raw: unknown): ConsultationNote[] {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object' && 'data' in raw && Array.isArray((raw as { data: unknown }).data)) {
    return (raw as { data: ConsultationNote[] }).data;
  }
  return [];
}

interface ConsultationNote {
  id: string;
  consultationId: string;
  content?: string;
  attachments?: Array<{ name: string; url: string; type: string; size?: number }>;
  parentNoteId?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    profilePicture?: string;
    role: {
      name: string;
    };
  };
  parentNote?: {
    id: string;
    content?: string;
    user: {
      name: string;
    };
  };
  replies?: ConsultationNote[];
  _count?: {
    replies: number;
  };
}

interface ConsultationNotesSectionProps {
  consultationId: string;
}

export default function ConsultationNotesSection({ consultationId }: ConsultationNotesSectionProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<ConsultationNote | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<Array<{ name: string; url: string; type: string; size?: number }>>([]);
  const [uploading, setUploading] = useState(false);

  const { data: notesResponse, isLoading } = useQuery({
    queryKey: ['consultation-notes', consultationId],
    queryFn: async () => {
      const response = await consultationNotesApi.getByConsultation(consultationId);
      return response.data;
    },
  });

  const notes = normalizeNotesList(notesResponse);

  // Create note mutation
  const createNote = useMutation({
    mutationFn: (data: { content?: string; parentNoteId?: string; attachments?: any }) =>
      consultationNotesApi.create({
        consultationId,
        ...data,
      }),
    onSuccess: (response: any) => {
      toast.success('Note added successfully');
      setContent('');
      setReplyingTo(null);
      setAttachments([]);
      const newNote = response?.data?.data;
      if (newNote) {
        queryClient.setQueryData(['consultation-notes', consultationId], (old: any) => {
          const prev = (old?.data ?? []) as ConsultationNote[];
          if (newNote.parentNoteId) {
            return {
              ...old,
              data: prev.map((n: ConsultationNote) =>
                n.id === newNote.parentNoteId
                  ? { ...n, replies: [...(n.replies || []), newNote] }
                  : n
              ),
            };
          }
          return { ...old, data: [newNote, ...prev] };
        });
      }
      queryClient.invalidateQueries({ queryKey: ['consultation-notes', consultationId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add note');
    },
  });

  // Delete note mutation
  const deleteNote = useMutation({
    mutationFn: (noteId: string) => consultationNotesApi.delete(noteId),
    onSuccess: () => {
      toast.success('Note deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['consultation-notes', consultationId] });
      setDeleteDialogOpen(false);
      setNoteToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete note');
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await consultationNotesApi.upload(file);
        const payload = res.data?.data;
        if (payload?.url) {
          setAttachments(prev => [...prev, { name: payload.name || file.name, url: payload.url, type: payload.type || file.type, size: payload.size ?? file.size }]);
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!content.trim() && attachments.length === 0) {
      toast.error('Please enter a note or attach a file');
      return;
    }

    createNote.mutate({
      content: content.trim() || undefined,
      parentNoteId: replyingTo?.id,
      attachments: attachments.length ? attachments : undefined,
    });
  };

  const handleDeleteClick = (noteId: string) => {
    setNoteToDelete(noteId);
    setDeleteDialogOpen(true);
  };

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName) {
      case 'DOCTOR':
        return 'bg-blue-100 text-blue-800';
      case 'PATIENT':
        return 'bg-green-100 text-green-800';
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFileIcon = (type: string) => {
    if (type?.startsWith('image/')) return <ImageIcon className='w-5 h-5 text-blue-600' />;
    if (type?.includes('pdf')) return <FileText className='w-5 h-5 text-red-600' />;
    return <File className='w-5 h-5 text-gray-600' />;
  };

  const getFileTypeLabel = (type: string) => {
    if (type?.startsWith('image/')) return 'Image';
    if (type?.includes('pdf')) return 'PDF';
    return 'File';
  };

  const renderNote = (note: ConsultationNote, isReply: boolean = false) => {
    const isOwnNote = user?.email === note.user.email;

    return (
      <div key={note.id} className={`${isReply ? 'ml-12 mt-3' : 'mb-6'}`}>
        <div className='bg-white border border-gray-200 rounded-lg p-4'>
          {/* Note Header */}
          <div className='flex items-start justify-between mb-3'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center'>
                {note.user.profilePicture ? (
                  <img
                    src={note.user.profilePicture}
                    alt={note.user.name}
                    className='w-full h-full rounded-full object-cover'
                  />
                ) : (
                  <span className='text-blue-700 font-semibold text-sm'>
                    {note.user.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <div className='flex items-center gap-2'>
                  <p className='font-medium text-gray-900'>{note.user.name}</p>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${getRoleBadgeColor(note.user.role.name)}`}>
                    {note.user.role.name}
                  </span>
                </div>
                <p className='text-xs text-gray-500'>{formatNoteDate(note.createdAt)}</p>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              {!isReply && (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setReplyingTo(note)}
                  className='text-blue-600 hover:text-blue-700'
                >
                  <Reply className='w-4 h-4 mr-1' />
                  Reply
                </Button>
              )}
              {isOwnNote && (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => handleDeleteClick(note.id)}
                  className='text-red-600 hover:text-red-700'
                >
                  <Trash2 className='w-4 h-4' />
                </Button>
              )}
            </div>
          </div>

          {/* Reply To Info */}
          {note.parentNote && (
            <div className='mb-3 p-2 bg-gray-50 border-l-2 border-blue-500 rounded'>
              <p className='text-xs text-gray-600'>
                Replying to <span className='font-medium'>{note.parentNote.user.name}</span>
              </p>
              {note.parentNote.content && (
                <p className='text-xs text-gray-500 line-clamp-2 mt-1'>{note.parentNote.content}</p>
              )}
            </div>
          )}

          {/* Note Content */}
          {note.content && (
            <p className='text-gray-700 mb-3 whitespace-pre-wrap'>{note.content}</p>
          )}

          {/* Attachments */}
          {note.attachments && Array.isArray(note.attachments) && note.attachments.length > 0 && (
            <div className='mt-3 pt-3 border-t border-gray-100'>
              <p className='text-xs font-medium text-gray-500 uppercase tracking-wide mb-2'>
                Attachments ({note.attachments.length})
              </p>
              <div className='grid gap-2'>
                {note.attachments.map((file: { name?: string; url?: string; type?: string; size?: number }, index: number) => (
                  <a
                    key={index}
                    href={getAttachmentUrl(file.url || '')}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-colors group'
                  >
                    <div className='shrink-0 w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center'>
                      {getFileIcon(file.type || '')}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium text-gray-900 truncate' title={file.name}>
                        {file.name || 'Attachment'}
                      </p>
                      <div className='flex items-center gap-2 mt-0.5'>
                        <span className='text-xs text-gray-500'>{getFileTypeLabel(file.type || '')}</span>
                        {file.size != null && file.size > 0 && (
                          <>
                            <span className='text-gray-300'>·</span>
                            <span className='text-xs text-gray-500'>
                              {file.size < 1024 ? `${file.size} B` : `${(file.size / 1024).toFixed(1)} KB`}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <span className='text-xs text-blue-600 font-medium group-hover:underline'>Open</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Replies Count */}
          {note._count && note._count.replies > 0 && !isReply && (
            <div className='mt-3 pt-3 border-t border-gray-200'>
              <p className='text-sm text-gray-600'>{note._count.replies} {note._count.replies === 1 ? 'reply' : 'replies'}</p>
            </div>
          )}
        </div>

        {/* Render replies */}
        {note.replies && note.replies.length > 0 && (
          <div className='mt-3'>
            {note.replies.map(reply => renderNote(reply, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className='space-y-6'>
      {/* New Note Form */}
      <div className='bg-white border border-gray-200 rounded-lg p-4'>
        {replyingTo && (
          <div className='mb-3 p-2 bg-blue-50 border-l-2 border-blue-500 rounded flex items-start justify-between'>
            <div>
              <p className='text-sm text-gray-700'>
                Replying to <span className='font-medium'>{replyingTo.user.name}</span>
              </p>
              {replyingTo.content && (
                <p className='text-xs text-gray-500 line-clamp-2 mt-1'>{replyingTo.content}</p>
              )}
            </div>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setReplyingTo(null)}
              className='text-gray-500 hover:text-gray-700'
            >
              ×
            </Button>
          </div>
        )}

        <div className='space-y-3'>
          <Textarea
            placeholder='Add a note, observation, or update...'
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className='resize-none'
          />

          {attachments.length > 0 && (
            <div className='flex flex-wrap gap-2 mb-3'>
              {attachments.map((att, index) => (
                <div key={index} className='flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg border border-gray-200 text-sm'>
                  <File className='w-4 h-4 text-gray-500 shrink-0' />
                  <span className='truncate max-w-[160px]' title={att.name}>{att.name}</span>
                  <button type='button' onClick={() => removeAttachment(index)} className='text-gray-400 hover:text-red-600 p-0.5' aria-label='Remove'>
                    <X className='w-4 h-4' />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <input
                ref={fileInputRef}
                type='file'
                multiple
                accept='image/*,.pdf,.doc,.docx'
                className='hidden'
                onChange={handleFileSelect}
              />
              <Button
                type='button'
                variant='outline'
                size='sm'
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? <Loader2 className='w-4 h-4 mr-1 animate-spin' /> : <Paperclip className='w-4 h-4 mr-1' />}
                Attach Files
              </Button>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={(!content.trim() && attachments.length === 0) || createNote.isPending}
              size='sm'
            >
              {createNote.isPending ? (
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
              ) : (
                <Send className='w-4 h-4 mr-2' />
              )}
              {replyingTo ? 'Send Reply' : 'Add Note'}
            </Button>
          </div>
        </div>
      </div>

      {/* Notes List */}
      {isLoading ? (
        <div className='flex items-center justify-center py-12'>
          <Loader2 className='w-8 h-8 animate-spin text-blue-600' />
        </div>
      ) : notes.length === 0 ? (
        <div className='bg-gray-50 border border-gray-200 rounded-lg p-12 text-center'>
          <FileText className='w-12 h-12 text-gray-400 mx-auto mb-3' />
          <p className='text-gray-600 font-medium'>No notes yet</p>
          <p className='text-sm text-gray-500 mt-1'>Add your first note to start documenting this consultation</p>
        </div>
      ) : (
        <div className='space-y-4'>
          {notes.map(note => renderNote(note))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => noteToDelete && deleteNote.mutate(noteToDelete)}
        title='Delete Note'
        description='Are you sure you want to delete this note? This action cannot be undone.'
      />
    </div>
  );
}
