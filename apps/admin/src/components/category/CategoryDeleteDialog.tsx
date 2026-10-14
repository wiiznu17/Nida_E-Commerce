import { AlertCircle, ShieldAlert } from 'lucide-react';
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
  isDeactivating?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  onDeactivate?: (category: ApiCategory) => Promise<void>;
}

export function CategoryDeleteDialog({
  category,
  isOpen,
  isDeleting,
  isDeactivating = false,
  onClose,
  onConfirm,
  onDeactivate,
}: CategoryDeleteDialogProps) {
  const { t, isTh } = useLanguage();

  if (!category) return null;

  const productCount = category.productCount ?? 0;
  const childCount = category.children?.length ?? 0;
  const isBlocked = productCount > 0 || childCount > 0;
  const categoryName = isTh && category.nameTh ? category.nameTh : category.name;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        {isBlocked ? (
          <>
            <DialogHeader>
              <div className="flex items-center space-x-2 text-amber-600 mb-1">
                <ShieldAlert size={22} />
                <DialogTitle className="text-base font-bold text-stone-900">
                  {t('category.deleteBlockedTitle')}
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs text-stone-500 font-medium">
                {categoryName}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-2 bg-amber-50/80 border border-amber-200 rounded-lg p-3.5 space-y-2 text-left">
              {productCount > 0 && (
                <p className="text-xs text-amber-950 font-medium leading-relaxed">
                  {t('category.deleteBlockedHasProducts').replace('{count}', String(productCount))}
                </p>
              )}
              {childCount > 0 && (
                <p className="text-xs text-amber-950 font-medium leading-relaxed">
                  {t('category.deleteBlockedHasChildren').replace('{count}', String(childCount))}
                </p>
              )}
              <div className="text-[11px] text-amber-900/80 leading-relaxed pt-2 border-t border-amber-200/60">
                {t('category.deleteBlockedAdvice')}
              </div>
            </div>

            <DialogFooter className="mt-4 flex items-center justify-end space-x-2">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isDeactivating}
                className="text-xs"
              >
                {t('category.modal.cancel')}
              </Button>
              {category.isActive !== false && onDeactivate && (
                <Button
                  onClick={() => onDeactivate(category)}
                  disabled={isDeactivating}
                  className="bg-brand-brown hover:bg-brand-brown/90 text-white text-xs font-bold"
                >
                  {isDeactivating ? t('category.modal.saving') : t('category.deactivateNow')}
                </Button>
              )}
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center space-x-2 text-red-600 mb-1">
                <AlertCircle size={20} />
                <DialogTitle className="text-base font-bold">
                  {t('category.deleteConfirmTitle')}
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs text-stone-600 leading-relaxed">
                {t('category.deleteConfirmMessage').replace('{name}', categoryName)}
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
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
