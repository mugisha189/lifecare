import { useState } from 'react';
import { ArrowLeft, Ban, Bell, CheckCircle, XCircle, FileText, Shield, RotateCcw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useUser, useUsers } from '@/hooks/useUsers';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface UserDetailsScreenProps {
  userId: string;
  onBack: () => void;
}

export default function UserDetailsScreen({ userId, onBack }: UserDetailsScreenProps) {
  const { user, loading, error, refetch } = useUser(userId);
  const { suspendUser, unsuspendUser, sendSMS } = useUsers();
  const [showBanModal, setShowBanModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');

  const handleBanUser = () => {
    if (!banReason.trim()) {
      toast.error('Please provide a reason for suspending this user');
      return;
    }
    if (!user) return;
    
    suspendUser.mutate(
      { id: user.id, reason: banReason },
      {
        onSuccess: () => {
          setShowBanModal(false);
          setBanReason('');
          refetch();
        },
      }
    );
  };

  const handleUnsuspendUser = () => {
    if (!user) return;
    
    unsuspendUser.mutate(user.id, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  const handleSendNotification = () => {
    if (!notificationMessage.trim()) {
      toast.error('Please enter a notification message');
      return;
    }
    if (!user) return;
    
    sendSMS.mutate(
      { userIds: [user.id], message: notificationMessage },
      {
        onSuccess: () => {
          setShowNotificationModal(false);
          setNotificationMessage('');
        },
      }
    );
  };

  const getDocumentStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED':
      case 'Approved':
        return 'text-green-600';
      case 'PENDING':
      case 'Pending':
        return 'text-yellow-600';
      case 'UNVERIFIED':
      case 'Rejected':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Loading state
  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 p-6'>
        <div className='mb-6'>
          <button
            onClick={onBack}
            className='flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors'
          >
            <ArrowLeft className='w-4 h-4' />
            <span>Back to Users</span>
          </button>
          <Skeleton className='h-8 w-48 mb-2' />
          <Skeleton className='h-4 w-32' />
        </div>

        <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className='h-24 w-full rounded-xl' />
          ))}
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <Skeleton className='h-96 w-full rounded-xl' />
          <Skeleton className='h-96 w-full rounded-xl' />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !user) {
    return (
      <div className='min-h-screen bg-gray-50 p-6'>
        <div className='mb-6'>
          <button
            onClick={onBack}
            className='flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors'
          >
            <ArrowLeft className='w-4 h-4' />
            <span>Back to Users</span>
          </button>
        </div>
        <Alert variant='destructive'>
          <AlertDescription>
            {error || 'User not found. Please try again.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      {/* Header */}
      <div className='mb-6'>
        <button
          onClick={onBack}
          className='flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors'
        >
          <ArrowLeft className='w-4 h-4' />
          <span>Back to Users</span>
        </button>

        <div className='flex items-center justify-between mb-2'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>User Details</h1>
            <div className='flex items-center gap-2 text-sm text-gray-500 mt-1'>
              <span>Users</span>
              <span>›</span>
              <span>Details</span>
            </div>
          </div>
          <div className='flex gap-3'>
            {user.isAccountSuspended ? (
              <Button
                onClick={handleUnsuspendUser}
                disabled={unsuspendUser.isPending}
                className='bg-green-600 hover:bg-green-700'
              >
                <RotateCcw className='w-4 h-4 mr-2' />
                <span>Unsuspend User</span>
              </Button>
            ) : (
              <Button
                onClick={() => setShowBanModal(true)}
                variant='destructive'
              >
                <Ban className='w-4 h-4 mr-2' />
                <span>Suspend User</span>
              </Button>
            )}
            <Button
              onClick={() => setShowNotificationModal(true)}
              className='bg-blue-900 hover:bg-blue-800'
            >
              <Bell className='w-4 h-4 mr-2' />
              <span>Send SMS</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className='mb-6'>
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            user.isAccountSuspended
              ? 'bg-red-100 text-red-800'
              : user.active
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {user.isAccountSuspended ? 'Suspended' : user.active ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Main Content Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Personal Information */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-100'>
          <div className='p-6 border-b border-gray-100'>
            <h2 className='text-lg font-bold text-gray-900'>Personal Information</h2>
          </div>
          <div className='p-6'>
            {/* Profile Section */}
            <div className='flex flex-col items-center mb-8'>
              <div className='w-24 h-24 bg-blue-900 rounded-full flex items-center justify-center mb-3'>
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.name}
                    className='w-full h-full rounded-full object-cover'
                  />
                ) : (
                  <span className='text-2xl font-bold text-white'>{getInitials(user.name)}</span>
                )}
              </div>
              <h3 className='text-lg font-bold text-gray-900'>{user.name}</h3>
              <p className='text-sm text-gray-500'>{user.role.name}</p>
            </div>

            {/* Information List */}
            <div className='space-y-4'>
              <div className='flex justify-between items-center py-3 border-b border-gray-100'>
                <span className='text-sm text-gray-900 font-medium'>User ID</span>
                <span className='text-sm text-gray-600'>{user.id}</span>
              </div>

              <div className='flex justify-between items-center py-3 border-b border-gray-100'>
                <span className='text-sm text-gray-900 font-medium'>Email</span>
                <span className='text-sm text-gray-600'>{user.email}</span>
              </div>

              <div className='flex justify-between items-center py-3 border-b border-gray-100'>
                <span className='text-sm text-gray-900 font-medium'>Phone Number</span>
                <span className='text-sm text-gray-600'>{user.phoneNumber}</span>
              </div>

              <div className='flex justify-between items-center py-3 border-b border-gray-100'>
                <span className='text-sm text-gray-900 font-medium'>Gender</span>
                <span className='text-sm text-gray-600'>{user.gender}</span>
              </div>

              <div className='flex justify-between items-center py-3 border-b border-gray-100'>
                <span className='text-sm text-gray-900 font-medium'>Location</span>
                <span className='text-sm text-gray-600'>
                  {user.city && user.country ? `${user.city}, ${user.country}` : user.city || user.country || 'N/A'}
                </span>
              </div>

              <div className='flex justify-between items-center py-3 border-b border-gray-100'>
                <span className='text-sm text-gray-900 font-medium'>Email Verified</span>
                <span className='text-sm text-gray-600'>{user.isEmailVerified ? 'Yes' : 'No'}</span>
              </div>

              <div className='flex justify-between items-center py-3'>
                <span className='text-sm text-gray-900 font-medium'>Verification Status</span>
                <span className={`text-sm font-medium ${getDocumentStatusColor(user.verificationStatus)}`}>
                  {user.verificationStatus}
                </span>
              </div>

              {user.lastLogin && (
                <div className='flex justify-between items-center py-3 border-t border-gray-100'>
                  <span className='text-sm text-gray-900 font-medium'>Last Login</span>
                  <span className='text-sm text-gray-600'>
                    {new Date(user.lastLogin).toLocaleDateString()} {new Date(user.lastLogin).toLocaleTimeString()}
                  </span>
                </div>
              )}

              <div className='flex justify-between items-center py-3'>
                <span className='text-sm text-gray-900 font-medium'>Member Since</span>
                <span className='text-sm text-gray-600'>{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Account Status & Actions */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-100'>
          <div className='p-6 border-b border-gray-100'>
            <h2 className='text-lg font-bold text-gray-900'>Account Status</h2>
          </div>
          <div className='p-6'>
            <div className='space-y-4'>
              <div className='p-4 bg-gray-50 rounded-xl'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <div className={`p-2 rounded-lg ${user.active ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <CheckCircle className={`w-4 h-4 ${user.active ? 'text-green-600' : 'text-gray-400'}`} />
                    </div>
                    <span className='text-sm font-medium text-gray-700'>Account Status</span>
                  </div>
                  <span
                    className={`text-sm font-semibold ${user.active ? 'text-green-600' : 'text-gray-600'}`}
                  >
                    {user.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className='p-4 bg-gray-50 rounded-xl'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <div className={`p-2 rounded-lg ${user.isAccountSuspended ? 'bg-red-100' : 'bg-green-100'}`}>
                      {user.isAccountSuspended ? (
                        <XCircle className='w-4 h-4 text-red-600' />
                      ) : (
                        <CheckCircle className='w-4 h-4 text-green-600' />
                      )}
                    </div>
                    <span className='text-sm font-medium text-gray-700'>Suspension Status</span>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      user.isAccountSuspended ? 'text-red-600' : 'text-green-600'
                    }`}
                  >
                    {user.isAccountSuspended ? 'Suspended' : 'Not Suspended'}
                  </span>
                </div>
              </div>

              <div className='p-4 bg-gray-50 rounded-xl'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <div className={`p-2 rounded-lg ${user.isEmailVerified ? 'bg-green-100' : 'bg-yellow-100'}`}>
                      {user.isEmailVerified ? (
                        <CheckCircle className='w-4 h-4 text-green-600' />
                      ) : (
                        <XCircle className='w-4 h-4 text-yellow-600' />
                      )}
                    </div>
                    <span className='text-sm font-medium text-gray-700'>Email Verification</span>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      user.isEmailVerified ? 'text-green-600' : 'text-yellow-600'
                    }`}
                  >
                    {user.isEmailVerified ? 'Verified' : 'Not Verified'}
                  </span>
                </div>
              </div>

              <div className='p-4 bg-gray-50 rounded-xl'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <div className='p-2 bg-blue-100 rounded-lg'>
                      <FileText className='w-4 h-4 text-blue-600' />
                    </div>
                    <span className='text-sm font-medium text-gray-700'>Role</span>
                  </div>
                  <span className='text-sm font-semibold text-blue-600'>{user.role.name}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ban User Modal */}
      <Dialog
        open={showBanModal}
        onOpenChange={open => {
          setShowBanModal(open);
          if (!open) setBanReason('');
        }}
      >
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <div className='flex items-center gap-3 mb-2'>
              <div className='p-2 bg-red-100 rounded-lg'>
                <Ban className='w-6 h-6 text-red-600' />
              </div>
              <DialogTitle>Suspend User</DialogTitle>
            </div>
            <DialogDescription>
              You are about to suspend <strong>{user.name}</strong>. This action will prevent them from accessing the
              platform.
            </DialogDescription>
          </DialogHeader>

          <div className='mb-4'>
            <Label htmlFor='banReason' className='block text-sm font-medium text-gray-700 mb-2'>
              Reason for Suspension <span className='text-red-500'>*</span>
            </Label>
            <Textarea
              id='banReason'
              value={banReason}
              onChange={e => setBanReason(e.target.value)}
              className='w-full'
              rows={4}
              placeholder='Enter the reason for suspending this user...'
            />
          </div>

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setShowBanModal(false);
                setBanReason('');
              }}
              disabled={suspendUser.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleBanUser} 
              className='bg-red-600 hover:bg-red-700 text-white'
              disabled={suspendUser.isPending}
            >
              {suspendUser.isPending ? 'Suspending...' : 'Confirm Suspension'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Notification Modal */}
      <Dialog
        open={showNotificationModal}
        onOpenChange={open => {
          setShowNotificationModal(open);
          if (!open) setNotificationMessage('');
        }}
      >
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <div className='flex items-center gap-3 mb-2'>
              <div className='p-2 bg-blue-100 rounded-lg'>
                <Bell className='w-6 h-6 text-blue-600' />
              </div>
              <DialogTitle>Send Notification</DialogTitle>
            </div>
            <DialogDescription>
              Send a notification to <strong>{user.name}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className='mb-4'>
            <Label htmlFor='notificationMessage' className='block text-sm font-medium text-gray-700 mb-2'>
              Message <span className='text-red-500'>*</span>
            </Label>
            <Textarea
              id='notificationMessage'
              value={notificationMessage}
              onChange={e => setNotificationMessage(e.target.value)}
              className='w-full'
              rows={4}
              placeholder='Type your notification message here...'
            />
          </div>

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setShowNotificationModal(false);
                setNotificationMessage('');
              }}
              disabled={sendSMS.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSendNotification} 
              className='bg-blue-600 hover:bg-blue-700 text-white'
              disabled={sendSMS.isPending}
            >
              {sendSMS.isPending ? 'Sending...' : 'Send SMS'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}