import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { consultationsApi } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface RecordNewPrescriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function RecordNewPrescriptionModal({ open, onOpenChange }: RecordNewPrescriptionModalProps) {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) {
      toast.error('Please enter the consultation code');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await consultationsApi.getByCode(trimmed);
      if (res.data?.ok && res.data?.data) {
        onOpenChange(false);
        setCode('');
        navigate(`/dashboard/prescriptions/record?code=${encodeURIComponent(trimmed)}`);
      } else {
        toast.error(res.data?.message || 'Consultation not found');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to find consultation';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record New Prescription</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-500">
          Enter the consultation code (e.g. LifeCare-2025-01-24-1) to open the prescription and mark medicines as dispensed.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="consultation-code">Consultation code</Label>
            <Input
              id="consultation-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="LifeCare-2025-01-24-1"
              className="mt-1 font-mono"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !code.trim()}>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Open prescription
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
