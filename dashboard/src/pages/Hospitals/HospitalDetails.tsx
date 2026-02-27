import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/LayoutWithNav';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { hospitalsApi, userApi } from '@/lib/api';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  Mail,
  Edit,
  Users,
  Plus,
  Trash2,
  UserPlus,
  FlaskConical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import CreateEditHospitalModal from './CreateEditHospitalModal';

interface HospitalStaff {
  id: string;
  specialization?: string;
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

export default function HospitalDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [assignStaffModalOpen, setAssignStaffModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [staffToRemove, setStaffToRemove] = useState<HospitalStaff | null>(null);

  // Fetch hospital details
  const { data: hospitalResponse, isLoading: loadingHospital, refetch: refetchHospital } = useQuery({
    queryKey: ['hospital', id],
    queryFn: () => hospitalsApi.getOne(id!),
    enabled: !!id,
  });

  // Fetch hospital staff (doctors and lab staff)
  const { data: doctorsResponse, isLoading: loadingDoctors, refetch: refetchDoctors } = useQuery({
    queryKey: ['hospital-doctors', id],
    queryFn: () => hospitalsApi.getHospitalDoctors(id!),
    enabled: !!id,
  });

  const { data: labStaffResponse, isLoading: loadingLabStaff, refetch: refetchLabStaff } = useQuery({
    queryKey: ['hospital-lab-staff', id],
    queryFn: () => hospitalsApi.getHospitalLabStaff(id!),
    enabled: !!id,
  });

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Search users via API with debounce
  const { data: searchResponse, isLoading: searchingUsers } = useQuery({
    queryKey: ['search-staff', debouncedSearchQuery],
    queryFn: () => {
      // Search for both DOCTOR and LABORATORY_STAFF
      // Backend doesn't support multiple roles, so we'll search without role filter
      // and filter client-side for now
      return userApi.search(debouncedSearchQuery || undefined, undefined, 20);
    },
    enabled: assignStaffModalOpen,
  });

  const hospital = hospitalResponse?.data?.data;
  const doctors = doctorsResponse?.data?.data || [];
  const labStaff = labStaffResponse?.data?.data || [];
  const searchResults: User[] = searchResponse?.data?.data || [];

  // Filter search results to only doctors and lab staff
  const filteredStaff = searchResults.filter(user => 
    user.role.name === 'DOCTOR' || user.role.name === 'LABORATORY_STAFF'
  );

  const handleRemoveStaffClick = (staff: HospitalStaff) => {
    setStaffToRemove(staff);
    setRemoveDialogOpen(true);
  };

  const handleRemoveStaffConfirm = async () => {
    if (!staffToRemove || !id) return;

    try {
      const isDoctor = staffToRemove.user.role.name === 'DOCTOR';
      const response = isDoctor
        ? await hospitalsApi.removeDoctor(id, staffToRemove.id)
        : await hospitalsApi.removeLabStaff(id, staffToRemove.id);
      
      if (response.data.ok) {
        toast.success('Staff member removed from hospital successfully');
        if (isDoctor) {
          refetchDoctors();
        } else {
          refetchLabStaff();
        }
        refetchHospital();
        setRemoveDialogOpen(false);
        setStaffToRemove(null);
      } else {
        toast.error(response.data.message || 'Failed to remove staff member');
      }
    } catch (error) {
      toast.error('Failed to remove staff member from hospital');
      console.error('Error removing staff:', error);
    }
  };

  const handleAssignStaff = async () => {
    if (!selectedUserId || !id) {
      toast.error('Please select a user');
      return;
    }

    try {
      // Find the user to determine their role
      const user = searchResults.find(u => u.id === selectedUserId);
      if (!user) {
        toast.error('User not found');
        return;
      }

      const isDoctor = user.role.name === 'DOCTOR';
      const response = isDoctor
        ? await hospitalsApi.assignDoctor(id, selectedUserId)
        : await hospitalsApi.assignLabStaff(id, selectedUserId);

      if (response.data.ok) {
        toast.success('Staff assigned successfully');
        if (isDoctor) {
          refetchDoctors();
        } else {
          refetchLabStaff();
        }
        refetchHospital();
        setAssignStaffModalOpen(false);
        setSelectedUserId('');
        setSearchQuery('');
      } else {
        toast.error(response.data.message || 'Failed to assign staff');
      }
    } catch (error) {
      toast.error('Failed to assign staff to hospital');
      console.error('Error assigning staff:', error);
    }
  };

  if (loadingHospital) {
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

  if (!hospital) {
    return (
      <Layout>
        <div className='h-full p-6'>
          <div className='max-w-6xl mx-auto'>
            <Button variant='ghost' onClick={() => navigate('/dashboard/hospitals')} className='mb-4'>
              <ArrowLeft className='w-4 h-4 mr-2' />
              Back to Hospitals
            </Button>
            <div className='text-center py-12'>
              <p className='text-gray-500'>Hospital not found</p>
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
              <Button variant='ghost' onClick={() => navigate('/dashboard/hospitals')}>
                <ArrowLeft className='w-4 h-4 mr-2' />
                Back
              </Button>
              <div>
                <h1 className='text-2xl font-bold text-gray-900'>{hospital.name}</h1>
                <p className='text-sm text-gray-500'>Hospital Details</p>
              </div>
            </div>
            <Button onClick={() => setEditModalOpen(true)}>
              <Edit className='w-4 h-4 mr-2' />
              Edit Hospital
            </Button>
          </div>

          {/* Hospital Info Card */}
          <div className='bg-white rounded-lg border p-6 mb-6'>
            <div className='flex items-start justify-between mb-4'>
              <div className='flex items-center gap-4'>
                <div className='flex-shrink-0 h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center'>
                  <Building2 className='w-8 h-8 text-blue-600' />
                </div>
                <div>
                  <h2 className='text-xl font-semibold text-gray-900'>{hospital.name}</h2>
                  <Badge className={hospital.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {hospital.active ? 'Active' : 'Inactive'}
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
                    <p className='text-sm text-gray-600'>{hospital.address}</p>
                    <p className='text-sm text-gray-600'>{hospital.city}, {hospital.country}</p>
                  </div>
                </div>
                {hospital.phoneNumber && (
                  <div className='flex items-center gap-2'>
                    <Phone className='w-5 h-5 text-gray-400' />
                    <div>
                      <p className='text-sm font-medium text-gray-700'>Phone</p>
                      <p className='text-sm text-gray-600'>{hospital.phoneNumber}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className='space-y-3'>
                {hospital.email && (
                  <div className='flex items-center gap-2'>
                    <Mail className='w-5 h-5 text-gray-400' />
                    <div>
                      <p className='text-sm font-medium text-gray-700'>Email</p>
                      <p className='text-sm text-gray-600'>{hospital.email}</p>
                    </div>
                  </div>
                )}
                <div className='flex items-center gap-2'>
                  <Users className='w-5 h-5 text-gray-400' />
                  <div>
                    <p className='text-sm font-medium text-gray-700'>Total Staff</p>
                    <p className='text-sm text-gray-600'>
                      {(hospital._count?.doctors || 0) + (hospital._count?.pharmacists || 0) + (hospital._count?.labStaff || 0)} staff members
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Staff Section */}
          <div className='bg-white rounded-lg border p-6 mb-6'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold text-gray-900'>Staff Members ({doctors.length + labStaff.length})</h3>
              <Button size='sm' onClick={() => setAssignStaffModalOpen(true)}>
                <Plus className='w-4 h-4 mr-2' />
                Assign Staff
              </Button>
            </div>

            {loadingDoctors || loadingLabStaff ? (
              <div className='space-y-3'>
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className='h-16 w-full' />
                ))}
              </div>
            ) : doctors.length === 0 && labStaff.length === 0 ? (
              <div className='text-center py-12 text-gray-500'>
                <UserPlus className='w-12 h-12 mx-auto mb-3 text-gray-300' />
                <p>No staff assigned to this hospital yet</p>
                <p className='text-sm mt-1'>Click "Assign Staff" to add doctors or lab staff</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {doctors.map((doctor: HospitalStaff) => (
                    <TableRow key={doctor.id}>
                      <TableCell>
                        <div className='font-medium'>{doctor.user.name}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className='bg-blue-100 text-blue-800'>Doctor</Badge>
                      </TableCell>
                      <TableCell>
                        <div className='text-sm text-gray-600'>{doctor.specialization || 'Not specified'}</div>
                      </TableCell>
                      <TableCell>
                        <div className='text-sm text-gray-600'>
                          <div>{doctor.user.email}</div>
                          <div>{doctor.user.phoneNumber}</div>
                        </div>
                      </TableCell>
                      <TableCell className='text-right'>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='text-red-600 hover:text-red-700'
                          onClick={() => handleRemoveStaffClick(doctor)}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {labStaff.map((staff: HospitalStaff) => (
                    <TableRow key={staff.id}>
                      <TableCell>
                        <div className='font-medium'>{staff.user.name}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className='bg-purple-100 text-purple-800'>Lab Staff</Badge>
                      </TableCell>
                      <TableCell>
                        <div className='text-sm text-gray-600'>-</div>
                      </TableCell>
                      <TableCell>
                        <div className='text-sm text-gray-600'>
                          <div>{staff.user.email}</div>
                          <div>{staff.user.phoneNumber}</div>
                        </div>
                      </TableCell>
                      <TableCell className='text-right'>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='text-red-600 hover:text-red-700'
                          onClick={() => handleRemoveStaffClick(staff)}
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

      {/* Edit Hospital Modal */}
      <CreateEditHospitalModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        mode='edit'
        hospital={hospital}
      />

      {/* Assign Staff Modal */}
      <Dialog open={assignStaffModalOpen} onOpenChange={(open) => {
        setAssignStaffModalOpen(open);
        if (!open) {
          setSearchQuery('');
          setSelectedUserId('');
        }
      }}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Assign Staff to Hospital</DialogTitle>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label>Search Staff (Doctors & Lab Staff)</Label>
              <Input
                placeholder='Search by name, email, or role...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='mb-3'
              />
            </div>
            
            <div className='border rounded-lg max-h-96 overflow-y-auto'>
              {searchingUsers ? (
                <div className='p-8 text-center text-gray-500'>
                  <div className='w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3' />
                  <p>Searching...</p>
                </div>
              ) : filteredStaff.length === 0 ? (
                <div className='p-8 text-center text-gray-500'>
                  <Users className='w-12 h-12 mx-auto mb-3 text-gray-300' />
                  <p>{searchQuery ? 'No staff found matching your search' : 'Start typing to search for staff'}</p>
                </div>
              ) : (
                <div className='divide-y'>
                  {filteredStaff.map(user => (
                    <div
                      key={user.id}
                      onClick={() => setSelectedUserId(user.id)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedUserId === user.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                    >
                      <div className='flex items-center justify-between'>
                        <div className='flex-1'>
                          <div className='flex items-center gap-2'>
                            <p className='font-medium text-gray-900'>{user.name}</p>
                            <Badge 
                              className={user.role.name === 'DOCTOR' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-purple-100 text-purple-800'
                              }
                            >
                              {user.role.name === 'DOCTOR' ? 'Doctor' : 'Lab Staff'}
                            </Badge>
                          </div>
                          <p className='text-sm text-gray-600 mt-1'>{user.email}</p>
                        </div>
                        {selectedUserId === user.id && (
                          <div className='w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center'>
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
              setAssignStaffModalOpen(false);
              setSearchQuery('');
              setSelectedUserId('');
            }}>
              Cancel
            </Button>
            <Button onClick={handleAssignStaff} disabled={!selectedUserId}>
              Assign Selected Staff
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Staff Confirmation Dialog */}
      <ConfirmDialog
        open={removeDialogOpen}
        onOpenChange={setRemoveDialogOpen}
        onConfirm={handleRemoveStaffConfirm}
        title='Remove Staff from Hospital'
        description={
          staffToRemove
            ? `Are you sure you want to remove ${staffToRemove.user.name} from this hospital? They won't be deleted, just unassigned.`
            : ''
        }
        confirmText='Remove'
        variant='destructive'
      />
    </Layout>
  );
}
