import { useState } from 'react';
import Layout from '@/components/LayoutWithNav';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pharmaciesApi, medicinesApi, type PharmacyMedicineItem } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Plus, MoreVertical, Pencil, Trash2, Package } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

export default function PharmacyInventoryPage() {
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PharmacyMedicineItem | null>(null);
  const [editQuantity, setEditQuantity] = useState('');

  const { data: inventoryRes, isLoading, error } = useQuery({
    queryKey: ['pharmacy-my-inventory'],
    queryFn: () => pharmaciesApi.getMyInventory(),
  });

  const inventory: PharmacyMedicineItem[] = Array.isArray(inventoryRes?.data?.data)
    ? inventoryRes.data.data
    : [];

  const addToInventory = useMutation({
    mutationFn: (body: { medicineId: string; quantity: number; minStockLevel?: number }) =>
      pharmaciesApi.addMyInventory(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacy-my-inventory'] });
      toast.success('Medicine added to inventory');
      setAddOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to add medicine');
    },
  });

  const updateQuantity = useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      pharmaciesApi.updateMyInventoryItem(id, { quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacy-my-inventory'] });
      toast.success('Quantity updated');
      setEditOpen(false);
      setSelectedItem(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update quantity');
    },
  });

  const removeFromInventory = useMutation({
    mutationFn: (id: string) => pharmaciesApi.removeMyInventoryItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacy-my-inventory'] });
      toast.success('Medicine removed from inventory');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to remove');
    },
  });

  const openEdit = (item: PharmacyMedicineItem) => {
    setSelectedItem(item);
    setEditQuantity(String(item.quantity));
    setEditOpen(true);
  };

  const submitEdit = () => {
    if (!selectedItem) return;
    const qty = parseInt(editQuantity, 10);
    if (isNaN(qty) || qty < 0) return;
    updateQuantity.mutate({ id: selectedItem.id, quantity: qty });
  };

  return (
    <Layout>
      <div className='bg-white rounded-lg shadow'>
        <div className='px-6 py-4 border-b flex items-center justify-between'>
          <div>
            <h2 className='text-xl font-semibold'>My Pharmacy Inventory</h2>
            <p className='text-sm text-gray-500 mt-1'>Manage medicines and stock for your pharmacy</p>
          </div>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className='w-4 h-4 mr-2' />
            Add Medicine
          </Button>
        </div>

        {error && (
          <div className='px-6 py-4 bg-red-50 border-b border-red-200 text-red-600 text-sm'>
            {(error as any)?.response?.data?.message ?? 'Failed to load inventory'}
          </div>
        )}

        <div className='px-6 py-4'>
          {isLoading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medicine</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Min level</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className='h-4 w-32' /></TableCell>
                    <TableCell><Skeleton className='h-4 w-20' /></TableCell>
                    <TableCell><Skeleton className='h-4 w-16' /></TableCell>
                    <TableCell><Skeleton className='h-4 w-16' /></TableCell>
                    <TableCell className='text-right'><Skeleton className='h-4 w-16 ml-auto' /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : inventory.length === 0 ? (
            <div className='p-12'>
              <Empty>
                <EmptyMedia>
                  <Package className='w-12 h-12 text-gray-400' />
                </EmptyMedia>
                <EmptyHeader>
                  <EmptyTitle>No inventory yet</EmptyTitle>
                  <EmptyDescription>
                    Add medicines from the catalog to your pharmacy inventory.
                  </EmptyDescription>
                </EmptyHeader>
                <Button className='mt-4' onClick={() => setAddOpen(true)}>
                  <Plus className='w-4 h-4 mr-2' />
                  Add Medicine
                </Button>
              </Empty>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medicine</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Min level</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((item) => (
                  <TableRow key={item.id} className='hover:bg-gray-50'>
                    <TableCell>
                      <div className='font-medium'>{item.medicine.name}</div>
                      {item.medicine.description && (
                        <div className='text-sm text-gray-500 truncate max-w-md'>
                          {item.medicine.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {typeof item.inventoryDate === 'string'
                        ? new Date(item.inventoryDate).toLocaleDateString()
                        : '—'}
                    </TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.minStockLevel}</TableCell>
                    <TableCell className='text-right'>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' size='sm'>
                            <MoreVertical className='w-4 h-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem onClick={() => openEdit(item)}>
                            <Pencil className='w-4 h-4 mr-2' />
                            Update quantity
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className='text-red-600'
                            onClick={() => removeFromInventory.mutate(item.id)}
                          >
                            <Trash2 className='w-4 h-4 mr-2' />
                            Remove from inventory
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

      <AddMedicineToInventoryModal
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={(body) => addToInventory.mutate(body)}
        isPending={addToInventory.isPending}
      />

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update quantity</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <>
              <p className='text-sm text-gray-600'>{selectedItem.medicine.name}</p>
              <div className='space-y-2'>
                <Label>Quantity</Label>
                <Input
                  type='number'
                  min={0}
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button variant='outline' onClick={() => setEditOpen(false)}>Cancel</Button>
                <Button
                  onClick={submitEdit}
                  disabled={updateQuantity.isPending || isNaN(parseInt(editQuantity, 10)) || parseInt(editQuantity, 10) < 0}
                >
                  {updateQuantity.isPending ? 'Saving…' : 'Save'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

interface AddMedicineToInventoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (body: { medicineId: string; quantity: number; minStockLevel?: number }) => void;
  isPending: boolean;
}

interface MedicineOption {
  id: string;
  name: string;
  description?: string;
}

function AddMedicineToInventoryModal({
  open,
  onOpenChange,
  onSubmit,
  isPending,
}: AddMedicineToInventoryModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedicineId, setSelectedMedicineId] = useState<string>('');
  const [quantity, setQuantity] = useState('0');
  const [minStockLevel, setMinStockLevel] = useState('10');

  const debouncedSearch = useDebounce(searchQuery, 500);

  const { data: medicinesRes, isLoading: searchingMedicines } = useQuery({
    queryKey: ['medicines-search', debouncedSearch],
    queryFn: () =>
      medicinesApi.getAll({
        search: debouncedSearch || undefined,
        active: true,
        limit: 50,
      }),
    enabled: open,
  });

  const payload = medicinesRes?.data as
    | { data?: { medicines?: MedicineOption[] } }
    | undefined;
  const medicines: MedicineOption[] = Array.isArray(payload?.data?.medicines)
    ? payload.data.medicines
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(quantity, 10);
    const min = parseInt(minStockLevel, 10);
    if (!selectedMedicineId || isNaN(qty) || qty < 0) return;
    onSubmit({
      medicineId: selectedMedicineId,
      quantity: qty,
      minStockLevel: isNaN(min) || min < 0 ? undefined : min,
    });
    setSelectedMedicineId('');
    setSearchQuery('');
    setQuantity('0');
    setMinStockLevel('10');
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) {
          setSearchQuery('');
          setSelectedMedicineId('');
        }
      }}
    >
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Add medicine to inventory</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label>Search medicines</Label>
            <Input
              placeholder='Search by name or description...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='mb-3'
            />
          </div>

          <div className='border rounded-lg max-h-96 overflow-y-auto'>
            {searchingMedicines ? (
              <div className='p-8 text-center text-gray-500'>
                <div className='w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3' />
                <p>Searching...</p>
              </div>
            ) : medicines.length === 0 ? (
              <div className='p-8 text-center text-gray-500'>
                <Package className='w-12 h-12 mx-auto mb-3 text-gray-300' />
                <p>
                  {searchQuery
                    ? 'No medicines found matching your search'
                    : 'Start typing to search for medicines'}
                </p>
              </div>
            ) : (
              <div className='divide-y'>
                {medicines.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMedicineId(m.id)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedMedicineId === m.id ? 'bg-green-50 border-l-4 border-green-500' : ''
                    }`}
                  >
                    <div className='flex items-center justify-between'>
                      <div className='flex-1'>
                        <p className='font-medium text-gray-900'>{m.name}</p>
                        {m.description && (
                          <p className='text-sm text-gray-600 mt-1 line-clamp-2'>{m.description}</p>
                        )}
                      </div>
                      {selectedMedicineId === m.id && (
                        <div className='w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shrink-0 ml-2'>
                          <svg
                            className='w-3 h-3 text-white'
                            fill='currentColor'
                            viewBox='0 0 20 20'
                          >
                            <path
                              fillRule='evenodd'
                              d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                              clipRule='evenodd'
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label>Quantity *</Label>
              <Input
                type='number'
                min={0}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
            <div className='space-y-2'>
              <Label>Min stock level</Label>
              <Input
                type='number'
                min={0}
                value={minStockLevel}
                onChange={(e) => setMinStockLevel(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => {
                onOpenChange(false);
                setSearchQuery('');
                setSelectedMedicineId('');
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={isPending || !selectedMedicineId || parseInt(quantity, 10) < 0}
            >
              {isPending ? 'Adding…' : 'Add to inventory'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
