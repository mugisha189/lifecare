import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/LayoutWithNav';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Calendar,
  User,
  Phone,
  Mail,
  FileText,
  Pill,
  Plus,
} from 'lucide-react';
import { format, isValid } from 'date-fns';
import CreatePrescriptionModal from './CreatePrescriptionModal';
import ConsultationNotesSection from './ConsultationNotesSection';
import ConsultationActivitiesSection from './ConsultationActivitiesSection';
import ConsultationPatientHistorySection from './ConsultationPatientHistorySection';
import ConsultationLabTestsSection from './ConsultationLabTestsSection';

/** Safe date formatter: returns fallback for null/undefined/invalid dates to avoid RangeError */
function formatDate(value: string | Date | null | undefined, formatStr = 'PPp'): string {
  if (value == null) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (!isValid(d)) return '—';
  return format(d, formatStr);
}

export default function ConsultationDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [createPrescriptionOpen, setCreatePrescriptionOpen] = useState(false);

  // Fetch consultation details
  const { data: consultationResponse, isLoading } = useQuery({
    queryKey: ['consultation', id],
    queryFn: () => apiClient.get(`/consultations/${id}`),
    enabled: !!id,
  });

  const consultation = consultationResponse?.data?.data;

  // Update consultation status mutation
  const updateStatus = useMutation({
    mutationFn: (status: string) =>
      apiClient.patch(`/consultations/${id}/status`, { status }),
    onSuccess: () => {
      toast.success('Consultation status updated');
      queryClient.invalidateQueries({ queryKey: ['consultation', id] });
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    },
  });

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      SCHEDULED: { label: 'Scheduled', className: 'bg-yellow-100 text-yellow-800' },
      IN_PROGRESS: { label: 'In Progress', className: 'bg-blue-100 text-blue-800' },
      COMPLETED: { label: 'Completed', className: 'bg-green-100 text-green-800' },
      CANCELLED: { label: 'Cancelled', className: 'bg-red-100 text-red-800' },
    };
    const { label, className } = config[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return <Badge className={className}>{label}</Badge>;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className='h-full p-6'>
          <div className='max-w-6xl mx-auto'>
            <Skeleton className='h-10 w-64 mb-6' />
            <div className='bg-white rounded-lg border p-6'>
              <Skeleton className='h-8 w-full mb-4' />
              <Skeleton className='h-6 w-full mb-2' />
              <Skeleton className='h-6 w-full mb-2' />
              <Skeleton className='h-6 w-full' />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!consultation) {
    return (
      <Layout>
        <div className='h-full p-6'>
          <div className='max-w-6xl mx-auto'>
            <Button variant='ghost' onClick={() => navigate('/dashboard/consultations')} className='mb-4'>
              <ArrowLeft className='w-4 h-4 mr-2' />
              Back to Consultations
            </Button>
            <div className='text-center py-12'>
              <p className='text-gray-500'>Consultation not found</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className='h-full p-6'>
        <div className='max-w-6xl mx-auto'>
          {/* Header */}
          <div className='flex items-center justify-between mb-6'>
            <div className='flex items-center gap-4'>
              <Button variant='ghost' onClick={() => navigate('/dashboard/consultations')}>
                <ArrowLeft className='w-4 h-4 mr-2' />
                Back
              </Button>
              <div>
                <h1 className='text-2xl font-bold text-gray-900'>Consultation Details</h1>
                <p className='text-sm text-gray-500'>
                  {formatDate(consultation.date ?? consultation.scheduledAt)}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              {getStatusBadge(consultation.status)}
              {consultation.status === 'SCHEDULED' && (
                <Button size='sm' onClick={() => updateStatus.mutate('IN_PROGRESS')}>
                  Start Consultation
                </Button>
              )}
              {consultation.status === 'IN_PROGRESS' && (
                <Button size='sm' onClick={() => updateStatus.mutate('COMPLETED')}>
                  Complete
                </Button>
              )}
            </div>
          </div>

          <div className='bg-white rounded-lg border p-6 mb-6'>
            <h2 className='text-lg font-semibold mb-4'>Patient & Consultation</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              <div className='flex items-start gap-3'>
                <User className='w-5 h-5 text-gray-400 mt-0.5 shrink-0' />
                <div>
                  <p className='text-sm font-medium text-gray-700'>Patient</p>
                  <p className='text-sm text-gray-900'>{consultation.patient.name}</p>
                </div>
              </div>
              <div className='flex items-start gap-3'>
                <Mail className='w-5 h-5 text-gray-400 mt-0.5 shrink-0' />
                <div>
                  <p className='text-sm font-medium text-gray-700'>Email</p>
                  <p className='text-sm text-gray-900'>{consultation.patient.email}</p>
                </div>
              </div>
              <div className='flex items-start gap-3'>
                <Phone className='w-5 h-5 text-gray-400 mt-0.5 shrink-0' />
                <div>
                  <p className='text-sm font-medium text-gray-700'>Phone</p>
                  <p className='text-sm text-gray-900'>{consultation.patient.phoneNumber}</p>
                </div>
              </div>
              {consultation.patient.identifier && (
                <div className='flex items-start gap-3'>
                  <FileText className='w-5 h-5 text-gray-400 mt-0.5 shrink-0' />
                  <div>
                    <p className='text-sm font-medium text-gray-700'>Patient ID</p>
                    <p className='text-sm text-gray-900'>{consultation.patient.identifier}</p>
                  </div>
                </div>
              )}
              <div>
                <p className='text-sm font-medium text-gray-700'>Type</p>
                <p className='text-sm text-gray-900'>
                  {consultation.type === 'IN_PERSON' ? 'In-Person' : 'Virtual'}
                </p>
              </div>
              <div>
                <p className='text-sm font-medium text-gray-700'>Doctor</p>
                <p className='text-sm text-gray-900'>{consultation.doctor?.user?.name || 'N/A'}</p>
              </div>
              {consultation.doctor?.hospital && (
                <div className='flex items-start gap-3'>
                  <div>
                    <p className='text-sm font-medium text-gray-700'>Hospital</p>
                    <p className='text-sm text-gray-900'>{consultation.doctor.hospital.name}</p>
                    {consultation.doctor.hospital.address && (
                      <p className='text-sm text-gray-500 mt-0.5'>{consultation.doctor.hospital.address}</p>
                    )}
                  </div>
                </div>
              )}
              <div>
                <p className='text-sm font-medium text-gray-700'>Scheduled</p>
                <p className='text-sm text-gray-900'>
                  {formatDate(consultation.date ?? consultation.scheduledAt)}
                </p>
              </div>
              {(consultation.completedAt || (consultation.status === 'COMPLETED' && consultation.updatedAt)) && (
                <div>
                  <p className='text-sm font-medium text-gray-700'>Completed</p>
                  <p className='text-sm text-gray-900'>
                    {formatDate(consultation.completedAt ?? consultation.updatedAt)}
                  </p>
                </div>
              )}
            </div>
            {(consultation.diagnosis || consultation.treatmentPlan || consultation.notes) && (
              <div className='mt-6 pt-6 border-t border-gray-200 space-y-4'>
                {consultation.diagnosis && (
                  <div>
                    <p className='text-sm font-medium text-gray-700 mb-1'>Diagnosis</p>
                    <p className='text-sm text-gray-900'>{consultation.diagnosis}</p>
                  </div>
                )}
                {consultation.treatmentPlan && (
                  <div>
                    <p className='text-sm font-medium text-gray-700 mb-1'>Treatment Plan</p>
                    <p className='text-sm text-gray-900 whitespace-pre-wrap'>{consultation.treatmentPlan}</p>
                  </div>
                )}
                {consultation.notes && (
                  <div>
                    <p className='text-sm font-medium text-gray-700 mb-1'>Notes</p>
                    <p className='text-sm text-gray-900 whitespace-pre-wrap'>{consultation.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <Tabs defaultValue='notes' className='space-y-6'>
            <TabsList className="flex flex-wrap gap-1">
              <TabsTrigger value='notes'>Notes</TabsTrigger>
              <TabsTrigger value='activities'>Activities</TabsTrigger>
              <TabsTrigger value='prescriptions'>
                Prescriptions ({consultation._count?.prescriptions || 0})
              </TabsTrigger>
              <TabsTrigger value='lab-tests'>
                Lab Tests ({consultation.labTests?.length ?? consultation._count?.labTests ?? 0})
              </TabsTrigger>
              <TabsTrigger value='patient-history'>Patient History</TabsTrigger>
            </TabsList>

            <TabsContent value='notes' className='space-y-6'>
              <ConsultationNotesSection consultationId={id!} />
            </TabsContent>

            <TabsContent value='activities' className='space-y-6'>
              <ConsultationActivitiesSection consultationId={id!} consultation={consultation} />
            </TabsContent>

            <TabsContent value='patient-history' className='space-y-6'>
              <ConsultationPatientHistorySection patientId={consultation.patient.id} currentConsultationId={id!} />
            </TabsContent>

            <TabsContent value='lab-tests' className='space-y-6'>
              <ConsultationLabTestsSection consultationId={id!} patientId={consultation.patient.id} />
            </TabsContent>

            <TabsContent value='prescriptions' className='space-y-6'>
              <div className='flex items-center justify-between'>
                <h3 className='text-lg font-semibold'>Prescriptions</h3>
                <Button size='sm' onClick={() => setCreatePrescriptionOpen(true)}>
                  <Plus className='w-4 h-4 mr-2' />
                  Create Prescription
                </Button>
              </div>

              {consultation.prescriptions && consultation.prescriptions.length > 0 ? (
                <div className='grid gap-4'>
                  {consultation.prescriptions.map((prescription: any) => (
                    <div key={prescription.id} className='bg-white rounded-lg border p-4'>
                      <div className='flex items-start justify-between mb-3'>
                        <div>
                          <h4 className='font-semibold text-gray-900'>Prescription #{prescription.id.slice(0, 8)}</h4>
                          <p className='text-sm text-gray-500'>
                            Created {formatDate(prescription.createdAt)}
                          </p>
                        </div>
                        <Badge className={prescription.status === 'DISPENSED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {prescription.status}
                        </Badge>
                      </div>
                      {prescription.notes && (
                        <p className='text-sm text-gray-700 mb-3'>{prescription.notes}</p>
                      )}
                      <div className='space-y-2'>
                        <p className='text-sm font-medium text-gray-700'>Medicines:</p>
                        {prescription.medicines && prescription.medicines.length > 0 ? (
                          <div className='space-y-1'>
                            {prescription.medicines.map((item: { medicine?: { name?: string }; quantity: number; dosage: string; frequency?: string }, idx: number) => (
                              <div key={idx} className='text-sm text-gray-600 pl-4'>
                                • {item.medicine?.name || 'Unknown'} — {item.quantity} × {item.dosage}
                                {item.frequency ? `, ${item.frequency}` : ''}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className='text-sm text-gray-500 pl-4'>No medicines listed</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='bg-white rounded-lg border p-12 text-center'>
                  <Pill className='w-12 h-12 mx-auto mb-3 text-gray-300' />
                  <p className='text-gray-500 mb-4'>No prescriptions created yet</p>
                  <Button onClick={() => setCreatePrescriptionOpen(true)}>
                    <Plus className='w-4 h-4 mr-2' />
                    Create First Prescription
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Create Prescription Modal */}
      <CreatePrescriptionModal
        open={createPrescriptionOpen}
        onOpenChange={setCreatePrescriptionOpen}
        consultationId={id!}
        patientId={consultation.patient.id}
      />
    </Layout>
  );
}
