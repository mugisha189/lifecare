import { useQuery } from '@tanstack/react-query';
import { labTestsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Plus, FlaskConical, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { format, isValid } from 'date-fns';
import RecommendLabTestModal from './RecommendLabTestModal';
import { useState } from 'react';
import { useUserRole } from '@/hooks/useRole';

interface LabTestTypeQuestion {
  id: string;
  label: string;
  type: string;
  order?: number;
}

interface LabTestDetail {
  id: string;
  testName: string;
  status: string;
  results?: Record<string, string | number> | null;
  resultsDate?: string | null;
  labTestType?: {
    questions?: LabTestTypeQuestion[];
  };
}

function formatDateSafe(value: string | Date | null | undefined): string {
  if (value == null) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  return isValid(d) ? format(d, 'MMM d, yyyy h:mm a') : '—';
}

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Pending', className: 'bg-amber-100 text-amber-800' },
  COMPLETED: { label: 'Completed', className: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Cancelled', className: 'bg-red-100 text-red-800' },
};

interface LabTestListItem {
  id: string;
  testType: string;
  testName: string;
  status: string;
  notes?: string;
  createdAt: string;
  requestedBy?: { user?: { name?: string } };
}

function LabTestCard({
  labTest,
  statusConfig,
  formatDateSafe,
  expandedId,
  onToggleExpand,
}: {
  labTest: LabTestListItem;
  statusConfig: Record<string, { label: string; className: string }>;
  formatDateSafe: (v: string | Date | null | undefined) => string;
  expandedId: string | null;
  onToggleExpand: () => void;
}) {
  const isExpanded = expandedId === labTest.id;

  const { data: detailData, isLoading: detailLoading } = useQuery({
    queryKey: ['lab-test', labTest.id],
    queryFn: async () => {
      const res = await labTestsApi.getOne(labTest.id);
      return res.data;
    },
    enabled: isExpanded,
  });

  const detail = detailData?.data as LabTestDetail | undefined;
  const questions = Array.isArray(detail?.labTestType?.questions)
    ? [...detail.labTestType.questions].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    : [];
  const results = detail?.results && typeof detail.results === 'object' ? detail.results : null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <button
        type="button"
        onClick={onToggleExpand}
        className="w-full p-4 text-left hover:bg-gray-50/50 transition-colors flex items-start justify-between gap-3"
      >
        <div className="min-w-0 flex-1">
          <h4 className="font-semibold text-gray-900">{labTest.testName}</h4>
          <p className="text-sm text-gray-500">{labTest.testType}</p>
          {labTest.notes && <p className="text-sm text-gray-600 mt-1 truncate max-w-md">{labTest.notes}</p>}
          <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
            <span>Requested {formatDateSafe(labTest.createdAt)}</span>
            {labTest.requestedBy?.user?.name && <span>by {labTest.requestedBy.user.name}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig[labTest.status]?.className ?? 'bg-gray-100 text-gray-800'}`}>
            {statusConfig[labTest.status]?.label ?? labTest.status}
          </span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200 bg-gray-50/50 px-4 py-3">
          {detailLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading results…
            </div>
          ) : labTest.status === 'COMPLETED' && results && Object.keys(results).length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Answered questions</p>
              <dl className="space-y-1.5 text-sm">
                {questions.map((q) => (
                  <div key={q.id} className="flex justify-between gap-4">
                    <dt className="text-gray-600">{q.label}</dt>
                    <dd className="font-medium text-gray-900">
                      {results[q.id] != null ? String(results[q.id]) : '—'}
                    </dd>
                  </div>
                ))}
              </dl>
              {detail?.resultsDate && (
                <p className="text-xs text-gray-500 mt-2">
                  Completed {formatDateSafe(detail.resultsDate)}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 py-1">
              {labTest.status === 'PENDING' ? 'No results yet. Lab staff will complete this test.' : 'No results recorded.'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

interface ConsultationLabTestsSectionProps {
  consultationId: string;
  patientId: string;
}

export default function ConsultationLabTestsSection({ consultationId, patientId }: ConsultationLabTestsSectionProps) {
  const userRole = useUserRole();
  const isDoctor = userRole === 'DOCTOR';
  const [modalOpen, setModalOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['lab-tests', consultationId],
    queryFn: async () => {
      const response = await labTestsApi.getByConsultation(consultationId);
      return response.data;
    },
    enabled: !!consultationId,
  });

  const labTests = Array.isArray(data?.data) ? data?.data : (data?.data as unknown[] | undefined) ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Lab Tests</h3>
        {isDoctor && (
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Recommend Lab Test
          </Button>
        )}
      </div>

      {labTests.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <FlaskConical className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No lab tests recommended</p>
          <p className="text-sm text-gray-500 mt-1">
            {isDoctor ? 'Recommend a lab test for this consultation' : 'No lab tests have been requested yet'}
          </p>
          {isDoctor && (
            <Button className="mt-4" onClick={() => setModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Recommend Lab Test
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {labTests.map((lt: LabTestListItem) => (
            <LabTestCard
              key={lt.id}
              labTest={lt}
              statusConfig={statusConfig}
              formatDateSafe={formatDateSafe}
              expandedId={expandedId}
              onToggleExpand={() => setExpandedId((id) => (id === lt.id ? null : lt.id))}
            />
          ))}
        </div>
      )}

      <RecommendLabTestModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        consultationId={consultationId}
        patientId={patientId}
      />
    </div>
  );
}
