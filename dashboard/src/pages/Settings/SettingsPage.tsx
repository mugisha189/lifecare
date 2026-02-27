import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useSettings } from '@/hooks/useSettings';
import { toast } from 'sonner';
import { Eye, EyeOff, Upload } from 'lucide-react';
import { authApi } from '@/lib/api';

const AccountSettings = () => {
  const { userProfile, isLoading: isLoadingUser, error: profileError, updateProfile, changePassword, refetch } = useSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState('general');

  // Edit states
  const [editingName, setEditingName] = useState(false);
  const [editingGender, setEditingGender] = useState(false);
  const [editingCountry, setEditingCountry] = useState(false);
  const [editingCity, setEditingCity] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [genderValue, setGenderValue] = useState('');
  const [countryValue, setCountryValue] = useState('');
  const [cityValue, setCityValue] = useState('');
  const [uploadingPicture, setUploadingPicture] = useState(false);

  // Password change dialog
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Initialize form values when user data loads
  useEffect(() => {
    if (userProfile) {
      setNameValue(userProfile.name || '');
      setGenderValue(userProfile.gender || '');
      setCountryValue(userProfile.country || '');
      setCityValue(userProfile.city || '');
    }
  }, [userProfile]);

  const handleSaveName = () => {
    if (!nameValue.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    updateProfile.mutate(
      { name: nameValue },
      {
        onSuccess: () => {
          setEditingName(false);
        },
      }
    );
  };

  const handleSaveGender = () => {
    if (!genderValue.trim()) {
      toast.error('Gender cannot be empty');
      return;
    }
    updateProfile.mutate(
      { gender: genderValue },
      {
        onSuccess: () => {
          setEditingGender(false);
        },
      }
    );
  };

  const handleSaveCountry = () => {
    if (!countryValue.trim()) {
      toast.error('Country cannot be empty');
      return;
    }
    updateProfile.mutate(
      { country: countryValue },
      {
        onSuccess: () => {
          setEditingCountry(false);
        },
      }
    );
  };

  const handleSaveCity = () => {
    if (!cityValue.trim()) {
      toast.error('City cannot be empty');
      return;
    }
    updateProfile.mutate(
      { city: cityValue },
      {
        onSuccess: () => {
          setEditingCity(false);
        },
      }
    );
  };

  const handleProfilePictureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploadingPicture(true);
    try {
      // Convert file to base64 or FormData
      const formData = new FormData();
      formData.append('profilePicture', file);

      // Backend /auth/me PATCH accepts profilePicture URL; upload to your CDN first then call updateMe.
      // For now we only re-save name as placeholder until image upload is implemented.
      await authApi.updateMe({ name: userProfile?.name });
      toast.success('Profile picture update requires image upload integration.');
      // Refetch user data to get updated profile picture URL
      refetch();
    } catch {
      toast.error('Failed to upload profile picture');
    } finally {
      setUploadingPicture(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setShowPasswordDialog(false);
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        },
      }
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className='min-h-screen bg-white'>
      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Enter your current password and choose a new one.</DialogDescription>
          </DialogHeader>
          <div className='space-y-4 mt-4'>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Current Password</label>
              <div className='relative'>
                <Input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder='Enter current password'
                />
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  className='absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0'
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                </Button>
              </div>
            </div>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>New Password</label>
              <div className='relative'>
                <Input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder='Enter new password'
                />
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  className='absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0'
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                </Button>
              </div>
            </div>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Confirm New Password</label>
              <div className='relative'>
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder='Confirm new password'
                />
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  className='absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                </Button>
              </div>
            </div>
            <div className='flex justify-end gap-2 mt-6'>
              <Button
                variant='outline'
                onClick={() => {
                  setShowPasswordDialog(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleChangePassword}
                disabled={changePassword.isPending}
                isLoading={changePassword.isPending}
              >
                Change Password
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className='w-full max-w-[1400px] mx-auto'>
        <h1 className='text-2xl font-semibold mb-6'>Account Settings</h1>

        {profileError && (
          <div className='mb-6 rounded-lg border border-red-200 bg-red-50 p-4 flex items-center justify-between'>
            <p className='text-sm text-red-700'>{profileError}</p>
            <Button variant='outline' size='sm' onClick={() => refetch()} className='border-red-300 text-red-700 hover:bg-red-100'>
              Retry
            </Button>
          </div>
        )}

        {/* Tabs Navigation */}
        <div className='flex gap-8 border-b border-gray-200 mb-12'>
          <button
            onClick={() => setActiveTab('general')}
            className={`pb-3 text-sm font-medium transition-colors relative ${
              activeTab === 'general' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            General
            {activeTab === 'general' && <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600' />}
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`pb-3 text-sm font-medium transition-colors relative ${
              activeTab === 'security' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Security
            {activeTab === 'security' && <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600' />}
          </button>
        </div>

        {activeTab === 'general' && (
          <div className='space-y-12'>
            {/* Profile Information */}
            <div className='flex gap-16'>
              <div className='w-48 flex-shrink-0'>
                <h2 className='text-base font-semibold text-gray-900'>Profile Information</h2>
              </div>

              <div className='flex-1'>
                {/* Profile Picture */}
                <div className='flex items-center gap-4 mb-8'>
                  {isLoadingUser ? (
                    <Skeleton className='w-20 h-20 rounded-full' />
                  ) : (
                    <div className='relative'>
                      <Avatar className='w-20 h-20 bg-purple-300'>
                        <AvatarImage src={userProfile?.profilePicture || undefined} />
                        <AvatarFallback className='bg-purple-300 text-purple-900 text-xl'>
                          {userProfile ? getInitials(userProfile.name) : '👤'}
                        </AvatarFallback>
                      </Avatar>
                      <input
                        ref={fileInputRef}
                        type='file'
                        accept='image/*'
                        onChange={handleProfilePictureChange}
                        className='hidden'
                      />
                      <Button
                        variant='outline'
                        size='sm'
                        className='absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0'
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingPicture}
                      >
                        <Upload className='h-4 w-4' />
                      </Button>
                    </div>
                  )}
                  <div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className='text-sm text-primary/80 hover:underline'
                      disabled={uploadingPicture || isLoadingUser}
                    >
                      {uploadingPicture ? 'Uploading...' : 'Change Profile Picture'}
                    </button>
                    <p className='text-xs text-gray-500 mt-1'>JPG, PNG or GIF. Max size 5MB</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className='space-y-0'>
                  {/* Full Name */}
                  <div className='flex items-center justify-between py-4 border-b border-gray-200'>
                    <div className='flex-1'>
                      <div className='text-xs text-gray-500 mb-1'>Full Name</div>
                      {isLoadingUser ? (
                        <Skeleton className='h-5 w-48' />
                      ) : editingName ? (
                        <Input
                          value={nameValue}
                          onChange={e => setNameValue(e.target.value)}
                          className='max-w-xs'
                          autoFocus
                        />
                      ) : (
                        <div className='text-sm text-gray-900'>{userProfile?.name || 'N/A'}</div>
                      )}
                    </div>
                    {!isLoadingUser && (
                      <div className='flex gap-2'>
                        {editingName ? (
                          <>
                            <Button
                              variant='ghost'
                              size='sm'
                              className='text-primary/80 hover:text-primary hover:bg-transparent text-sm font-normal px-2'
                              onClick={() => {
                                setEditingName(false);
                                setNameValue(userProfile?.name || '');
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              className='text-primary/80 hover:text-primary hover:bg-transparent text-sm font-normal px-2'
                              onClick={handleSaveName}
                              disabled={updateProfile.isPending}
                            >
                              {updateProfile.isPending ? 'Saving...' : 'Save'}
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant='ghost'
                            size='sm'
                            className='text-blue-600 hover:text-blue-700 hover:bg-transparent text-sm font-normal px-2'
                            onClick={() => setEditingName(true)}
                          >
                            Edit
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Email Address */}
                  <div className='flex items-center justify-between py-4 border-b border-gray-200'>
                    <div className='flex-1'>
                      <div className='text-xs text-gray-500 mb-1'>Email Address</div>
                      {isLoadingUser ? (
                        <Skeleton className='h-5 w-64' />
                      ) : (
                        <div className='text-sm text-gray-900'>{userProfile?.email || 'N/A'}</div>
                      )}
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className='flex items-center justify-between py-4 border-b border-gray-200'>
                    <div className='flex-1'>
                      <div className='text-xs text-gray-500 mb-1'>Phone Number</div>
                      {isLoadingUser ? (
                        <Skeleton className='h-5 w-40' />
                      ) : (
                        <div className='text-sm text-gray-900'>{userProfile?.phoneNumber || 'N/A'}</div>
                      )}
                    </div>
                  </div>

                  {/* Gender */}
                  <div className='flex items-center justify-between py-4 border-b border-gray-200'>
                    <div className='flex-1'>
                      <div className='text-xs text-gray-500 mb-1'>Gender</div>
                      {isLoadingUser ? (
                        <Skeleton className='h-5 w-32' />
                      ) : editingGender ? (
                        <Select value={genderValue} onValueChange={setGenderValue}>
                          <SelectTrigger className='max-w-xs'>
                            <SelectValue placeholder='Select gender' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='MALE'>Male</SelectItem>
                            <SelectItem value='FEMALE'>Female</SelectItem>
                            <SelectItem value='PREFER_NOT_TO_SAY'>Prefer not to say</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className='text-sm text-gray-900'>{userProfile?.gender || 'N/A'}</div>
                      )}
                    </div>
                    {!isLoadingUser && (
                      <div className='flex gap-2'>
                        {editingGender ? (
                          <>
                            <Button
                              variant='ghost'
                              size='sm'
                              className='text-primary/80 hover:text-primary hover:bg-transparent text-sm font-normal px-2'
                              onClick={() => {
                                setEditingGender(false);
                                setGenderValue(userProfile?.gender || '');
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              className='text-primary/80 hover:text-primary hover:bg-transparent text-sm font-normal px-2'
                              onClick={handleSaveGender}
                              disabled={updateProfile.isPending}
                            >
                              {updateProfile.isPending ? 'Saving...' : 'Save'}
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant='ghost'
                            size='sm'
                            className='text-blue-600 hover:text-blue-700 hover:bg-transparent text-sm font-normal px-2'
                            onClick={() => setEditingGender(true)}
                          >
                            Edit
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Country */}
                  <div className='flex items-center justify-between py-4 border-b border-gray-200'>
                    <div className='flex-1'>
                      <div className='text-xs text-gray-500 mb-1'>Country</div>
                      {isLoadingUser ? (
                        <Skeleton className='h-5 w-32' />
                      ) : editingCountry ? (
                        <Input
                          value={countryValue}
                          onChange={e => setCountryValue(e.target.value)}
                          className='max-w-xs'
                          autoFocus
                          placeholder='Enter country'
                        />
                      ) : (
                        <div className='text-sm text-gray-900'>{userProfile?.country || 'N/A'}</div>
                      )}
                    </div>
                    {!isLoadingUser && (
                      <div className='flex gap-2'>
                        {editingCountry ? (
                          <>
                            <Button
                              variant='ghost'
                              size='sm'
                              className='text-primary/80 hover:text-primary hover:bg-transparent text-sm font-normal px-2'
                              onClick={() => {
                                setEditingCountry(false);
                                setCountryValue(userProfile?.country || '');
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              className='text-primary/80 hover:text-primary hover:bg-transparent text-sm font-normal px-2'
                              onClick={handleSaveCountry}
                              disabled={updateProfile.isPending}
                            >
                              {updateProfile.isPending ? 'Saving...' : 'Save'}
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant='ghost'
                            size='sm'
                            className='text-blue-600 hover:text-blue-700 hover:bg-transparent text-sm font-normal px-2'
                            onClick={() => setEditingCountry(true)}
                          >
                            Edit
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* City */}
                  <div className='flex items-center justify-between py-4 border-b border-gray-200'>
                    <div className='flex-1'>
                      <div className='text-xs text-gray-500 mb-1'>City</div>
                      {isLoadingUser ? (
                        <Skeleton className='h-5 w-32' />
                      ) : editingCity ? (
                        <Input
                          value={cityValue}
                          onChange={e => setCityValue(e.target.value)}
                          className='max-w-xs'
                          autoFocus
                          placeholder='Enter city'
                        />
                      ) : (
                        <div className='text-sm text-gray-900'>{userProfile?.city || 'N/A'}</div>
                      )}
                    </div>
                    {!isLoadingUser && (
                      <div className='flex gap-2'>
                        {editingCity ? (
                          <>
                            <Button
                              variant='ghost'
                              size='sm'
                              className='text-primary/80 hover:text-primary hover:bg-transparent text-sm font-normal px-2'
                              onClick={() => {
                                setEditingCity(false);
                                setCityValue(userProfile?.city || '');
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              className='text-primary/80 hover:text-primary hover:bg-transparent text-sm font-normal px-2'
                              onClick={handleSaveCity}
                              disabled={updateProfile.isPending}
                            >
                              {updateProfile.isPending ? 'Saving...' : 'Save'}
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant='ghost'
                            size='sm'
                            className='text-blue-600 hover:text-blue-700 hover:bg-transparent text-sm font-normal px-2'
                            onClick={() => setEditingCity(true)}
                          >
                            Edit
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Preferred Language */}
                  <div className='flex items-center justify-between py-4 border-b border-gray-200'>
                    <div className='flex-1'>
                      <div className='text-xs text-gray-500 mb-1'>Preferred Language</div>
                      {isLoadingUser ? (
                        <Skeleton className='h-5 w-24' />
                      ) : (
                        <div className='text-sm text-gray-900'>{userProfile?.preferredLanguage || 'N/A'}</div>
                      )}
                    </div>
                  </div>

                  {/* Verification Status */}
                  <div className='flex items-center justify-between py-4 border-b border-gray-200'>
                    <div className='flex-1'>
                      <div className='text-xs text-gray-500 mb-1'>Verification Status</div>
                      {isLoadingUser ? (
                        <Skeleton className='h-5 w-32' />
                      ) : (
                        <div className='text-sm text-gray-900'>{userProfile?.verificationStatus || 'N/A'}</div>
                      )}
                    </div>
                  </div>

                  {/* Email Verified */}
                  <div className='flex items-center justify-between py-4 border-b border-gray-200'>
                    <div className='flex-1'>
                      <div className='text-xs text-gray-500 mb-1'>Email Verified</div>
                      {isLoadingUser ? (
                        <Skeleton className='h-5 w-20' />
                      ) : (
                        <div className='text-sm text-gray-900'>{userProfile?.isEmailVerified ? 'Yes' : 'No'}</div>
                      )}
                    </div>
                  </div>

                  {/* Role */}
                  <div className='flex items-center justify-between py-4 border-b border-gray-200'>
                    <div className='flex-1'>
                      <div className='text-xs text-gray-500 mb-1'>Role</div>
                      {isLoadingUser ? (
                        <Skeleton className='h-5 w-32' />
                      ) : (
                        <div className='text-sm text-gray-900'>{userProfile?.role?.name || 'N/A'}</div>
                      )}
                    </div>
                  </div>

                  {/* Account Status */}
                  <div className='flex items-center justify-between py-4 border-b border-gray-200'>
                    <div className='flex-1'>
                      <div className='text-xs text-gray-500 mb-1'>Account Status</div>
                      {isLoadingUser ? (
                        <Skeleton className='h-5 w-32' />
                      ) : (
                        <div className='text-sm text-gray-900'>
                          {userProfile?.isAccountSuspended ? 'Suspended' : userProfile?.active ? 'Active' : 'Inactive'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Last Login */}
                  <div className='flex items-center justify-between py-4 border-b border-gray-200'>
                    <div className='flex-1'>
                      <div className='text-xs text-gray-500 mb-1'>Last Login</div>
                      {isLoadingUser ? (
                        <Skeleton className='h-5 w-48' />
                      ) : (
                        <div className='text-sm text-gray-900'>{formatDate(userProfile?.lastLogin || null)}</div>
                      )}
                    </div>
                  </div>

                  {/* Created At */}
                  <div className='flex items-center justify-between py-4'>
                    <div className='flex-1'>
                      <div className='text-xs text-gray-500 mb-1'>Member Since</div>
                      {isLoadingUser ? (
                        <Skeleton className='h-5 w-48' />
                      ) : (
                        <div className='text-sm text-gray-900'>{formatDate(userProfile?.createdAt || null)}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className='space-y-12'>
            {/* Change Password */}
            <div className='flex gap-16'>
              <div className='w-48 flex-shrink-0'>
                <h2 className='text-base font-semibold text-gray-900'>Change password</h2>
              </div>

              <div className='flex-1'>
                <div className='flex items-center justify-between py-4 border-b border-gray-200'>
                  <div className='flex-1'>
                    <div className='text-xs text-gray-500 mb-1'>Password</div>
                    <div className='text-sm text-gray-400'>••••••••••••</div>
                  </div>
                  <div className='flex items-center gap-3'>
                    <Button
                      variant='ghost'
                      className='text-blue-600 hover:text-blue-700 hover:bg-transparent text-sm font-normal px-2'
                      onClick={() => setShowPasswordDialog(true)}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountSettings;
