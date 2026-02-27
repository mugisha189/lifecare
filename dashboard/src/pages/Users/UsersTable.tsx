import { useState, useEffect, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { format } from 'date-fns';
import { useUsers, type User } from '@/hooks/useUsers';
import {
  Eye,
  Loader2,
  Users,
  MoreVertical,
  Trash2,
  Download,
  MessageSquare,
  SlidersHorizontal,
  Power,
  XCircle,
  X,
  RotateCcw,
  Plus,
  Edit,
} from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import CreateEditUserModal from './CreateEditUserModal';

const ITEMS_PER_PAGE = 10;

interface UsersTableProps {
  onViewUser?: (userId: string) => void;
}

export default function UsersTable({ onViewUser }: UsersTableProps) {
  const { users, loading, error, deleteUser, activateUser, sendSMS } = useUsers();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showSMSModal, setShowSMSModal] = useState(false);
  const [smsMessage, setSmsMessage] = useState('');
  const [selectedUserForSMS, setSelectedUserForSMS] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);
  const [userToActivate, setUserToActivate] = useState<User | null>(null);
  const [createEditModalOpen, setCreateEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  // Filter and search users
  // Dashboard is for ADMIN, DOCTOR, PHARMACIST, LABORATORY_STAFF only (not PATIENT)
  const filteredUsers = useMemo(() => {
    // First, exclude PATIENT role users since dashboard is not for patients
    let filtered = users.filter(u => u.role.name !== 'PATIENT');

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        u =>
          u.name.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query) ||
          u.phoneNumber.includes(query) ||
          u.id.toLowerCase().includes(query)
      );
    }

    // Status filter (active/inactive)
    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        filtered = filtered.filter(u => u.active);
      } else if (statusFilter === 'inactive') {
        filtered = filtered.filter(u => !u.active);
      } else if (statusFilter === 'suspended') {
        filtered = filtered.filter(u => u.isAccountSuspended);
      }
    }

    // Role filter (only for dashboard roles: ADMIN, DOCTOR, PHARMACIST, LABORATORY_STAFF)
    if (roleFilter !== 'all') {
      filtered = filtered.filter(u => u.role.name === roleFilter);
    }

    // Gender filter
    if (genderFilter !== 'all') {
      filtered = filtered.filter(u => u.gender === genderFilter);
    }

    // Verification filter
    if (verificationFilter !== 'all') {
      filtered = filtered.filter(u => u.verificationStatus === verificationFilter);
    }

    return filtered;
  }, [users, searchQuery, statusFilter, roleFilter, genderFilter, verificationFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, roleFilter, genderFilter, verificationFilter]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setRoleFilter('all');
    setGenderFilter('all');
    setVerificationFilter('all');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleViewUser = (user: User) => {
    if (onViewUser) {
      onViewUser(user.id);
    }
  };

  const handleCreateUser = () => {
    setModalMode('create');
    setUserToEdit(null);
    setCreateEditModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setModalMode('edit');
    setUserToEdit(user);
    setCreateEditModalOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!userToDelete) return;
    deleteUser.mutate(userToDelete.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setUserToDelete(null);
      },
    });
  };

  const handleActivateDeactivate = (user: User) => {
    setUserToActivate(user);
    setActivateDialogOpen(true);
  };

  const handleActivateDeactivateConfirm = () => {
    if (!userToActivate) return;
    activateUser.mutate(
      { id: userToActivate.id, active: !userToActivate.active },
      {
        onSuccess: () => {
          setActivateDialogOpen(false);
          setUserToActivate(null);
        },
      }
    );
  };

  const handleSendSMSClick = (user: User) => {
    setSelectedUserForSMS(user);
    setShowSMSModal(true);
  };

  const handleSendSMS = () => {
    if (!selectedUserForSMS || !smsMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    sendSMS.mutate(
      { userIds: [selectedUserForSMS.id], message: smsMessage },
      {
        onSuccess: () => {
          setShowSMSModal(false);
          setSmsMessage('');
          setSelectedUserForSMS(null);
        },
      }
    );
  };

  const handleExport = () => {
    if (filteredUsers.length === 0) {
      toast.error('No users to export');
      return;
    }

    const headers = [
      'Name',
      'Email',
      'Phone Number',
      'Role',
      'Gender',
      'Country',
      'City',
      'Verification Status',
      'Active',
      'Created At',
    ];
    const csvContent = [
      headers.join(','),
      ...filteredUsers.map(u =>
        [
          `"${u.name}"`,
          `"${u.email}"`,
          `"${u.phoneNumber}"`,
          `"${u.role.name}"`,
          `"${u.gender}"`,
          `"${u.country || ''}"`,
          `"${u.city || ''}"`,
          `"${u.verificationStatus}"`,
          u.active ? 'Yes' : 'No',
          `"${format(new Date(u.createdAt), 'yyyy-MM-dd HH:mm:ss')}"`,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Users exported successfully');
  };

  const getStatusVariant = (active: boolean, suspended: boolean) => {
    if (suspended) return 'destructive';
    if (active) return 'default';
    return 'secondary';
  };

  const getStatusColor = (active: boolean, suspended: boolean) => {
    if (suspended) return 'bg-red-200 text-red-800';
    if (active) return 'bg-green-200 text-green-800';
    return 'bg-gray-200 text-gray-800';
  };

  const getStatusText = (active: boolean, suspended: boolean) => {
    if (suspended) return 'Suspended';
    if (active) return 'Active';
    return 'Inactive';
  };

  const getVerificationColor = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return 'bg-green-200 text-green-800';
      case 'UNVERIFIED':
        return 'bg-red-200 text-red-800';
      case 'PENDING':
        return 'bg-yellow-200 text-yellow-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'yyyy-MM-dd hh:mm a');
    } catch {
      return dateStr;
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

  const hasActiveFilters =
    searchQuery !== '' ||
    statusFilter !== 'all' ||
    roleFilter !== 'all' ||
    genderFilter !== 'all' ||
    verificationFilter !== 'all';

  // Get unique roles from users (exclude PATIENT - dashboard is not for patients)
  const uniqueRoles = useMemo(() => {
    const dashboardRoles = ['ADMIN', 'DOCTOR', 'PHARMACIST', 'LABORATORY_STAFF'];
    const roles = new Set(
      users
        .filter(u => dashboardRoles.includes(u.role.name))
        .map(u => u.role.name)
    );
    return Array.from(roles).sort();
  }, [users]);

  return (
    <>
      <div className='bg-white rounded-lg shadow'>
        <div className='px-6 py-4 border-b'>
          <div className='flex items-center justify-between mb-4'>
            <div>
              <h2 className='text-xl font-semibold'>All Users</h2>
              <p className='text-sm text-gray-500 mt-1'>Manage and view all registered users</p>
            </div>
            <div className='flex items-center gap-3'>
              <Button
                onClick={handleCreateUser}
                className='bg-green-600 hover:bg-green-700'
              >
                <Plus className='w-4 h-4' />
                Create User
              </Button>
              <Button
                onClick={handleExport}
                disabled={loading || filteredUsers.length === 0}
                className='bg-blue-900 hover:bg-blue-800'
              >
                <Download className='w-4 h-4' />
                Export
              </Button>
              {hasActiveFilters && (
                <Button onClick={handleResetFilters} variant='outline' className='text-gray-600 hover:text-gray-900'>
                  <RotateCcw className='w-4 h-4' />
                  Reset Filters
                </Button>
              )}
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant={showFilters ? 'default' : 'outline'}
                className={showFilters ? 'bg-blue-900 hover:bg-blue-800 text-white' : ''}
              >
                {showFilters ? (
                  <>
                    <X className='w-4 h-4' />
                    Close Filters
                  </>
                ) : (
                  <>
                    <SlidersHorizontal className='w-4 h-4' />
                    Filter
                    {hasActiveFilters && (
                      <span className='bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full ml-2'>Active</span>
                    )}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-4 border-t border-gray-200'>
              <div>
                <Label className='text-xs'>Search</Label>
                <Input
                  type='text'
                  placeholder='Name, email, phone...'
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
                    <SelectItem value='suspended'>Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className='text-xs'>Role</Label>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className='mt-1 w-full'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Roles</SelectItem>
                    {uniqueRoles.map(role => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className='text-xs'>Gender</Label>
                <Select value={genderFilter} onValueChange={setGenderFilter}>
                  <SelectTrigger className='mt-1 w-full'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Genders</SelectItem>
                    <SelectItem value='MALE'>Male</SelectItem>
                    <SelectItem value='FEMALE'>Female</SelectItem>
                    <SelectItem value='PREFER_NOT_TO_SAY'>Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className='text-xs'>Verification</Label>
                <Select value={verificationFilter} onValueChange={setVerificationFilter}>
                  <SelectTrigger className='mt-1 w-full'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All</SelectItem>
                    <SelectItem value='VERIFIED'>Verified</SelectItem>
                    <SelectItem value='UNVERIFIED'>Unverified</SelectItem>
                    <SelectItem value='PENDING'>Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        <div className='px-6 py-4'>
          <div className='border rounded-lg overflow-hidden'>
            {loading ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Verification</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className='flex items-center gap-3'>
                          <Skeleton className='h-10 w-10 rounded-full' />
                          <Skeleton className='h-4 w-32' />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className='h-4 w-40' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='h-4 w-28' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='h-4 w-20' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='h-4 w-16' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='h-5 w-24 rounded-full' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='h-5 w-20 rounded-full' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='h-4 w-28' />
                      </TableCell>
                      <TableCell className='text-right'>
                        <Skeleton className='h-8 w-8 ml-auto' />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : error ? (
              <Empty className='border-0 h-64'>
                <EmptyHeader>
                  <EmptyMedia variant='icon'>
                    <Users />
                  </EmptyMedia>
                  <EmptyTitle>Error Loading Users</EmptyTitle>
                  <EmptyDescription>{error}. Please try refreshing the page.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : currentUsers.length === 0 ? (
              <Empty className='border-0 h-64'>
                <EmptyHeader>
                  <EmptyMedia variant='icon'>
                    <Users />
                  </EmptyMedia>
                  <EmptyTitle>{hasActiveFilters ? 'No Users Match Filters' : 'No Users Found'}</EmptyTitle>
                  <EmptyDescription>
                    {hasActiveFilters
                      ? 'Try adjusting your filters to see more results.'
                      : 'There are no users registered yet. Users will appear here once they register.'}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Verification</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentUsers.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className='flex items-center gap-3'>
                          <Avatar>
                            {user.profilePicture ? <AvatarImage src={user.profilePicture} alt={user.name} /> : null}
                            <AvatarFallback className='bg-primary text-white'>{getInitials(user.name)}</AvatarFallback>
                          </Avatar>
                          <span className='text-sm font-medium text-gray-900'>{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className='text-sm text-gray-600'>{user.email}</TableCell>
                      <TableCell className='text-sm text-gray-600'>{user.phoneNumber}</TableCell>
                      <TableCell className='text-sm text-gray-600'>{user.role.name}</TableCell>
                      <TableCell className='text-sm text-gray-600'>{user.gender}</TableCell>
                      <TableCell>
                        <Badge className={getVerificationColor(user.verificationStatus)}>
                          {user.verificationStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusVariant(user.active, user.isAccountSuspended)}
                          className={getStatusColor(user.active, user.isAccountSuspended)}
                        >
                          {getStatusText(user.active, user.isAccountSuspended)}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-sm text-gray-600'>{formatDate(user.createdAt)}</TableCell>
                      <TableCell className='text-right'>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                              <MoreVertical className='h-4 w-4' />
                              <span className='sr-only'>Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuItem onClick={() => handleViewUser(user)}>
                              <Eye className='h-4 w-4' />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              <Edit className='h-4 w-4' />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSendSMSClick(user)}>
                              <MessageSquare className='h-4 w-4' />
                              Send SMS
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleActivateDeactivate(user)}
                              disabled={activateUser.isPending}
                            >
                              {activateUser.isPending ? (
                                <Loader2 className='mr-1 h-4 w-4 animate-spin' />
                              ) : user.active ? (
                                <XCircle className='mr-1 h-4 w-4' />
                              ) : (
                                <Power className='mr-1 h-4 w-4' />
                              )}
                              {user.active ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className='text-red-600'
                              onClick={() => handleDeleteClick(user)}
                              disabled={deleteUser.isPending}
                            >
                              {deleteUser.isPending ? (
                                <Loader2 className='mr-1 h-4 w-4 animate-spin text-red-600' />
                              ) : (
                                <Trash2 className='mr-1 h-4 w-4 text-red-600' />
                              )}
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

        {/* Footer: Pagination & Records Info */}
        <div className='px-6 py-4 border-t'>
          <div className='flex justify-between items-center'>
            <div className='flex items-center gap-2'>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={value => {
                  setItemsPerPage(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className='w-[70px]'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='10'>10</SelectItem>
                  <SelectItem value='20'>20</SelectItem>
                  <SelectItem value='50'>50</SelectItem>
                </SelectContent>
              </Select>
              <span className='text-sm text-gray-500 ml-2'>
                Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredUsers.length)} of{' '}
                {filteredUsers.length} users
                {hasActiveFilters && ' (filtered)'}
              </span>
            </div>

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>

                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i + 1}>
                    <PaginationLink
                      onClick={() => handlePageChange(i + 1)}
                      isActive={currentPage === i + 1}
                      className={`cursor-pointer ${currentPage === i + 1 ? 'font-bold' : 'font-normal'}`}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>

      {/* Send SMS Dialog */}
      <Dialog open={showSMSModal} onOpenChange={setShowSMSModal}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Send SMS</DialogTitle>
          </DialogHeader>

          <div className='space-y-4'>
            <div>
              <Label className='text-sm font-medium'>To:</Label>
              <div className='mt-1 p-2 bg-gray-50 rounded-lg'>
                <div className='flex items-center gap-2'>
                  {selectedUserForSMS && (
                    <>
                      <Avatar className='h-8 w-8'>
                        {selectedUserForSMS.profilePicture ? (
                          <AvatarImage src={selectedUserForSMS.profilePicture} alt={selectedUserForSMS.name} />
                        ) : null}
                        <AvatarFallback className='bg-primary text-white text-xs'>
                          {getInitials(selectedUserForSMS.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className='text-sm font-medium'>{selectedUserForSMS.name}</div>
                        <div className='text-xs text-gray-500'>{selectedUserForSMS.phoneNumber}</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor='smsMessage' className='text-sm font-medium'>
                Message:
              </Label>
              <textarea
                id='smsMessage'
                value={smsMessage}
                onChange={e => setSmsMessage(e.target.value)}
                className='w-full border border-gray-300 rounded-lg p-2 text-sm mt-1 resize-none'
                rows={4}
                placeholder='Type your message here...'
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setShowSMSModal(false);
                setSmsMessage('');
                setSelectedUserForSMS(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSendSMS} className='bg-blue-900 hover:bg-blue-800' disabled={!smsMessage.trim()}>
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={open => {
          setDeleteDialogOpen(open);
          if (!open) {
            setUserToDelete(null);
          }
        }}
        onConfirm={handleDeleteConfirm}
        title='Delete User'
        description={
          userToDelete ? `Are you sure you want to delete ${userToDelete.name}? This action cannot be undone.` : ''
        }
        confirmText='Delete'
        cancelText='Cancel'
        variant='destructive'
        icon={<Trash2 className='h-5 w-5 text-red-600' />}
        isLoading={deleteUser.isPending}
      />

      {/* Activate/Deactivate Confirmation Dialog */}
      <ConfirmDialog
        open={activateDialogOpen}
        onOpenChange={open => {
          setActivateDialogOpen(open);
          if (!open) {
            setUserToActivate(null);
          }
        }}
        onConfirm={handleActivateDeactivateConfirm}
        title={userToActivate ? (userToActivate.active ? 'Deactivate User' : 'Activate User') : ''}
        description={
          userToActivate
            ? `Are you sure you want to ${userToActivate.active ? 'deactivate' : 'activate'} ${userToActivate.name}?`
            : ''
        }
        confirmText={userToActivate ? (userToActivate.active ? 'Deactivate' : 'Activate') : 'Confirm'}
        cancelText='Cancel'
        variant={userToActivate?.active ? 'warning' : 'success'}
        icon={
          userToActivate ? (
            userToActivate.active ? (
              <XCircle className='h-5 w-5 text-orange-600' />
            ) : (
              <Power className='h-5 w-5 text-green-600' />
            )
          ) : null
        }
        isLoading={activateUser.isPending}
      />

      {/* Create/Edit User Modal */}
      <CreateEditUserModal
        open={createEditModalOpen}
        onOpenChange={setCreateEditModalOpen}
        user={userToEdit}
        mode={modalMode}
      />
    </>
  );
}
