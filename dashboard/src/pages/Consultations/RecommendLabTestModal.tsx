import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { labTestsApi, labTestTypesApi } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface RecommendLabTestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  consultationId: string;
  patientId: string;
}

export default function RecommendLabTestModal({ open, onOpenChange, consultationId }: RecommendLabTestModalProps) {
  const queryClient = useQueryClient();
  const [labTestTypeId, setLabTestTypeId] = useState('');
  const [notes, setNotes] = useState('');

  const { data: typesData, isLoading: typesLoading } = useQuery({
    queryKey: ['lab-test-types'],
    queryFn: async () => {
      const res = await labTestTypesApi.getAll();
      return res.data;
    },
    enabled: open,
  });

  const labTestTypes = Array.isArray(typesData?.data) ? typesData.data : [];

  const createLabTest = useMutation({
    mutationFn: () =>
      labTestsApi.recommendForConsultation(consultationId, {
        labTestTypeId: labTestTypeId.trim(),
        notes: notes.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success('Lab test recommended successfully');
      queryClient.invalidateQueries({ queryKey: ['consultation', consultationId] });
      queryClient.invalidateQueries({ queryKey: ['lab-tests', consultationId] });
      setLabTestTypeId('');
      setNotes('');
      onOpenChange(false);
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message || 'Failed to recommend lab test');
    },
  });

  const handleSubmit = () => {
    if (!labTestTypeId.trim()) {
      toast.error('Please select a lab test type');
      return;
    }
    createLabTest.mutate();
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setLabTestTypeId('');
      setNotes('');
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Recommend Lab Test</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="labTestType">Lab test type</Label>
            <Select value={labTestTypeId} onValueChange={setLabTestTypeId} disabled={typesLoading}>
              <SelectTrigger id="labTestType" className="mt-1">
                <SelectValue placeholder={typesLoading ? 'Loading…' : 'Select test type'} />
              </SelectTrigger>
              <SelectContent>
                {labTestTypes.map((t: { id: string; name: string }) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              Test types are created by admin in Lab Test Types. Lab staff will fill dynamic questions when completing the test.
            </p>
          </div>
          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Instructions for the lab"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="mt-1 resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!labTestTypeId.trim() || createLabTest.isPending}>
            {createLabTest.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Recommend
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
