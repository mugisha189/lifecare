import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';
import { type ReactNode } from 'react';

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive' | 'warning' | 'success';
  icon?: ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
}

export default function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  icon,
  isLoading = false,
  disabled = false,
}: ConfirmDialogProps) {
  const handleConfirm = async (e: React.MouseEvent) => {
    // Prevent the AlertDialogAction from automatically closing the dialog
    e.preventDefault();
    try {
      await onConfirm();
    } catch (error) {
      // Error handling is done in the parent component
      console.error('Confirm action failed:', error);
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'destructive':
        return 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-600';
      case 'warning':
        return 'bg-orange-600 hover:bg-orange-700 text-white focus:ring-orange-600';
      case 'success':
        return 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-600';
      default:
        return 'bg-blue-900 hover:bg-blue-800 text-white focus:ring-blue-900';
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    // Prevent closing while loading - block all close attempts
    if (!newOpen && isLoading) {
      return; // Block closing during loading
    }
    onOpenChange(newOpen);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          {icon ? (
            <div className='flex items-center gap-3 mb-2'>
              {icon}
              <AlertDialogTitle>{title}</AlertDialogTitle>
            </div>
          ) : (
            <AlertDialogTitle>{title}</AlertDialogTitle>
          )}
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading || disabled}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={isLoading || disabled} className={getVariantStyles()}>
            {isLoading ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin' />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
