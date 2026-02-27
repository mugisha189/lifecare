import { useQuery } from '@tanstack/react-query';
import { consultationNotesApi } from '@/lib/api';
import { format, isValid } from 'date-fns';
import { Calendar, FileText, Pill, FlaskConical, Stethoscope, Loader2 } from 'lucide-react';

function formatActivityDate(value: string | Date | null | undefined): string {
  if (value == null) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  return isValid(d) ? format(d, 'MMM d, yyyy h:mm a') : '—';
}

interface ConsultationActivitiesSectionProps {
  consultationId: string;
  consultation: {
    id: string;
    createdAt: string;
    updatedAt: string;
    status: string;
    prescriptions?: Array<{ id: string; createdAt: string; status?: string }>;
    labTests?: Array<{ id: string; createdAt: string; testName: string; status: string }>;
    doctor?: { user?: { name?: string } };
  };
}

interface TimelineItem {
  id: string;
  type: 'consultation' | 'prescription' | 'note' | 'lab_test';
  date: string;
  label: string;
  sublabel?: string;
}

export default function ConsultationActivitiesSection({ consultationId, consultation }: ConsultationActivitiesSectionProps) {
  const { data: notesResponse, isLoading } = useQuery({
    queryKey: ['consultation-notes', consultationId],
    queryFn: async () => {
      const response = await consultationNotesApi.getByConsultation(consultationId);
      return response.data;
    },
  });

  const notes = Array.isArray(notesResponse) ? notesResponse : (notesResponse as { data?: unknown[] })?.data ?? [];

  const items: TimelineItem[] = [];

  items.push({
    id: consultation.id,
    type: 'consultation',
    date: consultation.createdAt,
    label: 'Consultation created',
    sublabel: consultation.doctor?.user?.name ? `Dr. ${consultation.doctor.user.name}` : undefined,
  });

  consultation.prescriptions?.forEach((p: { id: string; createdAt: string }) => {
    items.push({ id: p.id, type: 'prescription', date: p.createdAt, label: 'Prescription created' });
  });

  ;(notes as Array<{ id: string; createdAt: string; user?: { name?: string }; content?: string }>).forEach((n) => {
    items.push({
      id: n.id,
      type: 'note',
      date: n.createdAt,
      label: 'Note added',
      sublabel: n.user?.name,
    });
  });

  consultation.labTests?.forEach((lt: { id: string; createdAt: string; testName: string }) => {
    items.push({
      id: lt.id,
      type: 'lab_test',
      date: lt.createdAt,
      label: 'Lab test requested',
      sublabel: lt.testName,
    });
  });

  items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getIcon = (type: TimelineItem['type']) => {
    switch (type) {
      case 'consultation': return <Stethoscope className="w-5 h-5 text-blue-600" />;
      case 'prescription': return <Pill className="w-5 h-5 text-green-600" />;
      case 'note': return <FileText className="w-5 h-5 text-amber-600" />;
      case 'lab_test': return <FlaskConical className="w-5 h-5 text-purple-600" />;
      default: return <Calendar className="w-5 h-5 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 font-medium">No activities yet</p>
        <p className="text-sm text-gray-500 mt-1">Activity for this consultation will appear here</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="relative">
        <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-200" />
        <ul className="divide-y divide-gray-100">
          {items.map((item) => (
            <li key={item.id} className="relative flex gap-4 py-4 px-6 hover:bg-gray-50/50">
              <div className="relative z-10 shrink-0 w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                {getIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-sm font-medium text-gray-900">{item.label}</p>
                {item.sublabel && <p className="text-xs text-gray-500 mt-0.5">{item.sublabel}</p>}
                <p className="text-xs text-gray-400 mt-1">{formatActivityDate(item.date)}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
