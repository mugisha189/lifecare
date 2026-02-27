import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { useHospitals, type Hospital } from '@/hooks/useHospitals';

interface CreateEditHospitalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hospital?: Hospital | null;
  mode: 'create' | 'edit';
}

export default function CreateEditHospitalModal({ open, onOpenChange, hospital, mode }: CreateEditHospitalModalProps) {
  const { createHospital, updateHospital } = useHospitals();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    country: 'Rwanda',
    phoneNumber: '',
    email: '',
    latitude: '',
    longitude: '',
    active: true,
  });

  useEffect(() => {
    if (mode === 'edit' && hospital) {
      setFormData({
        name: hospital.name,
        address: hospital.address,
        city: hospital.city,
        country: hospital.country || 'Rwanda',
        phoneNumber: hospital.phoneNumber || '',
        email: hospital.email || '',
        latitude: hospital.latitude?.toString() || '',
        longitude: hospital.longitude?.toString() || '',
        active: hospital.active,
      });
    } else if (mode === 'create') {
      setFormData({
        name: '',
        address: '',
        city: '',
        country: 'Rwanda',
        phoneNumber: '',
        email: '',
        latitude: '',
        longitude: '',
        active: true,
      });
    }
  }, [mode, hospital, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'create') {
      if (!formData.name || !formData.address || !formData.city) {
        return;
      }

      const createData: any = {
        name: formData.name,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        active: formData.active,
      };

      if (formData.phoneNumber) createData.phoneNumber = formData.phoneNumber;
      if (formData.email) createData.email = formData.email;
      if (formData.latitude) createData.latitude = parseFloat(formData.latitude);
      if (formData.longitude) createData.longitude = parseFloat(formData.longitude);

      createHospital.mutate(createData, {
        onSuccess: () => {
          onOpenChange(false);
        },
      });
    } else if (mode === 'edit' && hospital) {
      const updateData: any = {};
      if (formData.name !== hospital.name) updateData.name = formData.name;
      if (formData.address !== hospital.address) updateData.address = formData.address;
      if (formData.city !== hospital.city) updateData.city = formData.city;
      if (formData.country !== hospital.country) updateData.country = formData.country;
      if (formData.phoneNumber !== hospital.phoneNumber) updateData.phoneNumber = formData.phoneNumber;
      if (formData.email !== hospital.email) updateData.email = formData.email;
      if (formData.active !== hospital.active) updateData.active = formData.active;
      
      const newLat = formData.latitude ? parseFloat(formData.latitude) : undefined;
      const newLng = formData.longitude ? parseFloat(formData.longitude) : undefined;
      if (newLat !== hospital.latitude) updateData.latitude = newLat;
      if (newLng !== hospital.longitude) updateData.longitude = newLng;

      if (Object.keys(updateData).length === 0) {
        onOpenChange(false);
        return;
      }

      updateHospital.mutate(
        { id: hospital.id, data: updateData },
        {
          onSuccess: () => {
            onOpenChange(false);
          },
        }
      );
    }
  };

  const isSubmitting = createHospital.isPending || updateHospital.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Add New Hospital' : 'Edit Hospital'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='col-span-2 space-y-2'>
              <Label htmlFor='name'>
                Hospital Name <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='name'
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder='City General Hospital'
                required
              />
            </div>

            <div className='col-span-2 space-y-2'>
              <Label htmlFor='address'>
                Address <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='address'
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                placeholder='123 Main Street'
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='city'>
                City <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='city'
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                placeholder='Kigali'
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='country'>Country</Label>
              <Input
                id='country'
                value={formData.country}
                onChange={e => setFormData({ ...formData, country: e.target.value })}
                placeholder='Rwanda'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='phoneNumber'>Phone Number</Label>
              <Input
                id='phoneNumber'
                value={formData.phoneNumber}
                onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder='+250788123456'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder='contact@hospital.com'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='latitude'>Latitude</Label>
              <Input
                id='latitude'
                type='number'
                step='any'
                value={formData.latitude}
                onChange={e => setFormData({ ...formData, latitude: e.target.value })}
                placeholder='-1.9536'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='longitude'>Longitude</Label>
              <Input
                id='longitude'
                type='number'
                step='any'
                value={formData.longitude}
                onChange={e => setFormData({ ...formData, longitude: e.target.value })}
                placeholder='30.0606'
              />
            </div>

            <div className='col-span-2 flex items-center space-x-2'>
              <Switch
                id='active'
                checked={formData.active}
                onCheckedChange={checked => setFormData({ ...formData, active: checked })}
              />
              <Label htmlFor='active' className='cursor-pointer'>Active</Label>
            </div>
          </div>

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
              {mode === 'create' ? 'Create Hospital' : 'Update Hospital'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
