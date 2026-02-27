import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useInsuranceProviders, type InsuranceProvider } from '@/hooks/useInsuranceProviders';

interface CreateEditInsuranceProviderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider?: InsuranceProvider | null;
  mode: 'create' | 'edit';
}

export default function CreateEditInsuranceProviderModal({
  open,
  onOpenChange,
  provider,
  mode,
}: CreateEditInsuranceProviderModalProps) {
  const { createInsuranceProvider, updateInsuranceProvider } = useInsuranceProviders();
  const [formData, setFormData] = useState({
    name: '',
    contactInfo: '',
    coverageDetails: '',
    patientDividendPercent: 20,
    insuranceDividendPercent: 80,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === 'edit' && provider) {
      setFormData({
        name: provider.name,
        contactInfo: provider.contactInfo || '',
        coverageDetails: provider.coverageDetails || '',
        patientDividendPercent: provider.patientDividendPercent,
        insuranceDividendPercent: provider.insuranceDividendPercent,
      });
    } else if (mode === 'create') {
      setFormData({
        name: '',
        contactInfo: '',
        coverageDetails: '',
        patientDividendPercent: 20,
        insuranceDividendPercent: 80,
      });
    }
    setErrors({});
  }, [mode, provider, open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Provider name is required';
    }

    if (formData.patientDividendPercent < 0 || formData.patientDividendPercent > 100) {
      newErrors.patientDividendPercent = 'Must be between 0 and 100';
    }

    if (formData.insuranceDividendPercent < 0 || formData.insuranceDividendPercent > 100) {
      newErrors.insuranceDividendPercent = 'Must be between 0 and 100';
    }

    if (formData.patientDividendPercent + formData.insuranceDividendPercent !== 100) {
      newErrors.dividends = 'Patient and Insurance dividends must sum to 100%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (mode === 'create') {
      const createData: any = {
        name: formData.name,
        patientDividendPercent: formData.patientDividendPercent,
        insuranceDividendPercent: formData.insuranceDividendPercent,
      };

      if (formData.contactInfo) createData.contactInfo = formData.contactInfo;
      if (formData.coverageDetails) createData.coverageDetails = formData.coverageDetails;

      createInsuranceProvider.mutate(createData, {
        onSuccess: () => {
          onOpenChange(false);
        },
      });
    } else if (mode === 'edit' && provider) {
      const updateData: any = {};
      if (formData.name !== provider.name) updateData.name = formData.name;
      if (formData.contactInfo !== provider.contactInfo) updateData.contactInfo = formData.contactInfo;
      if (formData.coverageDetails !== provider.coverageDetails)
        updateData.coverageDetails = formData.coverageDetails;
      if (formData.patientDividendPercent !== provider.patientDividendPercent)
        updateData.patientDividendPercent = formData.patientDividendPercent;
      if (formData.insuranceDividendPercent !== provider.insuranceDividendPercent)
        updateData.insuranceDividendPercent = formData.insuranceDividendPercent;

      if (Object.keys(updateData).length === 0) {
        onOpenChange(false);
        return;
      }

      updateInsuranceProvider.mutate(
        { id: provider.id, data: updateData },
        {
          onSuccess: () => {
            onOpenChange(false);
          },
        }
      );
    }
  };

  const isSubmitting = createInsuranceProvider.isPending || updateInsuranceProvider.isPending;

  const handlePatientDividendChange = (value: number) => {
    setFormData({
      ...formData,
      patientDividendPercent: value,
      insuranceDividendPercent: 100 - value,
    });
  };

  const handleInsuranceDividendChange = (value: number) => {
    setFormData({
      ...formData,
      insuranceDividendPercent: value,
      patientDividendPercent: 100 - value,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add New Insurance Provider' : 'Edit Insurance Provider'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='name'>
                Provider Name <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='name'
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder='RSSB - MMI'
                required
              />
              {errors.name && <p className='text-sm text-red-500'>{errors.name}</p>}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='contactInfo'>Contact Information</Label>
              <Input
                id='contactInfo'
                value={formData.contactInfo}
                onChange={e => setFormData({ ...formData, contactInfo: e.target.value })}
                placeholder='info@provider.com | +250788000000'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='coverageDetails'>Coverage Details</Label>
              <Textarea
                id='coverageDetails'
                value={formData.coverageDetails}
                onChange={e => setFormData({ ...formData, coverageDetails: e.target.value })}
                placeholder='Describe what services and treatments this insurance covers...'
                rows={4}
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='patientDividendPercent'>
                  Patient Dividend Percentage (%) <span className='text-red-500'>*</span>
                </Label>
                <Input
                  id='patientDividendPercent'
                  type='number'
                  min='0'
                  max='100'
                  value={formData.patientDividendPercent}
                  onChange={e => handlePatientDividendChange(parseFloat(e.target.value) || 0)}
                  placeholder='20'
                  required
                />
                {errors.patientDividendPercent && (
                  <p className='text-sm text-red-500'>{errors.patientDividendPercent}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='insuranceDividendPercent'>
                  Insurance Dividend Percentage (%) <span className='text-red-500'>*</span>
                </Label>
                <Input
                  id='insuranceDividendPercent'
                  type='number'
                  min='0'
                  max='100'
                  value={formData.insuranceDividendPercent}
                  onChange={e => handleInsuranceDividendChange(parseFloat(e.target.value) || 0)}
                  placeholder='80'
                  required
                />
                {errors.insuranceDividendPercent && (
                  <p className='text-sm text-red-500'>{errors.insuranceDividendPercent}</p>
                )}
              </div>
            </div>

            {errors.dividends && (
              <div className='rounded-md bg-red-50 p-3'>
                <p className='text-sm text-red-600'>{errors.dividends}</p>
              </div>
            )}

            <div className='rounded-md bg-blue-50 p-3'>
              <p className='text-sm text-blue-700'>
                <strong>Total:</strong> {formData.patientDividendPercent + formData.insuranceDividendPercent}%
                {formData.patientDividendPercent + formData.insuranceDividendPercent === 100 && ' ✓'}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  {mode === 'create' ? 'Creating...' : 'Updating...'}
                </>
              ) : mode === 'create' ? (
                'Create Provider'
              ) : (
                'Update Provider'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
