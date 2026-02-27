import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, isValid } from 'date-fns';
import type { Consultation } from '@/hooks/useConsultations';

function formatDateSafe(value: string | Date | null | undefined, formatStr: string, fallback = '—'): string {
  if (value == null) return fallback;
  const d = typeof value === 'string' ? new Date(value) : value;
  if (!isValid(d)) return fallback;
  return format(d, formatStr);
}
const ConsultationStatusBadge = ({ status }: { status: string }) => {
  const statusConfig: Record<string, { label: string; className: string }> = {
    COMPLETED: { label: 'Completed', className: 'bg-green-100 text-green-800' },
    IN_PROGRESS: { label: 'In Progress', className: 'bg-blue-100 text-blue-800' },
    SCHEDULED: { label: 'Scheduled', className: 'bg-yellow-100 text-yellow-800' },
    CANCELLED: { label: 'Cancelled', className: 'bg-red-100 text-red-800' },
  };

  const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };

  return (
    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${config.className}`}>
      {config.label}
    </span>
  );
};

interface ConsultationDetailsModalProps {
  consultation: Consultation;
  onClose: () => void;
}

export default function ConsultationDetailsModal({ consultation, onClose }: ConsultationDetailsModalProps) {
  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50'>
      <div className='bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
        <div className='sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between'>
          <h2 className='text-xl font-semibold text-gray-900'>Consultation Details</h2>
          <Button variant='ghost' size='sm' onClick={onClose}>
            <X className='w-4 h-4' />
          </Button>
        </div>

        <div className='p-6 space-y-6'>
          {/* Status */}
          <div>
            <label className='text-sm font-medium text-gray-500'>Status</label>
            <div className='mt-1'>
              <ConsultationStatusBadge status={consultation.status} />
            </div>
          </div>

          {/* Doctor Information */}
          <div>
            <label className='text-sm font-medium text-gray-500'>Doctor</label>
            <div className='mt-1 text-sm text-gray-900'>
              <div className='font-medium'>{consultation.doctor?.name || 'N/A'}</div>
              <div className='text-gray-500'>{consultation.doctor?.email || ''}</div>
            </div>
          </div>

          {/* Hospital Information */}
          {(consultation as any).doctor?.hospital && (
            <div>
              <label className='text-sm font-medium text-gray-500'>Hospital</label>
              <div className='mt-1 text-sm text-gray-900'>
                <div className='font-medium'>{(consultation as any).doctor.hospital.name}</div>
                {(consultation as any).doctor.hospital.address && (
                  <div className='text-gray-500'>{(consultation as any).doctor.hospital.address}</div>
                )}
              </div>
            </div>
          )}

          {/* Patient Information */}
          <div>
            <label className='text-sm font-medium text-gray-500'>Patient</label>
            <div className='mt-1 text-sm text-gray-900'>
              <div className='font-medium'>{consultation.patient?.name || 'N/A'}</div>
              <div className='text-gray-500'>{consultation.patient?.email || ''}</div>
            </div>
          </div>

          {/* Scheduled At */}
          <div>
            <label className='text-sm font-medium text-gray-500'>Scheduled At</label>
            <div className='mt-1 text-sm text-gray-900'>
              {formatDateSafe((consultation as any).date ?? consultation.scheduledAt, 'MMMM d, yyyy HH:mm')}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className='text-sm font-medium text-gray-500'>Reason</label>
            <div className='mt-1 text-sm text-gray-900'>{consultation.reason}</div>
          </div>

          {/* Notes */}
          {consultation.notes && (
            <div>
              <label className='text-sm font-medium text-gray-500'>Notes</label>
              <div className='mt-1 text-sm text-gray-900'>{consultation.notes}</div>
            </div>
          )}

          {/* Follow-up Required */}
          {consultation.followUpRequired !== undefined && (
            <div>
              <label className='text-sm font-medium text-gray-500'>Follow-up Required</label>
              <div className='mt-1 text-sm text-gray-900'>
                {consultation.followUpRequired ? 'Yes' : 'No'}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className='grid grid-cols-2 gap-4 pt-4 border-t border-gray-200'>
            <div>
              <label className='text-sm font-medium text-gray-500'>Created At</label>
              <div className='mt-1 text-sm text-gray-900'>
                {formatDateSafe(consultation.createdAt, 'MMM d, yyyy HH:mm')}
              </div>
            </div>
            <div>
              <label className='text-sm font-medium text-gray-500'>Updated At</label>
              <div className='mt-1 text-sm text-gray-900'>
                {formatDateSafe(consultation.updatedAt, 'MMM d, yyyy HH:mm')}
              </div>
            </div>
          </div>
        </div>

        <div className='sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end'>
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}
