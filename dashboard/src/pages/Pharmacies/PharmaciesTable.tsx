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
import { usePharmacies, type Pharmacy } from '@/hooks/usePharmacies';
import {
  Pill,
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
import CreateEditPharmacyModal from './CreateEditPharmacyModal';

export default function PharmaciesTable() {
  const navigate = useNavigate();
  const { pharmacies, loading, error, deletePharmacy, toggleActive } = usePharmacies();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pharmacyToDelete, setPharmacyToDelete] = useState<Pharmacy | null>(null);
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);
  const [pharmacyToActivate, setPharmacyToActivate] = useState<Pharmacy | null>(null);
  const [createEditModalOpen, setCreateEditModalOpen] = useState(false);
  const [pharmacyToEdit, setPharmacyToEdit] = useState<Pharmacy | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  const filteredPharmacies = useMemo(() => {
    let filtered = pharmacies;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        p =>
          p.name.toLowerCase().includes(query) ||
          p.address.toLowerCase().includes(query) ||
          p.city.toLowerCase().includes(query) ||
          p.email?.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => (statusFilter === 'active' ? p.active : !p.active));
    }

    return filtered;
  }, [pharmacies, searchQuery, statusFilter]);

  const handleCreatePharmacy = () => {
    setModalMode('create');
    setPharmacyToEdit(null);
    setCreateEditModalOpen(true);
  };

  const handleEditPharmacy = (pharmacy: Pharmacy) => {
    setModalMode('edit');
    setPharmacyToEdit(pharmacy);
    setCreateEditModalOpen(true);
  };

  const handleViewPharmacy = (pharmacy: Pharmacy) => {
    navigate(`/dashboard/pharmacies/${pharmacy.id}`);
  };

  const handleDeleteClick = (pharmacy: Pharmacy) => {
    setPharmacyToDelete(pharmacy);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!pharmacyToDelete) return;
    deletePharmacy.mutate(pharmacyToDelete.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setPharmacyToDelete(null);
      },
    });
  };

  const handleActivateDeactivate = (pharmacy: Pharmacy) => {
    setPharmacyToActivate(pharmacy);
    setActivateDialogOpen(true);
  };

  const handleActivateDeactivateConfirm = () => {
    if (!pharmacyToActivate) return;
    toggleActive.mutate(
      { id: pharmacyToActivate.id, active: !pharmacyToActivate.active },
      {
        onSuccess: () => {
          setActivateDialogOpen(false);
          setPharmacyToActivate(null);
        },
      }
    );
  };

  return (
    <div className='h-full flex flex-col overflow-hidden'>
      <div className='flex-1 overflow-y-auto px-6 py-4'>
        <div className='max-w-7xl mx-auto'>
          {/* Header */}
          <div className='flex items-center justify-between mb-6'>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>Pharmacies</h1>
              <p className='text-sm text-gray-500'>Manage pharmacy locations and staff</p>
            </div>
            <Button onClick={handleCreatePharmacy}>
              <Plus className='w-4 h-4 mr-2' />
              Create Pharmacy
            </Button>
          </div>

          {/* Filters */}
          <div className='bg-white rounded-lg border p-4 mb-6'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='space-y-2'>
                <Label>Search</Label>
                <Input
                  placeholder='Search pharmacies...'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <div className='space-y-2'>
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
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

          {/* Error State */}
          {error && (
            <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-6'>
              <p className='text-red-600 text-sm'>{error}</p>
            </div>
          )}

          {/* Table */}
          <div className='bg-white rounded-lg border'>
            {loading ? (
              <div className='p-6 space-y-4'>
                {[1, 2, 3, 4, 5].map(i => (
                  <Skeleton key={i} className='h-16 w-full' />
                ))}
              </div>
            ) : filteredPharmacies.length === 0 ? (
              <Empty className='border-0 h-64'>
                <EmptyHeader>
                  <EmptyMedia variant='icon'><Pill /></EmptyMedia>
                  <EmptyTitle>No Pharmacies Found</EmptyTitle>
                  <EmptyDescription>
                    {searchQuery || statusFilter !== 'all'
                      ? 'Try adjusting your filters.'
                      : 'Get started by adding your first pharmacy.'}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pharmacy</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Staff</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPharmacies.map(pharmacy => (
                    <TableRow key={pharmacy.id}>
                      <TableCell>
                        <div className='flex items-center gap-3'>
                          <div className='flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center'>
                            <Pill className='w-5 h-5 text-green-600' />
                          </div>
                          <div>
                            <div className='text-sm font-medium text-gray-900'>{pharmacy.name}</div>
                            <div className='text-sm text-gray-500'>{pharmacy.address}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-1 text-sm text-gray-600'>
                          <MapPin className='w-4 h-4' />
                          {pharmacy.city}, {pharmacy.country}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='space-y-1'>
                          {pharmacy.phoneNumber && (
                            <div className='flex items-center gap-1 text-sm text-gray-600'>
                              <Phone className='w-4 h-4' />
                              {pharmacy.phoneNumber}
                            </div>
                          )}
                          {pharmacy.email && (
                            <div className='flex items-center gap-1 text-sm text-gray-600'>
                              <Mail className='w-4 h-4' />
                              {pharmacy.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-1 text-sm text-gray-600'>
                          <Users className='w-4 h-4' />
                          {pharmacy._count?.pharmacists || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={pharmacy.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {pharmacy.active ? 'Active' : 'Inactive'}
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
                            <DropdownMenuItem onClick={() => handleViewPharmacy(pharmacy)}>
                              <Eye className='h-4 w-4 mr-2' />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEditPharmacy(pharmacy)}>
                              <Edit className='h-4 w-4 mr-2' />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleActivateDeactivate(pharmacy)}>
                              {pharmacy.active ? (
                                <XCircle className='h-4 w-4 mr-2' />
                              ) : (
                                <Power className='h-4 w-4 mr-2' />
                              )}
                              {pharmacy.active ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className='text-red-600' onClick={() => handleDeleteClick(pharmacy)}>
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
        title='Delete Pharmacy'
        description={pharmacyToDelete ? `Are you sure you want to delete ${pharmacyToDelete.name}? This action cannot be undone.` : ''}
        confirmText='Delete'
        variant='destructive'
      />

      <ConfirmDialog
        open={activateDialogOpen}
        onOpenChange={setActivateDialogOpen}
        onConfirm={handleActivateDeactivateConfirm}
        title={pharmacyToActivate?.active ? 'Deactivate Pharmacy' : 'Activate Pharmacy'}
        description={
          pharmacyToActivate
            ? `Are you sure you want to ${pharmacyToActivate.active ? 'deactivate' : 'activate'} ${pharmacyToActivate.name}?`
            : ''
        }
        confirmText={pharmacyToActivate?.active ? 'Deactivate' : 'Activate'}
      />

      <CreateEditPharmacyModal
        open={createEditModalOpen}
        onOpenChange={setCreateEditModalOpen}
        mode={modalMode}
        pharmacy={pharmacyToEdit}
      />
    </div>
  );
}
