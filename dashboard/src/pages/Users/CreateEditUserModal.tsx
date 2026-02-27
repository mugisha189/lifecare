import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useUsers, type User } from '@/hooks/useUsers';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { doctorApi, labStaffApi, pharmacistApi } from '@/lib/api';
import { toast } from 'sonner';

interface CreateEditUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
  mode: 'create' | 'edit';
}

interface Role {
  id: string;
  name: string;
  description: string;
}

export default function CreateEditUserModal({ open, onOpenChange, user, mode }: CreateEditUserModalProps) {
  const { createUser, updateUser } = useUsers();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    roleId: '',
    gender: 'PREFER_NOT_TO_SAY',
  });

  const [doctorProfile, setDoctorProfile] = useState({
    specialization: '',
    licenseNumber: '',
    licenseExpiryDate: '',
    bio: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
  });

  const [pharmacistProfile, setPharmacistProfile] = useState({
    licenseNumber: '',
    licenseExpiryDate: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
  });

  const [labProfile, setLabProfile] = useState({
    licenseNumber: '',
    licenseExpiryDate: '',
    department: '',
    specialization: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
  });

  // Fetch roles
  const { data: rolesData, isLoading: rolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      try {
        const response = await apiClient.get<{ ok: boolean; data: Role[] }>('/users/roles/all');
        
        if (response.data && response.data.data) {
          return response.data.data;
        }
        
        // Check if roles are directly in response.data (no nested data property)
        if (response.data && Array.isArray(response.data)) {
          return response.data;
        }
        
        return [];
      } catch (error) {
        console.error('Error fetching roles:', error);
        return [];
      }
    },
    enabled: open, // Only fetch when modal is open
  });

  // Dashboard roles only (exclude PATIENT)
  const dashboardRoles = rolesData?.filter(role => role.name !== 'PATIENT') || [];

  const selectedRoleName = useMemo(() => {
    if (!formData.roleId || !dashboardRoles.length) return null;
    const role = dashboardRoles.find(r => r.id === formData.roleId);
    return role?.name ?? null;
  }, [formData.roleId, dashboardRoles]);

  // Populate form when editing
  useEffect(() => {
    if (mode === 'edit' && user) {
      setFormData({
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        password: '',
        roleId: user.role.id,
        gender: user.gender || 'PREFER_NOT_TO_SAY',
      });
    } else if (mode === 'create') {
      setFormData({
        name: '',
        email: '',
        phoneNumber: '',
        password: '',
        roleId: '',
        gender: 'PREFER_NOT_TO_SAY',
      });

      setDoctorProfile({
        specialization: '',
        licenseNumber: '',
        licenseExpiryDate: '',
        bio: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
      });
      setPharmacistProfile({
        licenseNumber: '',
        licenseExpiryDate: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
      });
      setLabProfile({
        licenseNumber: '',
        licenseExpiryDate: '',
        department: '',
        specialization: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
      });
    }
  }, [mode, user, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'create') {
      if (!formData.name || !formData.email || !formData.phoneNumber || !formData.password || !formData.roleId) {
        return;
      }

      // Basic validation for profile fields based on role
      if (selectedRoleName === 'DOCTOR') {
        if (
          !doctorProfile.specialization ||
          !doctorProfile.licenseNumber ||
          !doctorProfile.licenseExpiryDate ||
          !doctorProfile.emergencyContactName ||
          !doctorProfile.emergencyContactPhone
        ) {
          toast.error(
            'Please provide specialization, license number, license expiry date, and emergency contact details for the doctor profile.'
          );
          return;
        }
      } else if (selectedRoleName === 'PHARMACIST') {
        if (
          !pharmacistProfile.licenseNumber ||
          !pharmacistProfile.licenseExpiryDate ||
          !pharmacistProfile.emergencyContactName ||
          !pharmacistProfile.emergencyContactPhone
        ) {
          toast.error(
            'Please provide license number, license expiry date, and emergency contact details for the pharmacist profile.'
          );
          return;
        }
      } else if (selectedRoleName === 'LABORATORY_STAFF') {
        if (
          !labProfile.licenseNumber ||
          !labProfile.licenseExpiryDate ||
          !labProfile.department ||
          !labProfile.emergencyContactName ||
          !labProfile.emergencyContactPhone
        ) {
          toast.error(
            'Please provide license number, license expiry date, department, and emergency contact details for the lab staff profile.'
          );
          return;
        }
      }

      try {
        const result = await createUser.mutateAsync({
          name: formData.name,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          password: formData.password,
          roleId: formData.roleId,
          gender: formData.gender,
        } as any);

        const newUser = (result.data as any)?.data;

        if (newUser && selectedRoleName) {
          if (selectedRoleName === 'DOCTOR') {
            await doctorApi.createDoctor({
              userId: newUser.id,
              specialization: doctorProfile.specialization,
              licenseNumber: doctorProfile.licenseNumber,
              licenseExpiryDate: doctorProfile.licenseExpiryDate,
              bio: doctorProfile.bio || undefined,
              emergencyContactName: doctorProfile.emergencyContactName,
              emergencyContactPhone: doctorProfile.emergencyContactPhone,
              documents: [
                {
                  documentType: 'MEDICAL_LICENSE',
                  documentURL: 'N/A',
                  expiryDate: doctorProfile.licenseExpiryDate,
                },
                {
                  documentType: 'OTHER',
                  documentURL: 'N/A',
                },
              ],
            } as any);
          } else if (selectedRoleName === 'PHARMACIST') {
            await pharmacistApi.createPharmacist({
              userId: newUser.id,
              licenseNumber: pharmacistProfile.licenseNumber,
              licenseExpiryDate: pharmacistProfile.licenseExpiryDate,
              emergencyContactName: pharmacistProfile.emergencyContactName,
              emergencyContactPhone: pharmacistProfile.emergencyContactPhone,
              documents: [
                {
                  documentType: 'PHARMACY_LICENSE',
                  documentURL: 'N/A',
                  expiryDate: pharmacistProfile.licenseExpiryDate,
                },
                {
                  documentType: 'OTHER',
                  documentURL: 'N/A',
                },
              ],
            } as any);
          } else if (selectedRoleName === 'LABORATORY_STAFF') {
            await labStaffApi.createLabStaff({
              userId: newUser.id,
              licenseNumber: labProfile.licenseNumber,
              licenseExpiryDate: labProfile.licenseExpiryDate,
              department: labProfile.department,
              specialization: labProfile.specialization || undefined,
              emergencyContactName: labProfile.emergencyContactName,
              emergencyContactPhone: labProfile.emergencyContactPhone,
              documents: [
                {
                  documentType: 'LAB_LICENSE',
                  documentURL: 'N/A',
                  expiryDate: labProfile.licenseExpiryDate,
                },
                {
                  documentType: 'OTHER',
                  documentURL: 'N/A',
                },
              ],
            } as any);
          }
        }

        toast.success('User and profile created successfully');

        onOpenChange(false);
        setFormData({
          name: '',
          email: '',
          phoneNumber: '',
          password: '',
          roleId: '',
          gender: 'PREFER_NOT_TO_SAY',
        });
        setDoctorProfile({
          specialization: '',
          licenseNumber: '',
          licenseExpiryDate: '',
          bio: '',
          emergencyContactName: '',
          emergencyContactPhone: '',
        });
        setPharmacistProfile({
          licenseNumber: '',
          licenseExpiryDate: '',
          emergencyContactName: '',
          emergencyContactPhone: '',
        });
        setLabProfile({
          licenseNumber: '',
          licenseExpiryDate: '',
          department: '',
          specialization: '',
          emergencyContactName: '',
          emergencyContactPhone: '',
        });
      } catch (error: any) {
        toast.error(error?.response?.data?.message || 'Failed to create user/profile');
      }
    } else if (mode === 'edit' && user) {
      const updateData: any = {};
      if (formData.name !== user.name) updateData.name = formData.name;
      if (formData.email !== user.email) updateData.email = formData.email;
      if (formData.phoneNumber !== user.phoneNumber) updateData.phoneNumber = formData.phoneNumber;
      if (formData.gender !== user.gender) updateData.gender = formData.gender;

      if (Object.keys(updateData).length === 0) {
        onOpenChange(false);
        return;
      }

      updateUser.mutate(
        { id: user.id, data: updateData },
        {
          onSuccess: () => {
            onOpenChange(false);
          },
        }
      );
    }
  };

  const isSubmitting = createUser.isPending || updateUser.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create New User' : 'Edit User'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Name */}
            <div className='space-y-2'>
              <Label htmlFor='name'>
                Full Name <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='name'
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder='John Doe'
                required
              />
            </div>

            {/* Email */}
            <div className='space-y-2'>
              <Label htmlFor='email'>
                Email <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='email'
                type='email'
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder='john@example.com'
                required
              />
            </div>

            {/* Phone Number */}
            <div className='space-y-2'>
              <Label htmlFor='phoneNumber'>
                Phone Number <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='phoneNumber'
                value={formData.phoneNumber}
                onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder='+1234567890'
                required
              />
            </div>

            {/* Password (only for create) */}
            {mode === 'create' && (
              <div className='space-y-2'>
                <Label htmlFor='password'>
                  Password <span className='text-red-500'>*</span>
                </Label>
                <Input
                  id='password'
                  type='password'
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  placeholder='••••••••'
                  required
                  minLength={6}
                />
              </div>
            )}

            {/* Role (only for create) */}
            {mode === 'create' && (
              <div className='space-y-2'>
                <Label htmlFor='role'>
                  Role <span className='text-red-500'>*</span>
                </Label>
                <Select value={formData.roleId} onValueChange={value => setFormData({ ...formData, roleId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder='Select role' />
                  </SelectTrigger>
                  <SelectContent>
                    {rolesLoading ? (
                      <SelectItem value='loading' disabled>
                        Loading roles...
                      </SelectItem>
                    ) : dashboardRoles.length === 0 ? (
                      <SelectItem value='no-roles' disabled>
                        No roles available
                      </SelectItem>
                    ) : (
                      dashboardRoles.map(role => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Gender */}
            <div className='space-y-2'>
              <Label htmlFor='gender'>Gender</Label>
              <Select value={formData.gender} onValueChange={value => setFormData({ ...formData, gender: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='MALE'>Male</SelectItem>
                  <SelectItem value='FEMALE'>Female</SelectItem>
                  <SelectItem value='PREFER_NOT_TO_SAY'>Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Role-specific profile fields (create only) */}
          {mode === 'create' && selectedRoleName === 'DOCTOR' && (
            <div className='mt-4 border-t pt-4 space-y-3'>
              <p className='text-sm font-semibold text-gray-800'>Doctor Profile</p>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='doctorSpecialization'>
                    Specialization <span className='text-red-500'>*</span>
                  </Label>
                  <Input
                    id='doctorSpecialization'
                    value={doctorProfile.specialization}
                    onChange={e =>
                      setDoctorProfile(prev => ({ ...prev, specialization: e.target.value }))
                    }
                    placeholder='e.g., Cardiology'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='doctorLicense'>
                    License Number <span className='text-red-500'>*</span>
                  </Label>
                  <Input
                    id='doctorLicense'
                    value={doctorProfile.licenseNumber}
                    onChange={e =>
                      setDoctorProfile(prev => ({ ...prev, licenseNumber: e.target.value }))
                    }
                    placeholder='e.g., MD-12345'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='doctorLicenseExpiry'>
                    License Expiry Date <span className='text-red-500'>*</span>
                  </Label>
                  <Input
                    id='doctorLicenseExpiry'
                    type='date'
                    value={doctorProfile.licenseExpiryDate}
                    onChange={e =>
                      setDoctorProfile(prev => ({ ...prev, licenseExpiryDate: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='doctorBio'>Short Bio</Label>
                <Input
                  id='doctorBio'
                  value={doctorProfile.bio}
                  onChange={e =>
                    setDoctorProfile(prev => ({ ...prev, bio: e.target.value }))
                  }
                  placeholder='Brief professional summary (optional)'
                />
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='doctorEmergencyName'>
                    Emergency Contact Name <span className='text-red-500'>*</span>
                  </Label>
                  <Input
                    id='doctorEmergencyName'
                    value={doctorProfile.emergencyContactName}
                    onChange={e =>
                      setDoctorProfile(prev => ({ ...prev, emergencyContactName: e.target.value }))
                    }
                    placeholder='Person to contact in emergencies'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='doctorEmergencyPhone'>
                    Emergency Contact Phone <span className='text-red-500'>*</span>
                  </Label>
                  <Input
                    id='doctorEmergencyPhone'
                    value={doctorProfile.emergencyContactPhone}
                    onChange={e =>
                      setDoctorProfile(prev => ({ ...prev, emergencyContactPhone: e.target.value }))
                    }
                    placeholder='+1234567890'
                  />
                </div>
              </div>
            </div>
          )}

          {mode === 'create' && selectedRoleName === 'PHARMACIST' && (
            <div className='mt-4 border-t pt-4 space-y-3'>
              <p className='text-sm font-semibold text-gray-800'>Pharmacist Profile</p>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='pharmacistLicense'>
                    License Number <span className='text-red-500'>*</span>
                  </Label>
                  <Input
                    id='pharmacistLicense'
                    value={pharmacistProfile.licenseNumber}
                    onChange={e =>
                      setPharmacistProfile(prev => ({ ...prev, licenseNumber: e.target.value }))
                    }
                    placeholder='e.g., PH-98765'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='pharmacistLicenseExpiry'>
                    License Expiry Date <span className='text-red-500'>*</span>
                  </Label>
                  <Input
                    id='pharmacistLicenseExpiry'
                    type='date'
                    value={pharmacistProfile.licenseExpiryDate}
                    onChange={e =>
                      setPharmacistProfile(prev => ({
                        ...prev,
                        licenseExpiryDate: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='pharmacistEmergencyName'>
                    Emergency Contact Name <span className='text-red-500'>*</span>
                  </Label>
                  <Input
                    id='pharmacistEmergencyName'
                    value={pharmacistProfile.emergencyContactName}
                    onChange={e =>
                      setPharmacistProfile(prev => ({
                        ...prev,
                        emergencyContactName: e.target.value,
                      }))
                    }
                    placeholder='Person to contact in emergencies'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='pharmacistEmergencyPhone'>
                    Emergency Contact Phone <span className='text-red-500'>*</span>
                  </Label>
                  <Input
                    id='pharmacistEmergencyPhone'
                    value={pharmacistProfile.emergencyContactPhone}
                    onChange={e =>
                      setPharmacistProfile(prev => ({
                        ...prev,
                        emergencyContactPhone: e.target.value,
                      }))
                    }
                    placeholder='+1234567890'
                  />
                </div>
              </div>
            </div>
          )}

          {mode === 'create' && selectedRoleName === 'LABORATORY_STAFF' && (
            <div className='mt-4 border-t pt-4 space-y-3'>
              <p className='text-sm font-semibold text-gray-800'>Lab Staff Profile</p>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='labLicense'>
                    License Number <span className='text-red-500'>*</span>
                  </Label>
                  <Input
                    id='labLicense'
                    value={labProfile.licenseNumber}
                    onChange={e =>
                      setLabProfile(prev => ({ ...prev, licenseNumber: e.target.value }))
                    }
                    placeholder='e.g., LS-54321'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='labLicenseExpiry'>
                    License Expiry Date <span className='text-red-500'>*</span>
                  </Label>
                  <Input
                    id='labLicenseExpiry'
                    type='date'
                    value={labProfile.licenseExpiryDate}
                    onChange={e =>
                      setLabProfile(prev => ({ ...prev, licenseExpiryDate: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='labDepartment'>
                    Department <span className='text-red-500'>*</span>
                  </Label>
                  <Input
                    id='labDepartment'
                    value={labProfile.department}
                    onChange={e =>
                      setLabProfile(prev => ({ ...prev, department: e.target.value }))
                    }
                    placeholder='e.g., Hematology'
                  />
                </div>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='labSpecialization'>Specialization</Label>
                <Input
                  id='labSpecialization'
                  value={labProfile.specialization}
                  onChange={e =>
                    setLabProfile(prev => ({ ...prev, specialization: e.target.value }))
                  }
                  placeholder='e.g., Blood Analysis (optional)'
                />
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='labEmergencyName'>
                    Emergency Contact Name <span className='text-red-500'>*</span>
                  </Label>
                  <Input
                    id='labEmergencyName'
                    value={labProfile.emergencyContactName}
                    onChange={e =>
                      setLabProfile(prev => ({ ...prev, emergencyContactName: e.target.value }))
                    }
                    placeholder='Person to contact in emergencies'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='labEmergencyPhone'>
                    Emergency Contact Phone <span className='text-red-500'>*</span>
                  </Label>
                  <Input
                    id='labEmergencyPhone'
                    value={labProfile.emergencyContactPhone}
                    onChange={e =>
                      setLabProfile(prev => ({ ...prev, emergencyContactPhone: e.target.value }))
                    }
                    placeholder='+1234567890'
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={isSubmitting} className='bg-blue-900 hover:bg-blue-800'>
              {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {mode === 'create' ? 'Create User' : 'Update User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
