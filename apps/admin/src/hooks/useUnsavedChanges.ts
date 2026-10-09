import { useEffect } from 'react';
import { useBlocker } from 'react-router-dom';

export interface UseUnsavedChangesOptions {
  isDirty: boolean;
  isSubmitting?: boolean;
}

export function useUnsavedChanges({ isDirty, isSubmitting = false }: UseUnsavedChangesOptions) {
  const shouldBlock = isDirty && !isSubmitting;

  // 1. Guard against browser tab closing, refreshing, or hard navigation
  useEffect(() => {
    if (!shouldBlock) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // Required for modern browsers (Chrome, Edge, Safari, Firefox)
      event.returnValue = '';
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [shouldBlock]);

  // 2. Guard against in-app React Router client-side navigation (sidebar links, back button, etc.)
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      shouldBlock && currentLocation.pathname !== nextLocation.pathname,
  );

  return {
    isBlocked: blocker.state === 'blocked',
    proceed: () => {
      if (blocker.state === 'blocked') {
        blocker.proceed();
      }
    },
    reset: () => {
      if (blocker.state === 'blocked') {
        blocker.reset();
      }
    },
    blocker,
  };
}
