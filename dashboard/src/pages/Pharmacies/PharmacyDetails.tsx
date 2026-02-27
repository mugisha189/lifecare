import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/LayoutWithNav';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { pharmaciesApi, userApi } from '@/lib/api';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';
import {
  ArrowLeft,
  Pill,
  MapPin,
  Phone,
  Mail,
  Edit,
  Users,
  Plus,
  Trash2,
  UserPlus,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import CreateEditPharmacyModal from './CreateEditPharmacyModal';

interface PharmacyPharmacist {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    role: {
      name: string;
    };
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: {
    id: string;
    name: string;
  };
}

export default function PharmacyDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [assignPharmacistModalOpen, setAssignPharmacistModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [pharmacistToRemove, setPharmacistToRemove] = useState<PharmacyPharmacist | null>(null);

  // Fetch pharmacy details
  const { data: pharmacyResponse, isLoading: loadingPharmacy, refetch: refetchPharmacy } = useQuery({
    queryKey: ['pharmacy', id],
    queryFn: () => pharmaciesApi.getOne(id!),
    enabled: !!id,
  });

  // Fetch pharmacy pharmacists
  const { data: pharmacistsResponse, isLoading: loadingPharmacists, refetch: refetchPharmacists } = useQuery({
    queryKey: ['pharmacy-pharmacists', id],
    queryFn: () => pharmaciesApi.getPharmacyPharmacists(id!),
    enabled: !!id,
  });

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Search pharmacists via API with debounce
  const { data: searchResponse, isLoading: searchingPharmacists } = useQuery({
    queryKey: ['search-pharmacists', debouncedSearchQuery],
    queryFn: () => userApi.search(debouncedSearchQuery || undefined, 'PHARMACIST', 20),
    enabled: assignPharmacistModalOpen,
  });

  const pharmacy = pharmacyResponse?.data?.data;
  const pharmacists = pharmacistsResponse?.data?.data || [];
  const filteredPharmacists: User[] = searchResponse?.data?.data || [];

  const handleRemovePharmacistClick = (pharmacist: PharmacyPharmacist) => {
    setPharmacistToRemove(pharmacist);
    setRemoveDialogOpen(true);
  };

  const handleRemovePharmacistConfirm = async () => {
    if (!pharmacistToRemove || !id) return;

    try {
      const response = await pharmaciesApi.removePharmacist(id, pharmacistToRemove.id);
      if (response.data.ok) {
        toast.success('Pharmacist removed from pharmacy successfully');
        refetchPharmacists();
        refetchPharmacy();
        setRemoveDialogOpen(false);
        setPharmacistToRemove(null);
      } else {
        toast.error(response.data.message || 'Failed to remove pharmacist');
      }
    } catch (error) {
      toast.error('Failed to remove pharmacist from pharmacy');
      console.error('Error removing pharmacist:', error);
    }
  };

  const handleAssignPharmacist = async () => {
    if (!selectedUserId || !id) {
      toast.error('Please select a pharmacist');
      return;
    }

    try {
      const response = await pharmaciesApi.assignPharmacist(id, selectedUserId);

      if (response.data.ok) {
        toast.success('Pharmacist assigned successfully');
        refetchPharmacists();
        refetchPharmacy();
        setAssignPharmacistModalOpen(false);
        setSelectedUserId('');
        setSearchQuery('');
      } else {
        toast.error(response.data.message || 'Failed to assign pharmacist');
      }
    } catch (error) {
      toast.error('Failed to assign pharmacist to pharmacy');
      console.error('Error assigning pharmacist:', error);
    }
  };

  if (loadingPharmacy) {
    return (
      <Layout>
        <div className='h-full p-6'>
          <div className='max-w-6xl mx-auto'>
            <Skeleton className='h-10 w-64 mb-6' />
            <div className='bg-white rounded-lg border p-6'>
              <Skeleton className='h-8 w-full mb-4' />
              <Skeleton className='h-6 w-full mb-2' />
              <Skeleton className='h-6 w-full mb-2' />
              <Skeleton className='h-6 w-full' />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!pharmacy) {
    return (
      <Layout>
        <div className='h-full p-6'>
          <div className='max-w-6xl mx-auto'>
            <Button variant='ghost' onClick={() => navigate('/dashboard/pharmacies')} className='mb-4'>
              <ArrowLeft className='w-4 h-4 mr-2' />
              Back to Pharmacies
            </Button>
            <div className='text-center py-12'>
              <p className='text-gray-500'>Pharmacy not found</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className='h-full p-6'>
        <div className='max-w-6xl mx-auto'>
          {/* Header */}
          <div className='flex items-center justify-between mb-6'>
            <div className='flex items-center gap-4'>
              <Button variant='ghost' onClick={() => navigate('/dashboard/pharmacies')}>
                <ArrowLeft className='w-4 h-4 mr-2' />
                Back
              </Button>
              <div>
                <h1 className='text-2xl font-bold text-gray-900'>{pharmacy.name}</h1>
                <p className='text-sm text-gray-500'>Pharmacy Details</p>
              </div>
            </div>
            <Button onClick={() => setEditModalOpen(true)}>
              <Edit className='w-4 h-4 mr-2' />
              Edit Pharmacy
            </Button>
          </div>

          {/* Pharmacy Info Card */}
          <div className='bg-white rounded-lg border p-6 mb-6'>
            <div className='flex items-start justify-between mb-4'>
              <div className='flex items-center gap-4'>
                <div className='flex-shrink-0 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center'>
                  <Pill className='w-8 h-8 text-green-600' />
                </div>
                <div>
                  <h2 className='text-xl font-semibold text-gray-900'>{pharmacy.name}</h2>
                  <Badge className={pharmacy.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {pharmacy.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-3'>
                <div className='flex items-start gap-2'>
                  <MapPin className='w-5 h-5 text-gray-400 mt-0.5' />
                  <div>
                    <p className='text-sm font-medium text-gray-700'>Location</p>
                    <p className='text-sm text-gray-600'>{pharmacy.address}</p>
                    <p className='text-sm text-gray-600'>{pharmacy.city}, {pharmacy.country}</p>
                  </div>
                </div>
                {pharmacy.phoneNumber && (
                  <div className='flex items-center gap-2'>
                    <Phone className='w-5 h-5 text-gray-400' />
                    <div>
                      <p className='text-sm font-medium text-gray-700'>Phone</p>
                      <p className='text-sm text-gray-600'>{pharmacy.phoneNumber}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className='space-y-3'>
                {pharmacy.email && (
                  <div className='flex items-center gap-2'>
                    <Mail className='w-5 h-5 text-gray-400' />
                    <div>
                      <p className='text-sm font-medium text-gray-700'>Email</p>
                      <p className='text-sm text-gray-600'>{pharmacy.email}</p>
                    </div>
                  </div>
                )}
                <div className='flex items-center gap-2'>
                  <Users className='w-5 h-5 text-gray-400' />
                  <div>
                    <p className='text-sm font-medium text-gray-700'>Pharmacists</p>
                    <p className='text-sm text-gray-600'>
                      {pharmacy._count?.pharmacists || 0} pharmacists
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pharmacists Section */}
          <div className='bg-white rounded-lg border p-6'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold text-gray-900'>Pharmacists ({pharmacists.length})</h3>
              <Button size='sm' onClick={() => setAssignPharmacistModalOpen(true)}>
                <Plus className='w-4 h-4 mr-2' />
                Assign Pharmacist
              </Button>
            </div>

            {loadingPharmacists ? (
              <div className='space-y-3'>
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className='h-16 w-full' />
                ))}
              </div>
            ) : pharmacists.length === 0 ? (
              <div className='text-center py-12 text-gray-500'>
                <UserPlus className='w-12 h-12 mx-auto mb-3 text-gray-300' />
                <p>No pharmacists assigned to this pharmacy yet</p>
                <p className='text-sm mt-1'>Click "Assign Pharmacist" to add pharmacists</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pharmacists.map((pharmacist: PharmacyPharmacist) => (
                    <TableRow key={pharmacist.id}>
                      <TableCell>
                        <div className='font-medium'>{pharmacist.user.name}</div>
                      </TableCell>
                      <TableCell>
                        <div className='text-sm text-gray-600'>
                          <div>{pharmacist.user.email}</div>
                          <div>{pharmacist.user.phoneNumber}</div>
                        </div>
                      </TableCell>
                      <TableCell className='text-right'>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='text-red-600 hover:text-red-700'
                          onClick={() => handleRemovePharmacistClick(pharmacist)}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>

      {/* Edit Pharmacy Modal */}
      <CreateEditPharmacyModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        mode='edit'
        pharmacy={pharmacy}
      />

      {/* Assign Pharmacist Modal */}
      <Dialog open={assignPharmacistModalOpen} onOpenChange={(open) => {
        setAssignPharmacistModalOpen(open);
        if (!open) {
          setSearchQuery('');
          setSelectedUserId('');
        }
      }}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Assign Pharmacist to Pharmacy</DialogTitle>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label>Search Pharmacists</Label>
              <Input
                placeholder='Search by name or email...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='mb-3'
              />
            </div>
            
            <div className='border rounded-lg max-h-96 overflow-y-auto'>
              {searchingPharmacists ? (
                <div className='p-8 text-center text-gray-500'>
                  <div className='w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3' />
                  <p>Searching...</p>
                </div>
              ) : filteredPharmacists.length === 0 ? (
                <div className='p-8 text-center text-gray-500'>
                  <Users className='w-12 h-12 mx-auto mb-3 text-gray-300' />
                  <p>{searchQuery ? 'No pharmacists found matching your search' : 'Start typing to search for pharmacists'}</p>
                </div>
              ) : (
                <div className='divide-y'>
                  {filteredPharmacists.map(user => (
                    <div
                      key={user.id}
                      onClick={() => setSelectedUserId(user.id)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedUserId === user.id ? 'bg-green-50 border-l-4 border-green-500' : ''
                      }`}
                    >
                      <div className='flex items-center justify-between'>
                        <div className='flex-1'>
                          <div className='flex items-center gap-2'>
                            <p className='font-medium text-gray-900'>{user.name}</p>
                            <Badge className='bg-green-100 text-green-800'>
                              Pharmacist
                            </Badge>
                          </div>
                          <p className='text-sm text-gray-600 mt-1'>{user.email}</p>
                        </div>
                        {selectedUserId === user.id && (
                          <div className='w-5 h-5 rounded-full bg-green-500 flex items-center justify-center'>
                            <svg className='w-3 h-3 text-white' fill='currentColor' viewBox='0 0 20 20'>
                              <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => {
              setAssignPharmacistModalOpen(false);
              setSearchQuery('');
              setSelectedUserId('');
            }}>
              Cancel
            </Button>
            <Button onClick={handleAssignPharmacist} disabled={!selectedUserId}>
              Assign Selected Pharmacist
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Pharmacist Confirmation Dialog */}
      <ConfirmDialog
        open={removeDialogOpen}
        onOpenChange={setRemoveDialogOpen}
        onConfirm={handleRemovePharmacistConfirm}
        title='Remove Pharmacist from Pharmacy'
        description={
          pharmacistToRemove
            ? `Are you sure you want to remove ${pharmacistToRemove.user.name} from this pharmacy? They won't be deleted, just unassigned.`
            : ''
        }
        confirmText='Remove'
        variant='destructive'
      />
    </Layout>
  );
}
