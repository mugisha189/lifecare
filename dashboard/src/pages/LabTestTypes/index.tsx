import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/LayoutWithNav';
import { labTestTypesApi } from '@/lib/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { Plus, MoreVertical, Edit, Trash2, ListChecks, Loader2 } from 'lucide-react';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { useState } from 'react';
import { toast } from 'sonner';
import CreateEditLabTestTypeModal from './CreateEditLabTestTypeModal';

export interface LabTestTypeQuestion {
  id: string;
  label: string;
  type: 'TEXT' | 'NUMBER' | 'PERCENTAGE' | 'CHOICES';
  options?: string[] | null;
  order?: number;
}

export interface LabTestType {
  id: string;
  name: string;
  description?: string | null;
  questions?: LabTestTypeQuestion[];
}

export default function LabTestTypesPage() {
  const queryClient = useQueryClient();
  const [createEditOpen, setCreateEditOpen] = useState(false);
  const [typeToEdit, setTypeToEdit] = useState<LabTestType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState<LabTestType | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['lab-test-types'],
    queryFn: async () => {
      const res = await labTestTypesApi.getAll();
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => labTestTypesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-test-types'] });
      setDeleteDialogOpen(false);
      setTypeToDelete(null);
      toast.success('Lab test type deleted');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message ?? 'Failed to delete');
    },
  });

  const types: LabTestType[] = Array.isArray(data?.data) ? data.data : [];

  const handleEdit = (type: LabTestType) => {
    setTypeToEdit(type);
    setCreateEditOpen(true);
  };

  const handleDelete = (type: LabTestType) => {
    setTypeToDelete(type);
    setDeleteDialogOpen(true);
  };

  const handleCreateEditClose = (open: boolean) => {
    if (!open) setTypeToEdit(null);
    setCreateEditOpen(open);
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Lab Test Types</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Define test types and the questions lab staff must fill when completing a test.
                </p>
              </div>
              <Button onClick={() => { setTypeToEdit(null); setCreateEditOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Lab Test Type
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <div className="px-6 py-12 text-center text-red-600">
              {(error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to load lab test types'}
            </div>
          ) : types.length === 0 ? (
            <Empty className="py-16">
              <EmptyHeader>
                <EmptyMedia>
                  <ListChecks className="h-12 w-12 text-gray-400" />
                </EmptyMedia>
                <EmptyTitle>No lab test types</EmptyTitle>
                <EmptyDescription>
                  Create a lab test type so doctors can recommend it and lab staff can complete it with dynamic questions.
                </EmptyDescription>
              </EmptyHeader>
              <Button className="mt-4" onClick={() => setCreateEditOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Lab Test Type
              </Button>
            </Empty>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-xs font-medium text-gray-500 uppercase">Name</TableHead>
                    <TableHead className="text-xs font-medium text-gray-500 uppercase">Description</TableHead>
                    <TableHead className="text-xs font-medium text-gray-500 uppercase">Questions</TableHead>
                    <TableHead className="w-[80px]" />
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-200">
                  {types.map((t) => (
                    <TableRow key={t.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium text-gray-900">{t.name}</TableCell>
                      <TableCell className="text-sm text-gray-600 max-w-xs truncate">
                        {t.description || '—'}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {Array.isArray(t.questions) ? t.questions.length : 0} question(s)
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(t)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDelete(t)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      <CreateEditLabTestTypeModal
        open={createEditOpen}
        onOpenChange={handleCreateEditClose}
        type={typeToEdit}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['lab-test-types'] })}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete lab test type"
        description={
          typeToDelete
            ? `Are you sure you want to delete "${typeToDelete.name}"? Existing lab tests using this type will keep their name.`
            : ''
        }
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => typeToDelete && deleteMutation.mutate(typeToDelete.id)}
        loading={deleteMutation.isPending}
      />
    </Layout>
  );
}
