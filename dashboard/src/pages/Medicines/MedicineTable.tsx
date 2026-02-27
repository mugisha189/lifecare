import { useState, useMemo, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { useMedicines } from '@/hooks/useMedicines';
import type { Medicine } from '@/lib/api';
import { Eye, MoreVertical, Edit, Trash2, Plus, Search, Pill } from 'lucide-react';
import MedicineDetails from './MedicineDetails';
import EditMedicineDialog from './EditMedicineDialog';
import CreateMedicineModal from './CreateMedicineModal';

const ITEMS_PER_PAGE = 10;

export default function MedicineTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [medicineToEdit, setMedicineToEdit] = useState<Medicine | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const filters = useMemo(
    () => ({
      page: currentPage,
      limit: itemsPerPage,
      search: searchQuery || undefined,
      active: statusFilter !== 'all' ? statusFilter === 'active' : undefined,
    }),
    [currentPage, itemsPerPage, searchQuery, statusFilter],
  );

  const { medicines, pagination, loading, error, createMedicine, updateMedicine, deleteMedicine, refetch } =
    useMedicines(filters);

  const totalPages = pagination?.totalPages ?? 1;

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

  const handleViewDetails = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedMedicine(null);
  };

  const handleEditClick = (medicine: Medicine) => {
    setMedicineToEdit(medicine);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = (data: { name: string; description?: string }) => {
    if (!medicineToEdit) return;
    updateMedicine.mutate(
      { id: medicineToEdit.id, data },
      {
        onSuccess: () => {
          setEditDialogOpen(false);
          setMedicineToEdit(null);
        },
      },
    );
  };

  const handleCreate = (data: { name: string; description?: string }) => {
    createMedicine.mutate(data, {
      onSuccess: () => {
        setCreateModalOpen(false);
      },
    });
  };

  return (
    <>
      <div className='bg-white rounded-lg shadow'>
        <div className='px-6 py-4 border-b flex items-center justify-between'>
          <div>
            <h2 className='text-xl font-semibold'>Medicine Catalog</h2>
            <p className='text-sm text-gray-500 mt-1'>Manage medicines (name and description)</p>
          </div>
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className='w-4 h-4 mr-2' />
            Add Medicine
          </Button>
        </div>

        <div className='px-6 py-4 border-b flex flex-wrap gap-4 items-center'>
          <div className='flex-1 min-w-[200px]'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4' />
              <Input
                placeholder='Search by name or description...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='pl-10'
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className='w-[140px]'>
              <SelectValue placeholder='Status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All</SelectItem>
              <SelectItem value='active'>Active</SelectItem>
              <SelectItem value='inactive'>Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {error && (
          <div className='px-6 py-4 bg-red-50 border-b border-red-200 text-red-600 text-sm'>{error}</div>
        )}

        <div className='px-6 py-4'>
          <div className='border rounded-lg overflow-hidden'>
            {loading ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className='h-4 w-32' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='h-4 w-48' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='h-4 w-16' />
                      </TableCell>
                      <TableCell className='text-right'>
                        <Skeleton className='h-4 w-16 ml-auto' />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : medicines.length === 0 ? (
              <div className='p-12'>
                <Empty>
                  <EmptyMedia>
                    <Pill className='w-12 h-12 text-gray-400' />
                  </EmptyMedia>
                  <EmptyHeader>
                    <EmptyTitle>No medicines found</EmptyTitle>
                    <EmptyDescription>
                      {searchQuery || statusFilter !== 'all'
                        ? 'Try adjusting filters.'
                        : 'Add medicines to the catalog to get started.'}
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className='text-right'>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {medicines.map(medicine => (
                      <TableRow key={medicine.id} className='hover:bg-gray-50'>
                        <TableCell className='font-medium'>{medicine.name}</TableCell>
                        <TableCell className='max-w-md truncate text-gray-600'>
                          {medicine.description ?? '—'}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${
                              medicine.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {medicine.active ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                        <TableCell className='text-right'>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant='ghost' size='sm'>
                                <MoreVertical className='w-4 h-4' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                              <DropdownMenuItem onClick={() => handleViewDetails(medicine)}>
                                <Eye className='w-4 h-4 mr-2' />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditClick(medicine)}>
                                <Edit className='w-4 h-4 mr-2' />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className='text-red-600'
                                onClick={() => deleteMedicine.mutate(medicine.id)}
                              >
                                <Trash2 className='w-4 h-4 mr-2' />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {pagination && pagination.totalPages > 1 && (
                  <div className='px-6 py-4 border-t flex items-center justify-between'>
                    <div className='text-sm text-gray-700'>
                      Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                      {Math.min(currentPage * itemsPerPage, pagination.total)} of {pagination.total}
                    </div>
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => handlePageChange(currentPage - 1)}
                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                        <PaginationItem>
                          <span className='px-4 text-sm'>
                            Page {currentPage} of {totalPages}
                          </span>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => handlePageChange(currentPage + 1)}
                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {selectedMedicine && (
        <MedicineDetails medicine={selectedMedicine} isOpen={isDetailsOpen} onClose={handleCloseDetails} />
      )}

      {medicineToEdit && (
        <EditMedicineDialog
          medicine={medicineToEdit}
          isOpen={editDialogOpen}
          onClose={() => {
            setEditDialogOpen(false);
            setMedicineToEdit(null);
          }}
          onSave={handleSaveEdit}
        />
      )}

      <CreateMedicineModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSubmit={handleCreate}
        isPending={createMedicine.isPending}
      />
    </>
  );
}
