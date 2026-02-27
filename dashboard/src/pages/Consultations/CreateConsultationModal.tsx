import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/lib/api';
import apiClient from '@/lib/apiClient';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';
import { useWorkspaceOptional } from '@/context/WorkspaceContext';
import { Loader2, Search, User, Calendar } from 'lucide-react';

interface CreateConsultationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Patient {
  id: string;
  name: string;
  email: string;
  identifier?: string;
  nid?: string;
  phoneNumber: string;
  role: {
    id: string;
    name: string;
  };
}

export default function CreateConsultationModal({ open, onOpenChange }: CreateConsultationModalProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const workspace = useWorkspaceOptional();
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [consultationType, setConsultationType] = useState<'IN_PERSON' | 'VIRTUAL'>('IN_PERSON');
  const [scheduledAt, setScheduledAt] = useState('');

  const debouncedSearch = useDebounce(patientSearch, 500);

  // Search for patients
  const { data: searchResponse, isLoading: searching } = useQuery({
    queryKey: ['search-patients', debouncedSearch],
    queryFn: () => userApi.search(debouncedSearch || undefined, 'PATIENT', 10),
    enabled: open && !!debouncedSearch,
  });

  const patients: Patient[] = searchResponse?.data?.data || [];

  // Create consultation mutation
  const createConsultation = useMutation({
    mutationFn: (data: any) => apiClient.post('/consultations', data),
    onSuccess: (response) => {
      const consultationId = response.data?.data?.id;
      toast.success('Consultation created successfully');
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
      onOpenChange(false);
      resetForm();
      
      // Navigate to consultation details
      if (consultationId) {
        navigate(`/dashboard/consultations/${consultationId}`);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create consultation');
    },
  });

  const resetForm = () => {
    setPatientSearch('');
    setSelectedPatient(null);
    setConsultationType('IN_PERSON');
    setScheduledAt('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatient) {
      toast.error('Please select a patient');
      return;
    }

    if (!scheduledAt) {
      toast.error('Please select a date and time');
      return;
    }

    createConsultation.mutate({
      patientId: selectedPatient.id,
      date: new Date(scheduledAt).toISOString(),
      duration: 30,
      ...(workspace?.hospitalId && { hospitalId: workspace.hospitalId }),
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Create New Consultation</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* Patient Search */}
          <div className='space-y-2'>
            <Label>Search Patient <span className='text-red-500'>*</span></Label>
            <div className='relative'>
              <Search className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
              <Input
                placeholder='Search by name, email, identifier, or national ID...'
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                className='pl-10'
              />
            </div>

            {/* Selected Patient Display */}
            {selectedPatient && (
              <div className='p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='font-medium text-gray-900'>{selectedPatient.name}</p>
                    <p className='text-sm text-gray-600'>{selectedPatient.email}</p>
                    {selectedPatient.identifier && (
                      <p className='text-xs text-gray-500'>ID: {selectedPatient.identifier}</p>
                    )}
                  </div>
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={() => setSelectedPatient(null)}
                  >
                    Change
                  </Button>
                </div>
              </div>
            )}

            {/* Search Results */}
            {!selectedPatient && patientSearch && (
              <div className='border rounded-lg max-h-60 overflow-y-auto'>
                {searching ? (
                  <div className='p-8 text-center'>
                    <Loader2 className='w-6 h-6 animate-spin mx-auto mb-2 text-blue-500' />
                    <p className='text-sm text-gray-500'>Searching patients...</p>
                  </div>
                ) : patients.length === 0 ? (
                  <div className='p-8 text-center text-gray-500'>
                    <User className='w-12 h-12 mx-auto mb-3 text-gray-300' />
                    <p>No patients found</p>
                  </div>
                ) : (
                  <div className='divide-y'>
                    {patients.map((patient) => (
                      <div
                        key={patient.id}
                        onClick={() => setSelectedPatient(patient)}
                        className='p-3 hover:bg-gray-50 cursor-pointer transition-colors'
                      >
                        <div className='flex items-center justify-between'>
                          <div>
                            <div className='flex items-center gap-2'>
                              <p className='font-medium text-gray-900'>{patient.name}</p>
                              <Badge className='bg-green-100 text-green-800'>Patient</Badge>
                            </div>
                            <p className='text-sm text-gray-600'>{patient.email}</p>
                            <div className='flex gap-3 mt-1'>
                              {patient.identifier && (
                                <p className='text-xs text-gray-500'>ID: {patient.identifier}</p>
                              )}
                              {patient.nid && (
                                <p className='text-xs text-gray-500'>NID: {patient.nid}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Consultation Type */}
          <div className='space-y-2'>
            <Label htmlFor='type'>Consultation Type <span className='text-red-500'>*</span></Label>
            <Select value={consultationType} onValueChange={(value: any) => setConsultationType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='IN_PERSON'>In-Person</SelectItem>
                <SelectItem value='VIRTUAL'>Virtual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Scheduled Date/Time */}
          <div className='space-y-2'>
            <Label htmlFor='scheduledAt'>
              Scheduled Date & Time <span className='text-red-500'>*</span>
            </Label>
            <div className='relative'>
              <Calendar className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
              <Input
                id='scheduledAt'
                type='datetime-local'
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className='pl-10'
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => {
                onOpenChange(false);
                resetForm();
              }}
              disabled={createConsultation.isPending}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={createConsultation.isPending || !selectedPatient}>
              {createConsultation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              Create Consultation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
