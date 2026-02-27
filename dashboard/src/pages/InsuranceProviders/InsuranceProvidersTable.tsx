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
import { useInsuranceProviders, type InsuranceProvider } from '@/hooks/useInsuranceProviders';
import {
  Shield,
  MoreVertical,
  Trash2,
  Plus,
  Edit,
  Power,
  Users,
  Percent,
} from 'lucide-react';
import CreateEditInsuranceProviderModal from './CreateEditInsuranceProviderModal';

export default function InsuranceProvidersTable() {
  const { insuranceProviders, loading, error, deleteInsuranceProvider, toggleActive } = useInsuranceProviders();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [providerToDelete, setProviderToDelete] = useState<InsuranceProvider | null>(null);
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);
  const [providerToActivate, setProviderToActivate] = useState<InsuranceProvider | null>(null);
  const [createEditModalOpen, setCreateEditModalOpen] = useState(false);
  const [providerToEdit, setProviderToEdit] = useState<InsuranceProvider | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  const filteredProviders = useMemo(() => {
    let filtered = insuranceProviders;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        p => p.name.toLowerCase().includes(query) || p.contactInfo?.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => (statusFilter === 'active' ? p.active : !p.active));
    }

    return filtered;
  }, [insuranceProviders, searchQuery, statusFilter]);

  const handleCreateProvider = () => {
    setModalMode('create');
    setProviderToEdit(null);
    setCreateEditModalOpen(true);
  };

  const handleEditProvider = (provider: InsuranceProvider) => {
    setModalMode('edit');
    setProviderToEdit(provider);
    setCreateEditModalOpen(true);
  };

  const handleDeleteClick = (provider: InsuranceProvider) => {
    setProviderToDelete(provider);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!providerToDelete) return;
    deleteInsuranceProvider.mutate(providerToDelete.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setProviderToDelete(null);
      },
    });
  };

  const handleActivateDeactivate = (provider: InsuranceProvider) => {
    setProviderToActivate(provider);
    setActivateDialogOpen(true);
  };

  const handleActivateDeactivateConfirm = () => {
    if (!providerToActivate) return;
    toggleActive.mutate(
      { id: providerToActivate.id, active: !providerToActivate.active },
      {
        onSuccess: () => {
          setActivateDialogOpen(false);
          setProviderToActivate(null);
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
              <h2 className='text-xl font-semibold'>Insurance Providers</h2>
              <p className='text-sm text-gray-500 mt-1'>Manage insurance providers and their dividend structures</p>
            </div>
            <Button onClick={handleCreateProvider} className='bg-green-600 hover:bg-green-700'>
              <Plus className='w-4 h-4 mr-2' />
              Add Insurance Provider
            </Button>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <Label className='text-xs'>Search</Label>
              <Input
                type='text'
                placeholder='Search providers...'
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
                    <TableHead>Provider Name</TableHead>
                    <TableHead>Patient Dividend</TableHead>
                    <TableHead>Insurance Dividend</TableHead>
                    <TableHead>Patients</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className='h-4 w-48' /></TableCell>
                      <TableCell><Skeleton className='h-4 w-20' /></TableCell>
                      <TableCell><Skeleton className='h-4 w-20' /></TableCell>
                      <TableCell><Skeleton className='h-4 w-16' /></TableCell>
                      <TableCell><Skeleton className='h-5 w-20 rounded-full' /></TableCell>
                      <TableCell className='text-right'><Skeleton className='h-8 w-8 ml-auto' /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : error ? (
              <Empty className='border-0 h-64'>
                <EmptyHeader>
                  <EmptyMedia variant='icon'><Shield /></EmptyMedia>
                  <EmptyTitle>Error Loading Insurance Providers</EmptyTitle>
                  <EmptyDescription>{error}. Please try refreshing the page.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : filteredProviders.length === 0 ? (
              <Empty className='border-0 h-64'>
                <EmptyHeader>
                  <EmptyMedia variant='icon'><Shield /></EmptyMedia>
                  <EmptyTitle>No Insurance Providers Found</EmptyTitle>
                  <EmptyDescription>
                    {searchQuery || statusFilter !== 'all'
                      ? 'Try adjusting your filters.'
                      : 'Get started by adding your first insurance provider.'}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Provider Name</TableHead>
                    <TableHead>Patient Dividend</TableHead>
                    <TableHead>Insurance Dividend</TableHead>
                    <TableHead>Patients</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProviders.map(provider => (
                    <TableRow key={provider.id}>
                      <TableCell>
                        <div className='flex items-center gap-3'>
                          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50'>
                            <Shield className='h-5 w-5 text-blue-600' />
                          </div>
                          <div>
                            <div className='font-medium'>{provider.name}</div>
                            {provider.contactInfo && (
                              <div className='text-sm text-gray-500'>{provider.contactInfo}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-1.5'>
                          <Percent className='h-4 w-4 text-gray-400' />
                          <span className='font-medium text-green-600'>{provider.patientDividendPercent}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-1.5'>
                          <Percent className='h-4 w-4 text-gray-400' />
                          <span className='font-medium text-blue-600'>{provider.insuranceDividendPercent}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-1.5'>
                          <Users className='h-4 w-4 text-gray-400' />
                          <span>{provider._count?.patients || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={provider.active ? 'default' : 'secondary'} className='capitalize'>
                          {provider.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-right'>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                              <span className='sr-only'>Open menu</span>
                              <MoreVertical className='h-4 w-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuItem onClick={() => handleEditProvider(provider)}>
                              <Edit className='mr-2 h-4 w-4' />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleActivateDeactivate(provider)}>
                              <Power className='mr-2 h-4 w-4' />
                              {provider.active ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(provider)}
                              className='text-red-600 focus:text-red-600'
                            >
                              <Trash2 className='mr-2 h-4 w-4' />
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

      <CreateEditInsuranceProviderModal
        open={createEditModalOpen}
        onOpenChange={setCreateEditModalOpen}
        mode={modalMode}
        provider={providerToEdit}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title='Delete Insurance Provider'
        description={`Are you sure you want to delete "${providerToDelete?.name}"? This action cannot be undone.`}
        confirmText='Delete'
        cancelText='Cancel'
        onConfirm={handleDeleteConfirm}
        variant='destructive'
        isLoading={deleteInsuranceProvider.isPending}
      />

      <ConfirmDialog
        open={activateDialogOpen}
        onOpenChange={setActivateDialogOpen}
        title={`${providerToActivate?.active ? 'Deactivate' : 'Activate'} Insurance Provider`}
        description={`Are you sure you want to ${providerToActivate?.active ? 'deactivate' : 'activate'} "${providerToActivate?.name}"?`}
        confirmText={providerToActivate?.active ? 'Deactivate' : 'Activate'}
        cancelText='Cancel'
        onConfirm={handleActivateDeactivateConfirm}
        isLoading={toggleActive.isPending}
      />
    </>
  );
}
