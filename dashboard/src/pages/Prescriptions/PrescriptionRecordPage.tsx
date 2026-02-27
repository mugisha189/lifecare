import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/LayoutWithNav';
import { consultationsApi, prescriptionsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Pill, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function PrescriptionRecordPage() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code') || '';
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['consultation-by-code', code],
    queryFn: () => consultationsApi.getByCode(code),
    enabled: !!code.trim(),
  });

  const updatePrescription = useMutation({
    mutationFn: ({ id }: { id: string }) =>
      prescriptionsApi.update(id, { status: 'DISPENSED' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultation-by-code', code] });
      toast.success('Prescription marked as dispensed');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update prescription');
    },
  });

  const consultation = data?.data?.data;
  const prescriptions = consultation?.prescriptions || [];

  const handleMarkAllDispensed = async () => {
    if (!prescriptions.length) return;

    const pending = prescriptions.filter(
      (p: { status: string }) => p.status === 'PENDING',
    );

    if (pending.length === 0) {
      toast.info('All prescriptions for this consultation are already dispensed');
      return;
    }

    try {
      await Promise.all(
        pending.map((p: { id: string }) =>
          prescriptionsApi.update(p.id, { status: 'DISPENSED' }),
        ),
      );
      await queryClient.invalidateQueries({
        queryKey: ['consultation-by-code', code],
      });
      toast.success('All prescriptions marked as dispensed');
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          'Failed to mark all prescriptions as dispensed',
      );
    }
  };

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto">
        <Button
          variant="ghost"
          className="mb-4 -ml-2"
          onClick={() => navigate('/dashboard/prescriptions')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to prescriptions
        </Button>

        {!code ? (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
            <p className="text-amber-800 font-medium">No consultation code provided</p>
            <p className="text-sm text-amber-700 mt-1">Use Record New Prescription and enter a code.</p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : error || !consultation ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 font-medium">Consultation not found</p>
            <p className="text-sm text-red-700 mt-1">Check the code and try again.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h1 className="text-xl font-semibold text-gray-900">Consultation {consultation.code}</h1>
              <p className="text-sm text-gray-500 mt-1">
                Patient: {consultation.patient?.name ?? '—'} · Doctor: {consultation.doctor?.user?.name ?? '—'}
              </p>
            </div>

            {prescriptions.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <Pill className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-700 font-medium">No prescriptions for this consultation</p>
                <p className="text-sm text-gray-500 mt-1">The doctor has not added any prescriptions yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-medium text-gray-900">
                    Prescriptions (medicines only)
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkAllDispensed}
                    disabled={!prescriptions.some((p: { status: string }) => p.status === 'PENDING')}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark all as dispensed
                  </Button>
                </div>
                {prescriptions.map((prescription: {
                  id: string;
                  status: string;
                  medicines?: Array<{
                    medicine?: { name?: string; dosage?: string };
                    dosage?: string;
                    quantity?: number;
                    instructions?: string;
                  }>;
                }) => (
                  <div
                    key={prescription.id}
                    className="bg-white border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">
                        {prescription.status === 'DISPENSED' ? (
                          <span className="text-green-600 inline-flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" /> Dispensed
                          </span>
                        ) : (
                          'Pending'
                        )}
                      </span>
                      {prescription.status === 'PENDING' && (
                        <Button
                          size="sm"
                          onClick={() => updatePrescription.mutate({ id: prescription.id })}
                          disabled={updatePrescription.isPending}
                        >
                          {updatePrescription.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-1" />
                          ) : (
                            <CheckCircle className="w-4 h-4 mr-1" />
                          )}
                          Mark as dispensed
                        </Button>
                      )}
                    </div>
                    <ul className="space-y-2">
                      {(prescription.medicines || []).map((item: any, idx: number) => (
                        <li key={idx} className="flex flex-wrap items-baseline gap-2 text-sm text-gray-800">
                          <span className="font-medium">{item.medicine?.name ?? 'Medicine'}</span>
                          <span className="text-gray-500">
                            {item.dosage ?? item.medicine?.dosage ?? ''}
                            {item.quantity != null ? ` · Qty: ${item.quantity}` : ''}
                          </span>
                          {item.instructions && (
                            <span className="text-gray-500">· {item.instructions}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
