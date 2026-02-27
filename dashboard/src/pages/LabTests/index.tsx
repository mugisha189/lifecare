import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/LayoutWithNav';
import { labTestsApi } from '@/lib/api';
import { useUserRole } from '@/hooks/useRole';
import { useWorkspaceOptional } from '@/context/WorkspaceContext';
import { FlaskConical, Loader2, User, FileText, Eye, MoreVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  PENDING: { label: 'Pending', variant: 'secondary' },
  COMPLETED: { label: 'Completed', variant: 'outline' },
  CANCELLED: { label: 'Cancelled', variant: 'destructive' },
};

export default function LabTestsPage() {
  const navigate = useNavigate();
  const userRole = useUserRole();
  const workspace = useWorkspaceOptional();
  const isLabStaff = userRole === 'LABORATORY_STAFF';
  const hospitalId = workspace?.hospitalId ?? undefined;

  const { data, isLoading, error } = useQuery({
    queryKey: ['lab-tests', 'my', hospitalId],
    queryFn: async () => {
      const res = await labTestsApi.getMyLabTests(hospitalId ? { hospitalId } : {});
      return res.data;
    },
    enabled: isLabStaff,
  });

  const labTests = Array.isArray(data?.data) ? data.data : [];

  if (userRole === 'ADMIN') {
    return (
      <Layout>
        <div className="p-6">
          <div className="bg-white rounded-lg shadow p-12">
            <div className="text-center">
              <FlaskConical className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Lab Tests</h1>
              <p className="text-gray-600">Lab test management for admins can be added here.</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isLabStaff) {
    return (
      <Layout>
        <div className="p-6">
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600">You do not have access to lab tests.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-xl font-semibold text-gray-900">Lab Tests</h1>
            <p className="text-sm text-gray-500 mt-1">
              Tests requested by doctors at your hospital. Select a hospital in the sidebar to filter.
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <div className="px-6 py-12 text-center text-red-600">
              {(error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to load lab tests'}
            </div>
          ) : labTests.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <FlaskConical className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No lab tests</p>
              <p className="text-sm text-gray-500 mt-1">There are no test requests for your hospital yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Test</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Type</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Patient</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Requested by</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Date</th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 w-[80px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {labTests.map((lt: {
                    id: string;
                    testName: string;
                    testType: string;
                    status: string;
                    notes?: string;
                    createdAt: string;
                    patient?: { name?: string; email?: string };
                    requestedBy?: { user?: { name?: string } };
                  }) => (
                    <tr key={lt.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{lt.testName}</span>
                        </div>
                        {lt.notes && (
                          <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">{lt.notes}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{lt.testType}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <User className="h-4 w-4 text-gray-400" />
                          {lt.patient?.name ?? lt.patient?.email ?? '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{lt.requestedBy?.user?.name ?? '—'}</td>
                      <td className="px-6 py-4">
                        <Badge variant={statusConfig[lt.status]?.variant ?? 'secondary'}>
                          {statusConfig[lt.status]?.label ?? lt.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {lt.createdAt ? new Date(lt.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/dashboard/lab-tests/${lt.id}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
