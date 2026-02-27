import { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { format } from 'date-fns';
import { useHospitals, type Hospital } from '@/hooks/useHospitals';
import {
  Building2,
  MoreVertical,
  Trash2,
  Plus,
  Edit,
  Power,
  XCircle,
  MapPin,
  Phone,
  Mail,
  Users,
  Eye,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CreateEditHospitalModal from './CreateEditHospitalModal';

export default function HospitalsTable() {
  const navigate = useNavigate();
  const { hospitals, loading, error, deleteHospital, toggleActive } = useHospitals();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [hospitalToDelete, setHospitalToDelete] = useState<Hospital | null>(null);
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);
  const [hospitalToActivate, setHospitalToActivate] = useState<Hospital | null>(null);
  const [createEditModalOpen, setCreateEditModalOpen] = useState(false);
  const [hospitalToEdit, setHospitalToEdit] = useState<Hospital | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  const handleViewHospital = (hospital: Hospital) => {
    navigate(`/dashboard/hospitals/${hospital.id}`);
  };

  const filteredHospitals = useMemo(() => {
    let filtered = hospitals;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        h =>
          h.name.toLowerCase().includes(query) ||
          h.address.toLowerCase().includes(query) ||
          h.city.toLowerCase().includes(query) ||
          h.email?.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(h => (statusFilter === 'active' ? h.active : !h.active));
    }

    return filtered;
  }, [hospitals, searchQuery, statusFilter]);

  const handleCreateHospital = () => {
    setModalMode('create');
    setHospitalToEdit(null);
    setCreateEditModalOpen(true);
  };

  const handleEditHospital = (hospital: Hospital) => {
    setModalMode('edit');
    setHospitalToEdit(hospital);
    setCreateEditModalOpen(true);
  };

  const handleDeleteClick = (hospital: Hospital) => {
    setHospitalToDelete(hospital);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!hospitalToDelete) return;
    deleteHospital.mutate(hospitalToDelete.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setHospitalToDelete(null);
      },
    });
  };

  const handleActivateDeactivate = (hospital: Hospital) => {
    setHospitalToActivate(hospital);
    setActivateDialogOpen(true);
  };

  const handleActivateDeactivateConfirm = () => {
    if (!hospitalToActivate) return;
    toggleActive.mutate(
      { id: hospitalToActivate.id, active: !hospitalToActivate.active },
      {
        onSuccess: () => {
          setActivateDialogOpen(false);
          setHospitalToActivate(null);
        },
      }
    );
  };

  return (
    <>
      <div className='bg-white rounded-lg shadow'>
        <div className='px-6 py-4 border-b'>
          <div className='flex items-center justify-between mb-4'>
            <div>
              <h2 className='text-xl font-semibold'>Hospitals</h2>
              <p className='text-sm text-gray-500 mt-1'>Manage hospital information and locations</p>
            </div>
            <Button onClick={handleCreateHospital} className='bg-green-600 hover:bg-green-700'>
              <Plus className='w-4 h-4 mr-2' />
              Add Hospital
            </Button>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <Label className='text-xs'>Search</Label>
              <Input
                type='text'
                placeholder='Search hospitals...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='mt-1 w-full'
              />
            </div>
            <div>
              <Label className='text-xs'>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className='mt-1 w-full'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Status</SelectItem>
                  <SelectItem value='active'>Active</SelectItem>
                  <SelectItem value='inactive'>Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className='px-6 py-4'>
          <div className='border rounded-lg overflow-hidden'>
            {loading ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hospital</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Staff</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className='h-4 w-48' /></TableCell>
                      <TableCell><Skeleton className='h-4 w-32' /></TableCell>
                      <TableCell><Skeleton className='h-4 w-36' /></TableCell>
                      <TableCell><Skeleton className='h-4 w-20' /></TableCell>
                      <TableCell><Skeleton className='h-5 w-20 rounded-full' /></TableCell>
                      <TableCell className='text-right'><Skeleton className='h-8 w-8 ml-auto' /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : error ? (
              <Empty className='border-0 h-64'>
                <EmptyHeader>
                  <EmptyMedia variant='icon'><Building2 /></EmptyMedia>
                  <EmptyTitle>Error Loading Hospitals</EmptyTitle>
                  <EmptyDescription>{error}. Please try refreshing the page.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : filteredHospitals.length === 0 ? (
              <Empty className='border-0 h-64'>
                <EmptyHeader>
                  <EmptyMedia variant='icon'><Building2 /></EmptyMedia>
                  <EmptyTitle>No Hospitals Found</EmptyTitle>
                  <EmptyDescription>
                    {searchQuery || statusFilter !== 'all'
                      ? 'Try adjusting your filters.'
                      : 'Get started by adding your first hospital.'}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hospital</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Staff</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHospitals.map(hospital => (
                    <TableRow key={hospital.id}>
                      <TableCell>
                        <div className='flex items-center gap-3'>
                          <div className='flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center'>
                            <Building2 className='w-5 h-5 text-blue-600' />
                          </div>
                          <div>
                            <div className='text-sm font-medium text-gray-900'>{hospital.name}</div>
                            <div className='text-sm text-gray-500'>{hospital.address}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-1 text-sm text-gray-600'>
                          <MapPin className='w-4 h-4' />
                          {hospital.city}, {hospital.country}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='space-y-1'>
                          {hospital.phoneNumber && (
                            <div className='flex items-center gap-1 text-sm text-gray-600'>
                              <Phone className='w-4 h-4' />
                              {hospital.phoneNumber}
                            </div>
                          )}
                          {hospital.email && (
                            <div className='flex items-center gap-1 text-sm text-gray-600'>
                              <Mail className='w-4 h-4' />
                              {hospital.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-1 text-sm text-gray-600'>
                          <Users className='w-4 h-4' />
                          {(hospital._count?.doctors || 0) + (hospital._count?.pharmacists || 0) + (hospital._count?.labStaff || 0)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={hospital.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {hospital.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-right'>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                              <MoreVertical className='h-4 w-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuItem onClick={() => handleViewHospital(hospital)}>
                              <Eye className='h-4 w-4 mr-2' />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEditHospital(hospital)}>
                              <Edit className='h-4 w-4 mr-2' />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleActivateDeactivate(hospital)}>
                              {hospital.active ? (
                                <XCircle className='h-4 w-4 mr-2' />
                              ) : (
                                <Power className='h-4 w-4 mr-2' />
                              )}
                              {hospital.active ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className='text-red-600' onClick={() => handleDeleteClick(hospital)}>
                              <Trash2 className='h-4 w-4 mr-2' />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title='Delete Hospital'
        description={hospitalToDelete ? `Are you sure you want to delete ${hospitalToDelete.name}? This action cannot be undone.` : ''}
        confirmText='Delete'
        variant='destructive'
        icon={<Trash2 className='h-5 w-5 text-red-600' />}
        isLoading={deleteHospital.isPending}
      />

      <ConfirmDialog
        open={activateDialogOpen}
        onOpenChange={setActivateDialogOpen}
        onConfirm={handleActivateDeactivateConfirm}
        title={hospitalToActivate ? (hospitalToActivate.active ? 'Deactivate Hospital' : 'Activate Hospital') : ''}
        description={hospitalToActivate ? `Are you sure you want to ${hospitalToActivate.active ? 'deactivate' : 'activate'} ${hospitalToActivate.name}?` : ''}
        confirmText={hospitalToActivate ? (hospitalToActivate.active ? 'Deactivate' : 'Activate') : 'Confirm'}
        variant={hospitalToActivate?.active ? 'warning' : 'success'}
        icon={hospitalToActivate ? (hospitalToActivate.active ? <XCircle className='h-5 w-5 text-orange-600' /> : <Power className='h-5 w-5 text-green-600' />) : null}
        isLoading={toggleActive.isPending}
      />

      <CreateEditHospitalModal
        open={createEditModalOpen}
        onOpenChange={setCreateEditModalOpen}
        hospital={hospitalToEdit}
        mode={modalMode}
      />
    </>
  );
}
