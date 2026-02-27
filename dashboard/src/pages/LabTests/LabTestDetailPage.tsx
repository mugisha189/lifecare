import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/LayoutWithNav';
import { labTestsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, ArrowLeft, User, FileText, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useUserRole } from '@/hooks/useRole';
import { useState, useMemo } from 'react';

interface LabTestTypeQuestion {
  id: string;
  label: string;
  type: 'TEXT' | 'NUMBER' | 'PERCENTAGE' | 'CHOICES';
  options?: string[] | null;
  order?: number;
}

interface LabTestType {
  id: string;
  name: string;
  description?: string | null;
  questions?: LabTestTypeQuestion[];
}

interface LabTestDetail {
  id: string;
  testName: string;
  testType: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  notes?: string | null;
  results?: Record<string, string | number> | null;
  resultsDate?: string | null;
  patient?: { id: string; name: string; email: string };
  requestedBy?: { user?: { name: string } };
  performedBy?: { user?: { name: string } };
  labTestType?: LabTestType;
}

export default function LabTestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userRole = useUserRole();
  const isLabStaff = userRole === 'LABORATORY_STAFF';

  const [formValues, setFormValues] = useState<Record<string, string>>({});

  const { data, isLoading, error } = useQuery({
    queryKey: ['lab-test', id],
    queryFn: async () => {
      const res = await labTestsApi.getOne(id!);
      return res.data;
    },
    enabled: !!id,
  });

  const labTest = data?.data as LabTestDetail | undefined;
  const questions = useMemo(
    () =>
      Array.isArray(labTest?.labTestType?.questions)
        ? [...labTest.labTestType.questions].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        : [],
    [labTest]
  );

  const completeMutation = useMutation({
    mutationFn: (results: Record<string, string | number>) =>
      labTestsApi.complete(id!, { results }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-test', id] });
      queryClient.invalidateQueries({ queryKey: ['lab-tests'] });
      toast.success('Lab test completed successfully');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message ?? 'Failed to complete lab test');
    },
  });

  const handleInputChange = (questionId: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const results: Record<string, string | number> = {};
    for (const q of questions) {
      const raw = formValues[q.id] ?? '';
      const trimmed = raw.trim();
      if (trimmed === '') {
        toast.error(`Please fill in "${q.label}"`);
        return;
      }
      if (q.type === 'NUMBER' || q.type === 'PERCENTAGE') {
        const num = parseFloat(trimmed);
        if (Number.isNaN(num)) {
          toast.error(`Please enter a valid number for "${q.label}"`);
          return;
        }
        if (q.type === 'PERCENTAGE' && (num < 0 || num > 100)) {
          toast.error(`"${q.label}" must be between 0 and 100`);
          return;
        }
        results[q.id] = num;
      } else {
        results[q.id] = trimmed;
      }
    }
    completeMutation.mutate(results);
  };

  if (!id) {
    return (
      <Layout>
        <div className="p-6">
          <p className="text-gray-600">Invalid lab test ID.</p>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </Layout>
    );
  }

  if (error || !labTest) {
    return (
      <Layout>
        <div className="p-6">
          <Button variant="ghost" className="mb-4 -ml-2" onClick={() => navigate('/dashboard/lab-tests')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to lab tests
          </Button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 font-medium">Lab test not found</p>
          </div>
        </div>
      </Layout>
    );
  }

  const isPending = labTest.status === 'PENDING';
  const canComplete = isLabStaff && isPending && questions.length > 0;

  return (
    <Layout>
      <div className="p-6 max-w-3xl mx-auto">
        <Button
          variant="ghost"
          className="mb-4 -ml-2"
          onClick={() => navigate('/dashboard/lab-tests')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to lab tests
        </Button>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{labTest.testName}</h1>
                <p className="text-sm text-gray-500 mt-0.5">{labTest.testType}</p>
              </div>
              <span
                className={`shrink-0 px-2 py-1 text-xs font-medium rounded-full ${
                  labTest.status === 'COMPLETED'
                    ? 'bg-green-100 text-green-800'
                    : labTest.status === 'CANCELLED'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-800'
                }`}
              >
                {labTest.status}
              </span>
            </div>
          </div>

          <div className="px-6 py-4 space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <User className="h-4 w-4 text-gray-400" />
              <span>
                Patient: <strong>{labTest.patient?.name ?? labTest.patient?.email ?? '—'}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <FileText className="h-4 w-4 text-gray-400" />
              <span>
                Requested by: <strong>{labTest.requestedBy?.user?.name ?? '—'}</strong>
              </span>
            </div>
            {labTest.notes && (
              <p className="text-sm text-gray-600">
                <strong>Notes:</strong> {labTest.notes}
              </p>
            )}
          </div>

          {labTest.status === 'COMPLETED' && labTest.results && Object.keys(labTest.results).length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-3">Results</h2>
              <dl className="space-y-2">
                {questions.map((q) => (
                  <div key={q.id} className="flex justify-between gap-4 text-sm">
                    <dt className="text-gray-600">{q.label}</dt>
                    <dd className="font-medium text-gray-900">
                      {labTest.results![q.id] != null ? String(labTest.results![q.id]) : '—'}
                    </dd>
                  </div>
                ))}
              </dl>
              {labTest.resultsDate && (
                <p className="text-xs text-gray-500 mt-3">
                  Completed {new Date(labTest.resultsDate).toLocaleString()}
                  {labTest.performedBy?.user?.name && ` by ${labTest.performedBy.user.name}`}
                </p>
              )}
            </div>
          )}

          {canComplete && (
            <form onSubmit={handleSubmit} className="px-6 py-4 border-t border-gray-200 space-y-4">
              <h2 className="text-lg font-medium text-gray-900">Complete test</h2>
              <p className="text-sm text-gray-500">
                Fill in the results for each question. These fields are defined by the lab test type.
              </p>
              {questions.map((q) => (
                <div key={q.id}>
                  <Label htmlFor={q.id}>{q.label}</Label>
                  {q.type === 'TEXT' && (
                    <Input
                      id={q.id}
                      value={formValues[q.id] ?? ''}
                      onChange={(e) => handleInputChange(q.id, e.target.value)}
                      placeholder="Enter value"
                      className="mt-1"
                    />
                  )}
                  {q.type === 'NUMBER' && (
                    <Input
                      id={q.id}
                      type="number"
                      step="any"
                      value={formValues[q.id] ?? ''}
                      onChange={(e) => handleInputChange(q.id, e.target.value)}
                      placeholder="Enter number"
                      className="mt-1"
                    />
                  )}
                  {q.type === 'PERCENTAGE' && (
                    <Input
                      id={q.id}
                      type="number"
                      min={0}
                      max={100}
                      step="0.01"
                      value={formValues[q.id] ?? ''}
                      onChange={(e) => handleInputChange(q.id, e.target.value)}
                      placeholder="0–100"
                      className="mt-1"
                    />
                  )}
                  {q.type === 'CHOICES' && (
                    <Select
                      value={formValues[q.id] ?? ''}
                      onValueChange={(v) => handleInputChange(q.id, v)}
                    >
                      <SelectTrigger id={q.id} className="mt-1">
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        {(Array.isArray(q.options) ? q.options : []).map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={completeMutation.isPending}>
                  {completeMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as completed
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/dashboard/lab-tests')}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {isPending && isLabStaff && questions.length === 0 && (
            <div className="px-6 py-4 border-t border-gray-200 text-sm text-amber-700 bg-amber-50 rounded-b-lg">
              This lab test type has no questions defined. Add questions in Lab Test Types (Admin) to allow completion.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
