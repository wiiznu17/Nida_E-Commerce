import { AlertCircle } from 'lucide-react';
import type { ApiCategory } from '@repo/types';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../ui';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';

export interface CategoryDeleteDialogProps {
  category: ApiCategory | null;
  isOpen: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function CategoryDeleteDialog({
  category,
  isOpen,
  isDeleting,
  onClose,
  onConfirm,
}: CategoryDeleteDialogProps) {
  const { t, isTh } = useLanguage();

  if (!category) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-2 text-red-600 mb-1">
            <AlertCircle size={20} />
            <DialogTitle className="text-base font-bold">
              {t('category.deleteConfirmTitle')}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-stone-600 leading-relaxed">
            {t('category.deleteConfirmMessage').replace(
              '{name}',
              isTh && category.nameTh ? category.nameTh : category.name,
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4 flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="text-xs"
          >
            {t('category.modal.cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
          >
            {isDeleting ? t('category.modal.saving') : t('productList.delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
