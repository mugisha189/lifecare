import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, Pill } from 'lucide-react';

interface CreatePrescriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  consultationId: string;
  patientId: string;
}

interface MedicineItem {
  medicineId: string;
  quantity: number;
  dosage: string;
  frequency: string;
  duration: string;
}

interface Medicine {
  id: string;
  name: string;
  description?: string;
  active: boolean;
}

export default function CreatePrescriptionModal({
  open,
  onOpenChange,
  consultationId,
  patientId,
}: CreatePrescriptionModalProps) {
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<MedicineItem[]>([
    { medicineId: '', quantity: 1, dosage: '', frequency: '', duration: '' },
  ]);

  // Fetch available medicines (API returns { data: { medicines: [], pagination } } or similar)
  const { data: medicinesResponse } = useQuery({
    queryKey: ['medicines'],
    queryFn: () => apiClient.get('/medicines', { params: { limit: 500, active: true } }),
    enabled: open,
  });

  const rawData = medicinesResponse?.data?.data;
  const medicines: Medicine[] = Array.isArray(rawData?.medicines)
    ? rawData.medicines
    : Array.isArray(rawData)
      ? rawData
      : [];

  // Create prescription mutation
  const createPrescription = useMutation({
    mutationFn: (data: any) => apiClient.post('/prescriptions', data),
    onSuccess: () => {
      toast.success('Prescription created successfully');
      queryClient.invalidateQueries({ queryKey: ['consultation', consultationId] });
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      onOpenChange(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create prescription');
    },
  });

  const resetForm = () => {
    setNotes('');
    setItems([{ medicineId: '', quantity: 1, dosage: '', frequency: '', duration: '' }]);
  };

  const addMedicineItem = () => {
    setItems([...items, { medicineId: '', quantity: 1, dosage: '', frequency: '', duration: '' }]);
  };

  const removeMedicineItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateMedicineItem = (index: number, field: keyof MedicineItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate items
    const validItems = items.filter(item => item.medicineId && item.quantity > 0);
    if (validItems.length === 0) {
      toast.error('Please add at least one medicine');
      return;
    }

    // Check for invalid quantities or missing dosage
    const hasInvalidItem = validItems.some(
      item => !item.dosage.trim() || !item.frequency.trim() || !item.duration.trim(),
    );
    if (hasInvalidItem) {
      toast.error('Please fill in dosage, frequency and duration for each medicine');
      return;
    }

    createPrescription.mutate({
      consultationId,
      patientId,
      notes: notes.trim() || undefined,
      medicines: validItems.map(item => ({
        medicineId: item.medicineId,
        quantity: item.quantity,
        dosage: item.dosage.trim(),
        frequency: item.frequency.trim(),
        duration: item.duration.trim(),
      })),
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Create Prescription</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* Medicines List */}
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <Label>Medicines <span className='text-red-500'>*</span></Label>
              <Button type='button' size='sm' variant='outline' onClick={addMedicineItem}>
                <Plus className='w-4 h-4 mr-1' />
                Add Medicine
              </Button>
            </div>

            {items.map((item, index) => (
              <div key={index} className='border rounded-lg p-4 space-y-3'>
                <div className='flex items-start justify-between'>
                  <h4 className='font-medium text-sm'>Medicine #{index + 1}</h4>
                  {items.length > 1 && (
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={() => removeMedicineItem(index)}
                      className='text-red-600 hover:text-red-700'
                    >
                      <Trash2 className='w-4 h-4' />
                    </Button>
                  )}
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                  <div className='space-y-2 md:col-span-2'>
                    <Label>Select Medicine *</Label>
                    <Select
                      value={item.medicineId}
                      onValueChange={(value) => updateMedicineItem(index, 'medicineId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Choose medicine' />
                      </SelectTrigger>
                      <SelectContent>
                        {medicines.length === 0 ? (
                          <div className='p-2 text-sm text-gray-500 text-center'>
                            No medicines available
                          </div>
                        ) : (
                          medicines.map((medicine) => (
                            <SelectItem key={medicine.id} value={medicine.id}>
                              {medicine.name}
                              {medicine.description ? ` — ${medicine.description.slice(0, 50)}${medicine.description.length > 50 ? '…' : ''}` : ''}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-2'>
                    <Label>Quantity *</Label>
                    <Input
                      type='number'
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateMedicineItem(index, 'quantity', parseInt(e.target.value, 10) || 1)}
                      required
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label>Dosage *</Label>
                    <Input
                      placeholder='e.g., 500mg'
                      value={item.dosage}
                      onChange={(e) => updateMedicineItem(index, 'dosage', e.target.value)}
                      required
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label>Frequency *</Label>
                    <Input
                      placeholder='e.g., Twice daily'
                      value={item.frequency}
                      onChange={(e) => updateMedicineItem(index, 'frequency', e.target.value)}
                      required
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label>Duration *</Label>
                    <Input
                      placeholder='e.g., 7 days'
                      value={item.duration}
                      onChange={(e) => updateMedicineItem(index, 'duration', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* General Notes */}
          <div className='space-y-2'>
            <Label htmlFor='notes'>Prescription Notes (Optional)</Label>
            <Textarea
              id='notes'
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder='General notes or additional instructions...'
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => {
                onOpenChange(false);
                resetForm();
              }}
              disabled={createPrescription.isPending}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={createPrescription.isPending}>
              {createPrescription.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              Create Prescription
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
