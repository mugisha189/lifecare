import { X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import type { Prescription } from '@/hooks/usePrescriptions';
const PrescriptionStatusBadge = ({ status }: { status: string }) => {
  const statusConfig: Record<string, { label: string; className: string }> = {
    DISPENSED: { label: 'Dispensed', className: 'bg-green-100 text-green-800' },
    PENDING: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
    CANCELLED: { label: 'Cancelled', className: 'bg-red-100 text-red-800' },
  };

  const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };

  return (
    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${config.className}`}>
      {config.label}
    </span>
  );
};

interface PrescriptionDetailsModalProps {
  prescription: Prescription;
  onClose: () => void;
  onDispense?: (prescription: Prescription) => void;
}

export default function PrescriptionDetailsModal({ prescription, onClose, onDispense }: PrescriptionDetailsModalProps) {
  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50'>
      <div className='bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
        <div className='sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between'>
          <h2 className='text-xl font-semibold text-gray-900'>Prescription Details</h2>
          <Button variant='ghost' size='sm' onClick={onClose}>
            <X className='w-4 h-4' />
          </Button>
        </div>

        <div className='p-6 space-y-6'>
          {/* Status */}
          <div>
            <label className='text-sm font-medium text-gray-500'>Status</label>
            <div className='mt-1'>
              <PrescriptionStatusBadge status={prescription.status} />
            </div>
          </div>

          {/* Patient Information */}
          <div>
            <label className='text-sm font-medium text-gray-500'>Patient</label>
            <div className='mt-1 text-sm text-gray-900'>
              <div className='font-medium'>{prescription.patient?.name || 'N/A'}</div>
              {prescription.patient?.email && (
                <div className='text-gray-600'>{prescription.patient.email}</div>
              )}
              {prescription.patient?.phoneNumber && (
                <div className='text-gray-600'>{prescription.patient.phoneNumber}</div>
              )}
            </div>
          </div>

          {/* Medicines – full detail */}
          <div>
            <label className='text-sm font-medium text-gray-500'>Medicines</label>
            <div className='mt-2 space-y-3'>
              {prescription.medicines && prescription.medicines.length > 0 ? (
                prescription.medicines.map((item, index) => (
                  <div key={item.id || index} className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
                    <div className='font-semibold text-gray-900'>
                      {item.medicine?.name ?? 'Medicine'}
                    </div>
                    <dl className='mt-2 grid grid-cols-1 gap-1 text-sm'>
                      <div className='flex justify-between'>
                        <span className='text-gray-500'>Dosage</span>
                        <span className='text-gray-900'>{item.dosage ?? '—'}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-gray-500'>Quantity</span>
                        <span className='text-gray-900'>{item.quantity ?? '—'}</span>
                      </div>
                      {item.frequency && (
                        <div className='flex justify-between'>
                          <span className='text-gray-500'>Frequency</span>
                          <span className='text-gray-900'>{item.frequency}</span>
                        </div>
                      )}
                      {item.duration && (
                        <div className='flex justify-between'>
                          <span className='text-gray-500'>Duration</span>
                          <span className='text-gray-900'>{item.duration}</span>
                        </div>
                      )}
                      {item.instructions && (
                        <div className='col-span-full mt-1'>
                          <span className='text-gray-500'>Instructions: </span>
                          <span className='text-gray-900'>{item.instructions}</span>
                        </div>
                      )}
                    </dl>
                  </div>
                ))
              ) : (
                <div className='text-sm text-gray-500'>No medicines specified</div>
              )}
            </div>
          </div>

          {/* Notes */}
          {prescription.notes && (
            <div>
              <label className='text-sm font-medium text-gray-500'>Notes</label>
              <div className='mt-1 text-sm text-gray-900'>{prescription.notes}</div>
            </div>
          )}

          {/* Dispensed Info */}
          {prescription.status === 'DISPENSED' && prescription.dispensedAt && (
            <div>
              <label className='text-sm font-medium text-gray-500'>Dispensed At</label>
              <div className='mt-1 text-sm text-gray-900'>
                {format(new Date(prescription.dispensedAt), 'MMMM d, yyyy HH:mm')}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className='grid grid-cols-2 gap-4 pt-4 border-t border-gray-200'>
            <div>
              <label className='text-sm font-medium text-gray-500'>Created At</label>
              <div className='mt-1 text-sm text-gray-900'>
                {format(new Date(prescription.createdAt), 'MMM d, yyyy HH:mm')}
              </div>
            </div>
            <div>
              <label className='text-sm font-medium text-gray-500'>Updated At</label>
              <div className='mt-1 text-sm text-gray-900'>
                {format(new Date(prescription.updatedAt), 'MMM d, yyyy HH:mm')}
              </div>
            </div>
          </div>
        </div>

        <div className='sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-2'>
          {onDispense && prescription.status === 'PENDING' && (
            <Button onClick={() => onDispense(prescription)} className='bg-green-600 hover:bg-green-700'>
              <CheckCircle className='w-4 h-4 mr-2' />
              Mark all as completed
            </Button>
          )}
          <Button variant='outline' onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}
