import { ApiErrorModal } from '../ui';
import { useLanguage } from '../../context/LanguageContext';

export interface ProductCreateErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorMessage: string;
  validationErrors?: string[];
}

export function ProductCreateErrorModal({
  isOpen,
  onClose,
  errorMessage,
  validationErrors = [],
}: ProductCreateErrorModalProps) {
  const { t } = useLanguage();

  return (
    <ApiErrorModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('product.createErrorTitle')}
      description={t('product.createErrorDesc')}
      errorMessage={errorMessage}
      validationErrors={validationErrors}
    />
  );
}
