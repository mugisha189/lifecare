import { useState, useEffect, useMemo } from 'react';
import Layout from '@/components/LayoutWithNav';
import { useDoctorsManagement } from '@/hooks/useDoctorProfiles';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { 
  SlidersHorizontal, Search, RotateCcw, X, MoreVertical, Eye, Trash2, Users, AlertTriangle 
} from 'lucide-react';

const ITEMS_PER_PAGE = 10;
type DoctorStatusFilter = 'active' | 'suspended' | 'inactive' | 'all';

export default function DoctorProfilesPage() {
  const {
    doctors, loading, isUpdating, searchQuery, setSearchQuery, statusFilter, setStatusFilter,
    showFilters, setShowFilters, selectedDoctor, setSelectedDoctor, handleAction, updateDoctor, resetFilters, pagination
  } = useDoctorsManagement();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSuspending, setIsSuspending] = useState(false);
  const [suspensionReason, setSuspensionReason] = useState("");
  const [editForm, setEditForm] = useState({ name: '', phoneNumber: '', city: '' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Pagination Logic
  const totalPages = pagination?.totalPages || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentDoctors = useMemo(() => doctors.slice(startIndex, startIndex + itemsPerPage), [doctors, startIndex, itemsPerPage]);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilter]);

  useEffect(() => {
    if (selectedDoctor) {
      setEditForm({ name: selectedDoctor.name, phoneNumber: selectedDoctor.phoneNumber, city: selectedDoctor.city });
    } else {
      setIsEditMode(false);
      setIsSuspending(false);
      setSuspensionReason("");
    }
  }, [selectedDoctor]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??';

  return (
    <Layout>
      <div className='min-h-screen bg-white p-6'>
        <div className='max-w-7xl mx-auto'>
          {/* Header */}
          <div className='mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4'>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>Doctor Profiles</h1>
              <p className='text-sm text-gray-500 mt-1'>Manage doctor accounts, licenses, and verification statuses</p>
            </div>
            <div className="flex items-center gap-2">
              {(searchQuery || statusFilter !== 'all') && (
                <Button onClick={resetFilters} variant="ghost" size="sm" className="text-gray-500 hover:text-primary">
                  <RotateCcw className="w-4 h-4 mr-2" /> Reset
                </Button>
              )}
              <Button onClick={() => setShowFilters(!showFilters)} variant={showFilters ? 'default' : 'outline'} className={showFilters ? 'bg-primary text-white' : ''}>
                <SlidersHorizontal className="w-4 h-4 mr-2" /> {showFilters ? 'Close Filters' : 'Filter'}
              </Button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-1">
              <div className="space-y-1.5">
                <Label className='text-xs font-semibold'>Search Doctors</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                    placeholder="Search name, phone, or license number..." 
                    className="pl-10 bg-white" 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className='text-xs font-semibold'>Status</Label>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as DoctorStatusFilter)}>
                  <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Table */}
          <div className='bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm'>
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="py-4">Doctor</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className='h-10 w-40' /></TableCell>
                      <TableCell><Skeleton className='h-4 w-24' /></TableCell>
                      <TableCell><Skeleton className='h-6 w-16 rounded-full' /></TableCell>
                      <TableCell className='text-right'><Skeleton className='h-8 w-8 ml-auto' /></TableCell>
                    </TableRow>
                  ))
                ) : currentDoctors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-80">
                      <Empty className="border-0 shadow-none bg-transparent">
                        <EmptyHeader>
                          <EmptyMedia variant="icon"><Users className="w-12 h-12 text-gray-300" /></EmptyMedia>
                          <EmptyTitle>No matching doctors</EmptyTitle>
                          <EmptyDescription>Adjust your filters or search query to find doctors.</EmptyDescription>
                        </EmptyHeader>
                      </Empty>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentDoctors.map(doctor => (
                    <TableRow key={doctor.id} className="hover:bg-gray-50/50 transition-colors">
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-blue-50 rounded-full flex items-center justify-center text-primary font-bold text-xs">{getInitials(doctor.name)}</div>
                          <div className="font-semibold text-gray-900">{doctor.name}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{doctor.city || 'Kigali'}</TableCell>
                      <TableCell>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${doctor.isSuspended ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                          {doctor.isSuspended ? 'Suspended' : 'Active'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedDoctor(doctor)}><Eye className="mr-2 h-4 w-4" /> View Details</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => { setSelectedDoctor(doctor); setDeleteDialogOpen(true); }}><Trash2 className="mr-2 h-4 w-4" /> Delete Account</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Footer */}
          {!loading && doctors.length > 0 && (
            <div className='px-6 py-4 border-t flex flex-col sm:flex-row justify-between items-center gap-4'>
              <div className='flex items-center gap-2'>
                <Select value={itemsPerPage.toString()} onValueChange={v => {setItemsPerPage(Number(v)); setCurrentPage(1);}}>
                  <SelectTrigger className='w-[70px] h-8'><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value='10'>10</SelectItem><SelectItem value='20'>20</SelectItem></SelectContent>
                </Select>
                <span className='text-xs text-gray-500'>Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, doctors.length)} of {doctors.length} doctors</span>
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem><PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} className={currentPage === 1 ? 'opacity-30 pointer-events-none' : 'cursor-pointer'} /></PaginationItem>
                  <PaginationItem><span className="text-sm px-4 font-medium">Page {currentPage} of {totalPages}</span></PaginationItem>
                  <PaginationItem><PaginationNext onClick={() => handlePageChange(currentPage + 1)} className={currentPage === totalPages ? 'opacity-30 pointer-events-none' : 'cursor-pointer'} /></PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>

      {/* Doctor Detail Modal */}
      {selectedDoctor && !deleteDialogOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`bg-white rounded-3xl shadow-2xl max-w-xl w-full p-8 relative animate-in zoom-in-95 duration-200 border-t-8 ${isSuspending ? 'border-red-500/70' : 'border-primary'}`}>
            <button onClick={() => setSelectedDoctor(null)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 transition-colors"><X className="w-5 h-5" /></button>
            
            {isSuspending ? (
              <div className="space-y-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-4">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Suspend {selectedDoctor.name}</h2>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-gray-400">Suspension Reason</Label>
                  <textarea 
                    className="w-full min-h-[100px] p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none"
                    placeholder="Provide a detailed reason..."
                    value={suspensionReason}
                    onChange={(e) => setSuspensionReason(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <Button className="w-full py-6 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl" disabled={!suspensionReason.trim() || isUpdating} onClick={() => handleAction('suspend', selectedDoctor.id, suspensionReason)}>Confirm Suspension</Button>
                  <Button variant="ghost" onClick={() => setIsSuspending(false)}>Back to Profile</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center text-white text-3xl font-bold mb-4">
                    {getInitials(isEditMode ? editForm.name : selectedDoctor.name)}
                  </div>
                  {isEditMode ? (
                    <Input className="text-center text-xl font-bold h-auto py-1" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                  ) : (
                    <h2 className="text-2xl font-bold text-gray-900">{selectedDoctor.name}</h2>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-6 rounded-2xl">
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-gray-400">Phone</Label>
                    {isEditMode ? <Input value={editForm.phoneNumber} onChange={e => setEditForm({...editForm, phoneNumber: e.target.value})} /> : <p className="text-sm font-semibold">{selectedDoctor.phoneNumber}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-gray-400">City</Label>
                    {isEditMode ? <Input value={editForm.city} onChange={e => setEditForm({...editForm, city: e.target.value})} /> : <p className="text-sm font-semibold">{selectedDoctor.city}</p>}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {isEditMode ? (
                    <div className="flex gap-2">
                      <Button onClick={() => updateDoctor(selectedDoctor.id, editForm)} className="flex-1 bg-primary text-white rounded-2xl" disabled={isUpdating}>Save Changes</Button>
                      <Button variant="outline" className="rounded-2xl" onClick={() => setIsEditMode(false)}>Cancel</Button>
                    </div>
                  ) : (
                    <>
                      <Button 
                        onClick={() => selectedDoctor.isSuspended ? handleAction('activate', selectedDoctor.id) : setIsSuspending(true)}
                        variant={selectedDoctor.isSuspended ? "default" : "destructive"}
                        className={`w-full py-6 rounded-2xl font-bold ${selectedDoctor.isSuspended ? "bg-green-600 hover:bg-green-700" : ""}`}
                      >
                        {selectedDoctor.isSuspended ? 'Unsuspend Account' : 'Suspend Account'}
                      </Button>
                      <Button variant="outline" className="w-full rounded-2xl" onClick={() => setIsEditMode(true)}>Edit Profile</Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => { setDeleteDialogOpen(open); if(!open) setSelectedDoctor(null); }}
        onConfirm={async () => {
          if (selectedDoctor) await handleAction('delete', selectedDoctor.id);
        }}
        title="Delete Doctor Record"
        description="Permanently remove this doctor? This action cannot be undone."
        variant="destructive"
      />
    </Layout>
  );
}
