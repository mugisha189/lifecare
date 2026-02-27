import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';
import type { Medicine } from '@/lib/api';

interface EditMedicineDialogProps {
  medicine: Medicine;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; description?: string }) => void;
}

export default function EditMedicineDialog({ medicine, isOpen, onClose, onSave }: EditMedicineDialogProps) {
  const [name, setName] = useState(medicine.name);
  const [description, setDescription] = useState(medicine.description ?? '');

  useEffect(() => {
    if (isOpen) {
      setName(medicine.name);
      setDescription(medicine.description ?? '');
    }
  }, [medicine, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name: name.trim(), description: description.trim() || undefined });
  };

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50'>
      <div className='bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto'>
        <div className='sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between'>
          <h2 className='text-xl font-semibold text-gray-900'>Edit Medicine</h2>
          <Button variant='ghost' size='sm' onClick={onClose}>
            <X className='w-4 h-4' />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className='p-6 space-y-4'>
          <div>
            <Label htmlFor='name'>Name *</Label>
            <Input
              id='name'
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor='description'>Description</Label>
            <Textarea
              id='description'
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className='flex justify-end gap-2 pt-4 border-t'>
            <Button type='button' variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button type='submit'>Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
