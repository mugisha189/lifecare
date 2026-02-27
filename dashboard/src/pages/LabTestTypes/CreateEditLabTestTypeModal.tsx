import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, ChevronRight, ChevronLeft, Plus, Edit, Trash2 } from 'lucide-react';
import { labTestTypesApi } from '@/lib/api';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import type { LabTestType, LabTestTypeQuestion } from './index';

const QUESTION_TYPES = [
  { value: 'TEXT', label: 'Text' },
  { value: 'NUMBER', label: 'Number' },
  { value: 'PERCENTAGE', label: 'Percentage' },
  { value: 'CHOICES', label: 'Choices' },
] as const;

interface CreateEditLabTestTypeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: LabTestType | null;
  onSuccess: () => void;
}

export default function CreateEditLabTestTypeModal({
  open,
  onOpenChange,
  type,
  onSuccess,
}: CreateEditLabTestTypeModalProps) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [deleteQuestionId, setDeleteQuestionId] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<LabTestTypeQuestion | null>(null);
  const [addForm, setAddForm] = useState({ label: '', type: 'TEXT' as const, options: '' });
  const [createdTypeId, setCreatedTypeId] = useState<string | null>(null);

  const typeId = type?.id ?? createdTypeId;

  const { data: typeData, isLoading: typeLoading } = useQuery({
    queryKey: ['lab-test-types', typeId],
    queryFn: async () => {
      const res = await labTestTypesApi.getOne(typeId!);
      return res.data;
    },
    enabled: open && step === 2 && !!typeId,
  });

  const typeFromApi = typeData?.data as LabTestType | undefined;
  const questions: LabTestTypeQuestion[] = Array.isArray(typeFromApi?.questions)
    ? typeFromApi.questions
    : type && Array.isArray(type.questions)
      ? type.questions
      : [];

  const resetStepOne = useCallback(() => {
    setName('');
    setDescription('');
    setStep(1);
    setCreatedTypeId(null);
  }, []);

  useEffect(() => {
    if (open) {
      if (type) {
        setName(type.name);
        setDescription(type.description ?? '');
        setCreatedTypeId(null);
        setStep(1);
      } else {
        resetStepOne();
      }
      setEditingQuestion(null);
      setAddForm({ label: '', type: 'TEXT', options: '' });
      setDeleteQuestionId(null);
    }
  }, [open, type, resetStepOne]);

  const createMutation = useMutation({
    mutationFn: (data: { name: string; description?: string }) => labTestTypesApi.create(data),
    onSuccess: (res) => {
      const id = (res.data as { data?: { id?: string } })?.data?.id;
      if (id) setCreatedTypeId(id);
      queryClient.invalidateQueries({ queryKey: ['lab-test-types'] });
      setStep(2);
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message ?? 'Failed to create');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { name?: string; description?: string }) =>
      type ? labTestTypesApi.update(type.id, data) : Promise.reject(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-test-types'] });
      queryClient.invalidateQueries({ queryKey: ['lab-test-types', type?.id] });
      setStep(2);
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message ?? 'Failed to update');
    },
  });

  const addQuestionMutation = useMutation({
    mutationFn: (payload: { label: string; type: string; options?: string[] }) =>
      labTestTypesApi.addQuestion(typeId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-test-types'] });
      queryClient.invalidateQueries({ queryKey: ['lab-test-types', typeId] });
      setAddForm({ label: '', type: 'TEXT', options: '' });
      toast.success('Question added');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message ?? 'Failed to add question');
    },
  });

  const updateQuestionMutation = useMutation({
    mutationFn: (payload: { label?: string; type?: string; options?: string[] }) =>
      editingQuestion && typeId
        ? labTestTypesApi.updateQuestion(typeId, editingQuestion.id, payload)
        : Promise.reject(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-test-types'] });
      queryClient.invalidateQueries({ queryKey: ['lab-test-types', typeId] });
      setEditingQuestion(null);
      toast.success('Question updated');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message ?? 'Failed to update question');
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: (qId: string) => labTestTypesApi.deleteQuestion(typeId!, qId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-test-types'] });
      queryClient.invalidateQueries({ queryKey: ['lab-test-types', typeId] });
      setDeleteQuestionId(null);
      toast.success('Question removed');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message ?? 'Failed to remove question');
    },
  });

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error('Name is required');
      return;
    }
    const desc = description.trim() || undefined;
    if (type) {
      updateMutation.mutate({ name: trimmedName, description: desc });
    } else {
      createMutation.mutate({ name: trimmedName, description: desc });
    }
  };

  const handleDone = () => {
    if (!type && createdTypeId) {
      toast.success('Lab test type created');
    } else if (type) {
      toast.success('Lab test type updated');
    }
    onSuccess();
    onOpenChange(false);
    resetStepOne();
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    const label = addForm.label.trim();
    if (!label) {
      toast.error('Question label is required');
      return;
    }
    const options =
      addForm.type === 'CHOICES' && addForm.options.trim()
        ? addForm.options.split(',').map((s) => s.trim()).filter(Boolean)
        : undefined;
    addQuestionMutation.mutate({ label, type: addForm.type, options });
  };

  const handleUpdateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;
    const label = addForm.label.trim();
    if (!label) {
      toast.error('Question label is required');
      return;
    }
    const options =
      addForm.type === 'CHOICES' && addForm.options.trim()
        ? addForm.options.split(',').map((s) => s.trim()).filter(Boolean)
        : undefined;
    updateQuestionMutation.mutate({ label, type: addForm.type, options });
  };

  const startEditQuestion = (q: LabTestTypeQuestion) => {
    setEditingQuestion(q);
    setAddForm({
      label: q.label,
      type: q.type,
      options: Array.isArray(q.options) ? q.options.join(', ') : '',
    });
  };

  const cancelEdit = () => {
    setEditingQuestion(null);
    setAddForm({ label: '', type: 'TEXT', options: '' });
  };

  const handleClose = (next: boolean) => {
    if (!next) {
      resetStepOne();
      setEditingQuestion(null);
      setAddForm({ label: '', type: 'TEXT', options: '' });
    }
    onOpenChange(next);
  };

  const isCreate = !type;
  const effectiveTypeId = type?.id ?? createdTypeId;
  const canShowStep2 = !!effectiveTypeId;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 1 && (type ? 'Edit Lab Test Type' : 'Add Lab Test Type')}
            {step === 2 && (type ? 'Edit questions' : 'Add questions')}
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <form onSubmit={handleStep1Next} className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="e.g. Complete Blood Count"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the test"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-1 resize-none"
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => handleClose(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!name.trim() || createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                )}
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </DialogFooter>
          </form>
        )}

        {step === 2 && canShowStep2 && (
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span className="font-medium text-gray-900">{name}</span>
              {description && <span className="truncate max-w-[200px]">{description}</span>}
            </div>

            {typeLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Already added questions</p>
                  <p className="text-xs text-gray-500">
                    Questions are shown to lab staff when completing a test of this type. Order follows how they were added.
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg min-h-[80px]">
                  {questions.length === 0 ? (
                    <p className="text-sm text-gray-500 px-4 py-6 text-center">No questions added yet. Add one below.</p>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {questions.map((q) => (
                        <li key={q.id} className="flex items-center justify-between gap-2 px-3 py-2.5 bg-gray-50/50 first:rounded-t-lg last:rounded-b-lg">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 truncate">{q.label}</p>
                            <p className="text-xs text-gray-500">
                              {QUESTION_TYPES.find((t) => t.value === q.type)?.label ?? q.type}
                              {q.type === 'CHOICES' && Array.isArray(q.options) && q.options.length > 0 && (
                                <> · {q.options.join(', ')}</>
                              )}
                            </p>
                          </div>
                          <div className="flex shrink-0 gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => startEditQuestion(q)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:text-red-700"
                              onClick={() => setDeleteQuestionId(q.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {editingQuestion ? (
                  <form onSubmit={handleUpdateQuestion} className="space-y-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <p className="text-sm font-medium text-gray-700">Edit question</p>
                    <div>
                      <Label>Label</Label>
                      <Input
                        value={addForm.label}
                        onChange={(e) => setAddForm((f) => ({ ...f, label: e.target.value }))}
                        placeholder="e.g. Hemoglobin (g/dL)"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Type</Label>
                      <Select
                        value={addForm.type}
                        onValueChange={(v) => setAddForm((f) => ({ ...f, type: v as typeof addForm.type }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {QUESTION_TYPES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {addForm.type === 'CHOICES' && (
                      <div>
                        <Label>Options (comma-separated)</Label>
                        <Input
                          value={addForm.options}
                          onChange={(e) => setAddForm((f) => ({ ...f, options: e.target.value }))}
                          placeholder="e.g. Positive, Negative, Indeterminate"
                          className="mt-1"
                        />
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button type="submit" disabled={!addForm.label.trim() || updateQuestionMutation.isPending}>
                        {updateQuestionMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        Update
                      </Button>
                      <Button type="button" variant="outline" onClick={cancelEdit}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleAddQuestion} className="space-y-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <p className="text-sm font-medium text-gray-700">Add question</p>
                    <div>
                      <Label>Label</Label>
                      <Input
                        value={addForm.label}
                        onChange={(e) => setAddForm((f) => ({ ...f, label: e.target.value }))}
                        placeholder="e.g. Hemoglobin (g/dL)"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Type</Label>
                      <Select
                        value={addForm.type}
                        onValueChange={(v) => setAddForm((f) => ({ ...f, type: v as typeof addForm.type }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {QUESTION_TYPES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {addForm.type === 'CHOICES' && (
                      <div>
                        <Label>Options (comma-separated)</Label>
                        <Input
                          value={addForm.options}
                          onChange={(e) => setAddForm((f) => ({ ...f, options: e.target.value }))}
                          placeholder="e.g. Positive, Negative, Indeterminate"
                          className="mt-1"
                        />
                      </div>
                    )}
                    <Button type="submit" disabled={!addForm.label.trim() || addQuestionMutation.isPending}>
                      {addQuestionMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                      <Plus className="w-4 h-4 mr-2" />
                      Add question
                    </Button>
                  </form>
                )}

                <DialogFooter className="border-t pt-4">
                  <Button type="button" variant="outline" onClick={() => setStep(1)}>
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back
                  </Button>
                  <Button type="button" onClick={handleDone}>
                    Done
                  </Button>
                </DialogFooter>
              </>
            )}
          </div>
        )}
      </DialogContent>

      <ConfirmDialog
        open={!!deleteQuestionId}
        onOpenChange={(open) => !open && setDeleteQuestionId(null)}
        title="Remove question"
        description="Are you sure you want to remove this question? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onConfirm={() => deleteQuestionId && deleteQuestionMutation.mutate(deleteQuestionId)}
        loading={deleteQuestionMutation.isPending}
      />
    </Dialog>
  );
}
