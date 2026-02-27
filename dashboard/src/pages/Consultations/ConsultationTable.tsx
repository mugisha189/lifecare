import { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Download,
  SlidersHorizontal,
  Eye,
  Trash2,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Calendar,
  X,
  Stethoscope,
  User,
  Plus,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { useConsultations, type Consultation, type ConsultationFilters } from '@/hooks/useConsultations';
import { format, isValid } from 'date-fns';
import { useUserRole } from '@/hooks/useRole';
import { useNavigate } from 'react-router-dom';
import { useWorkspaceOptional } from '@/context/WorkspaceContext';
import CreateConsultationModal from './CreateConsultationModal';

/** Safe date formatter: returns fallback for null/undefined/invalid dates to avoid RangeError */
function formatDateSafe(value: string | Date | null | undefined, formatStr = 'MMM d, yyyy HH:mm', fallback = '—'): string {
  if (value == null) return fallback;
  const d = typeof value === 'string' ? new Date(value) : value;
  if (!isValid(d)) return fallback;
  return format(d, formatStr);
}

const ConsultationStatusBadge = ({ status }: { status: string }) => {
  const statusConfig: Record<string, { label: string; className: string }> = {
    COMPLETED: { label: 'Completed', className: 'bg-green-100 text-green-800' },
    IN_PROGRESS: { label: 'In Progress', className: 'bg-blue-100 text-blue-800' },
    SCHEDULED: { label: 'Scheduled', className: 'bg-yellow-100 text-yellow-800' },
    CANCELLED: { label: 'Cancelled', className: 'bg-red-100 text-red-800' },
  };

  const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };

  return (
    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${config.className}`}>
      {config.label}
    </span>
  );
};

export default function ConsultationTable() {
  const navigate = useNavigate();
  const userRole = useUserRole();
  const workspace = useWorkspaceOptional();
  const isDoctor = userRole === 'DOCTOR';
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [consultationToDelete, setConsultationToDelete] = useState<Consultation | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState<string>('');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Build filters for API (doctors: include active hospital for listing)
  const filters = useMemo((): ConsultationFilters => {
    const apiFilters: ConsultationFilters = {
      page: currentPage,
      limit: itemsPerPage,
    };

    if (statusFilter !== 'all') {
      const statusMap: Record<string, ConsultationFilters['status']> = {
        SCHEDULED: 'SCHEDULED',
        IN_PROGRESS: 'IN_PROGRESS',
        COMPLETED: 'COMPLETED',
        CANCELLED: 'CANCELLED',
      };
      const mappedStatus = statusMap[statusFilter];
      if (mappedStatus) {
        apiFilters.status = mappedStatus;
      }
    }

    if (dateFilter) {
      apiFilters.startDate = `${dateFilter}T00:00:00Z`;
      apiFilters.endDate = `${dateFilter}T23:59:59Z`;
    }

    if (isDoctor && workspace?.hospitalId) {
      apiFilters.hospitalId = workspace.hospitalId;
    }

    return apiFilters;
  }, [currentPage, itemsPerPage, statusFilter, dateFilter, isDoctor, workspace?.hospitalId]);

  // Use my consultations for doctors, all for admin
  const useMyConsultations = userRole === 'DOCTOR';
  const { consultations, pagination, loading, error, deleteConsultation, refetch } = useConsultations(filters, useMyConsultations);

  // Filter consultations client-side for search
  const filteredConsultations = useMemo(() => {
    if (!searchQuery) return consultations;

    const query = searchQuery.toLowerCase();
    return consultations.filter(
      consultation =>
        consultation.id.toLowerCase().includes(query) ||
        consultation.reason.toLowerCase().includes(query) ||
        consultation.doctor?.name.toLowerCase().includes(query) ||
        consultation.patient?.name.toLowerCase().includes(query)
    );
  }, [consultations, searchQuery]);

  // Pagination
  const totalPages = pagination?.totalPages || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;

  useEffect(() => {
    if (pagination && currentPage > pagination.totalPages) {
      setCurrentPage(1);
    }
  }, [pagination, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleDeleteClick = (consultation: Consultation) => {
    setConsultationToDelete(consultation);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!consultationToDelete) return;
    deleteConsultation.mutate(consultationToDelete.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setConsultationToDelete(null);
      },
    });
  };

  const handleExport = () => {
    if (filteredConsultations.length === 0) {
      return;
    }

    const headers = ['ID', 'Doctor', 'Patient', 'Scheduled At', 'Reason', 'Status', 'Created At'];
    const csvContent = [
      headers.join(','),
      ...filteredConsultations.map(c =>
        [
          `"${c.id}"`,
          `"${c.doctor?.name || 'N/A'}"`,
          `"${c.patient?.name || 'N/A'}"`,
          `"${formatDateSafe(c.date ?? c.scheduledAt, 'yyyy-MM-dd HH:mm', '')}"`,
          `"${c.reason ?? ''}"`,
          `"${c.status}"`,
          `"${formatDateSafe(c.createdAt, 'yyyy-MM-dd HH:mm:ss', '')}"`,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `consultations_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className='space-y-4'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Consultations</h1>
          <p className='text-sm text-gray-500 mt-1'>
            {userRole === 'DOCTOR' ? 'View and manage your consultations' : 'Manage all consultations'}
          </p>
        </div>
        <div className='flex items-center gap-2'>
          {isDoctor && (
            <Button onClick={() => setCreateModalOpen(true)}>
              <Plus className='w-4 h-4 mr-2' />
              Create Consultation
            </Button>
          )}
          <Button variant='outline' onClick={handleExport} disabled={filteredConsultations.length === 0}>
            <Download className='w-4 h-4 mr-2' />
            Export
          </Button>
          <Button variant='outline' onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal className='w-4 h-4 mr-2' />
            Filters
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className='bg-white border border-gray-200 rounded-lg p-4 space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <label className='text-sm font-medium text-gray-700 mb-1 block'>Search</label>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
                <Input
                  placeholder='Search consultations...'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>
            <div>
              <label className='text-sm font-medium text-gray-700 mb-1 block'>Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Status</SelectItem>
                  <SelectItem value='SCHEDULED'>Scheduled</SelectItem>
                  <SelectItem value='IN_PROGRESS'>In Progress</SelectItem>
                  <SelectItem value='COMPLETED'>Completed</SelectItem>
                  <SelectItem value='CANCELLED'>Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className='text-sm font-medium text-gray-700 mb-1 block'>Date</label>
              <Input
                type='date'
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className='bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 text-sm'>{error}</div>
      )}

      {/* Table */}
      <div className='bg-white border border-gray-200 rounded-lg overflow-hidden'>
        {loading ? (
          <div className='p-4 space-y-3'>
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className='h-16 w-full' />
            ))}
          </div>
        ) : filteredConsultations.length === 0 ? (
          <Empty>
            <EmptyMedia>
              <Stethoscope className='w-12 h-12 text-gray-400' />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>No consultations found</EmptyTitle>
              <EmptyDescription>
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'No consultations have been created yet.'}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-gray-50 border-b border-gray-200'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Patient
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Scheduled At
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Status
                    </th>
                    <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {filteredConsultations.slice(startIndex, startIndex + itemsPerPage).map(consultation => (
                    <tr key={consultation.id} className='hover:bg-gray-50'>
                      <td className='px-6 py-4'>
                        <div className='flex items-center min-w-0'>
                          <div className='shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center'>
                            <User className='w-5 h-5 text-blue-600' />
                          </div>
                          <div className='ml-4 min-w-0'>
                            <div className='text-sm font-medium text-gray-900 truncate'>
                              {consultation.patient?.name || 'N/A'}
                            </div>
                            {consultation.patient?.email && (
                              <div className='text-sm text-gray-500 truncate' title={consultation.patient.email}>
                                {consultation.patient.email}
                              </div>
                            )}
                            {consultation.patient?.phoneNumber && (
                              <div className='text-xs text-gray-400 mt-0.5'>
                                {consultation.patient.phoneNumber}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center text-sm text-gray-900'>
                          <Calendar className='w-4 h-4 mr-2 text-gray-400 shrink-0' />
                          {formatDateSafe(consultation.date ?? (consultation as any).scheduledAt, 'MMM d, yyyy HH:mm')}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <ConsultationStatusBadge status={consultation.status} />
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant='ghost' size='sm'>
                              <MoreVertical className='w-4 h-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuItem onClick={() => navigate(`/dashboard/consultations/${consultation.id}`)}>
                              <Eye className='w-4 h-4 mr-2' />
                              View Details
                            </DropdownMenuItem>
                            {userRole === 'ADMIN' && (
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(consultation)}
                                className='text-red-600'
                              >
                                <Trash2 className='w-4 h-4 mr-2' />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className='bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200'>
                <div className='text-sm text-gray-700'>
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, pagination.total)} of{' '}
                  {pagination.total} consultations
                </div>
                <div className='flex items-center gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className='w-4 h-4' />
                  </Button>
                  <div className='text-sm text-gray-700'>
                    Page {currentPage} of {totalPages}
                  </div>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className='w-4 h-4' />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title='Delete Consultation'
        description={`Are you sure you want to delete this consultation? This action cannot be undone.`}
      />

      {/* Create Consultation Modal */}
      <CreateConsultationModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
    </div>
  );
}
