import { useState, useEffect, useMemo } from 'react';
import Layout from '@/components/LayoutWithNav';
import {
  Search,
  Download,
  SlidersHorizontal,
  Eye,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Pill,
  CheckCircle,
  Clock,
  XCircle,
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
import { usePrescriptions, type Prescription } from '@/hooks/usePrescriptions';
import { format } from 'date-fns';
import { useUserRole } from '@/hooks/useRole';
import PrescriptionDetailsModal from './PrescriptionDetailsModal';
import RecordNewPrescriptionModal from './RecordNewPrescriptionModal';
import { toast } from 'sonner';

const PrescriptionStatusBadge = ({ status }: { status: string }) => {
  const statusConfig: Record<string, { label: string; className: string }> = {
    DISPENSED: { label: 'Dispensed', className: 'bg-green-100 text-green-800' },
    PENDING: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
    CANCELLED: { label: 'Cancelled', className: 'bg-red-100 text-red-800' },
  };

  const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };

  return (
    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${config.className}`}>
      {config.label}
    </span>
  );
};

export default function PrescriptionsPage() {
  const userRole = useUserRole();
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [recordNewOpen, setRecordNewOpen] = useState(false);

  const filters = useMemo(() => {
    const apiFilters: { page?: number; limit?: number; status?: string } = {
      page: currentPage,
      limit: itemsPerPage,
    };

    if (statusFilter !== 'all') {
      apiFilters.status = statusFilter;
    }

    return apiFilters;
  }, [currentPage, itemsPerPage, statusFilter]);

  const { prescriptions, pagination, loading, error, updatePrescription, refetch } = usePrescriptions(filters);

  const filteredPrescriptions = useMemo(() => {
    if (!searchQuery) return prescriptions;

    const query = searchQuery.toLowerCase();
    return prescriptions.filter(
      prescription =>
        prescription.id.toLowerCase().includes(query) ||
        prescription.patient?.name?.toLowerCase().includes(query) ||
        prescription.patient?.email?.toLowerCase().includes(query)
    );
  }, [prescriptions, searchQuery]);

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

  const handleDispense = (prescription: Prescription) => {
    if (userRole !== 'PHARMACIST') {
      toast.error('Only pharmacists can dispense prescriptions');
      return;
    }
    updatePrescription.mutate(
      { id: prescription.id, data: { status: 'DISPENSED' } },
      {
        onSuccess: () => {
          toast.success('Prescription dispensed successfully');
        },
      }
    );
  };

  const handleExport = () => {
    if (filteredPrescriptions.length === 0) return;

    const headers = ['ID', 'Patient', 'Status', 'Medicines Count', 'Created At'];
    const csvContent = [
      headers.join(','),
      ...filteredPrescriptions.map(p =>
        [
          `"${p.id}"`,
          `"${p.patient?.name || 'N/A'}"`,
          `"${p.status}"`,
          `"${p.medicines?.length || 0}"`,
          `"${format(new Date(p.createdAt), 'yyyy-MM-dd HH:mm:ss')}"`,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `prescriptions_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout>
      <div className='p-6 space-y-4'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Prescriptions</h1>
            <p className='text-sm text-gray-500 mt-1'>
              {userRole === 'PHARMACIST'
                ? 'Dispense pending prescriptions or record by consultation code'
                : userRole === 'DOCTOR'
                  ? 'View and manage your prescriptions'
                  : 'Manage all prescriptions'}
            </p>
          </div>
          <div className='flex items-center gap-2'>
            {userRole === 'PHARMACIST' && (
              <Button onClick={() => setRecordNewOpen(true)}>
                <Pill className='w-4 h-4 mr-2' />
                Record New Prescription
              </Button>
            )}
            <Button variant='outline' onClick={handleExport} disabled={filteredPrescriptions.length === 0}>
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
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='text-sm font-medium text-gray-700 mb-1 block'>Search</label>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
                  <Input
                    placeholder='Search prescriptions...'
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
                    <SelectItem value='PENDING'>Pending</SelectItem>
                    <SelectItem value='DISPENSED'>Dispensed</SelectItem>
                    <SelectItem value='CANCELLED'>Cancelled</SelectItem>
                  </SelectContent>
                </Select>
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
          ) : filteredPrescriptions.length === 0 ? (
            <Empty>
              <EmptyMedia>
                <Pill className='w-12 h-12 text-gray-400' />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>No prescriptions found</EmptyTitle>
                <EmptyDescription>
                  {userRole === 'PHARMACIST'
                    ? 'No pending prescriptions. Use Record New Prescription and enter a consultation code to dispense.'
                    : searchQuery || statusFilter !== 'all'
                      ? 'Try adjusting your filters to see more results.'
                      : 'No prescriptions have been created yet.'}
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
                        Medicines
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Status
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Created At
                      </th>
                      <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {filteredPrescriptions.slice(startIndex, startIndex + itemsPerPage).map(prescription => (
                      <tr key={prescription.id} className='hover:bg-gray-50'>
                        <td className='px-6 py-4'>
                          <div className='text-sm font-medium text-gray-900'>{prescription.patient?.name || 'N/A'}</div>
                          <div className='text-sm text-gray-500'>{prescription.patient?.email || '—'}</div>
                          {prescription.patient?.phoneNumber && (
                            <div className='text-sm text-gray-500'>{prescription.patient.phoneNumber}</div>
                          )}
                        </td>
                        <td className='px-6 py-4'>
                          <div className='text-sm text-gray-900'>
                            {prescription.medicines?.length || 0} medicine(s)
                          </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <PrescriptionStatusBadge status={prescription.status} />
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                          {format(new Date(prescription.createdAt), 'MMM d, yyyy')}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant='ghost' size='sm'>
                                <MoreVertical className='w-4 h-4' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                              <DropdownMenuItem onClick={() => setSelectedPrescription(prescription)}>
                                <Eye className='w-4 h-4 mr-2' />
                                View Details
                              </DropdownMenuItem>
                              {userRole === 'PHARMACIST' && prescription.status === 'PENDING' && (
                                <DropdownMenuItem onClick={() => handleDispense(prescription)}>
                                  <CheckCircle className='w-4 h-4 mr-2' />
                                  Dispense
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
                    {pagination.total} prescriptions
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

        {/* Prescription Details Modal */}
        {selectedPrescription && (
          <PrescriptionDetailsModal
            prescription={selectedPrescription}
            onClose={() => setSelectedPrescription(null)}
            onDispense={userRole === 'PHARMACIST' && selectedPrescription.status === 'PENDING' ? handleDispense : undefined}
          />
        )}

        {/* Record New Prescription (Pharmacist) */}
        {userRole === 'PHARMACIST' && (
          <RecordNewPrescriptionModal open={recordNewOpen} onOpenChange={setRecordNewOpen} />
        )}
      </div>
    </Layout>
  );
}
