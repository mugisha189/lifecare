import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CreateMedicineModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; description?: string }) => void;
  isPending?: boolean;
}

export default function CreateMedicineModal({
  open,
  onOpenChange,
  onSubmit,
  isPending,
}: CreateMedicineModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    onSubmit({ name: trimmedName, description: description.trim() || undefined });
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setName('');
      setDescription('');
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle>Add Medicine</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <Label htmlFor='create-name'>Name *</Label>
            <Input
              id='create-name'
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor='create-description'>Description</Label>
            <Textarea
              id='create-description'
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => handleOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type='submit' disabled={isPending || !name.trim()}>
              {isPending ? 'Adding…' : 'Add Medicine'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
