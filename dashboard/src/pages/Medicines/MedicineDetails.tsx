import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import type { Medicine } from '@/lib/api';

interface MedicineDetailsProps {
  medicine: Medicine;
  isOpen: boolean;
  onClose: () => void;
}

export default function MedicineDetails({ medicine, isOpen, onClose }: MedicineDetailsProps) {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50'>
      <div className='bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
        <div className='sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between'>
          <h2 className='text-xl font-semibold text-gray-900'>Medicine Details</h2>
          <Button variant='ghost' size='sm' onClick={onClose}>
            <X className='w-4 h-4' />
          </Button>
        </div>

        <div className='p-6 space-y-6'>
          <div>
            <label className='text-sm font-medium text-gray-500'>Name</label>
            <div className='mt-1 text-sm font-semibold text-gray-900'>{medicine.name}</div>
          </div>

          {medicine.description && (
            <div>
              <label className='text-sm font-medium text-gray-500'>Description</label>
              <div className='mt-1 text-sm text-gray-900'>{medicine.description}</div>
            </div>
          )}

          <div>
            <label className='text-sm font-medium text-gray-500'>Status</label>
            <div className='mt-1'>
              <span
                className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${
                  medicine.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}
              >
                {medicine.active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4 pt-4 border-t border-gray-200'>
            <div>
              <label className='text-sm font-medium text-gray-500'>Created At</label>
              <div className='mt-1 text-sm text-gray-900'>
                {format(new Date(medicine.createdAt), 'MMM d, yyyy HH:mm')}
              </div>
            </div>
            <div>
              <label className='text-sm font-medium text-gray-500'>Updated At</label>
              <div className='mt-1 text-sm text-gray-900'>
                {format(new Date(medicine.updatedAt), 'MMM d, yyyy HH:mm')}
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
