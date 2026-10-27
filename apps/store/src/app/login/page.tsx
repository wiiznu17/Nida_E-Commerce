'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/ui';

function LoginRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, openAuthDrawer } = useAuth();

  useEffect(() => {
    const redirectParam = searchParams.get('redirect');
    if (isAuthenticated) {
      router.replace(redirectParam || '/profile');
      return;
    }

    openAuthDrawer('signin');
    if (redirectParam && redirectParam !== '/') {
      const glue = redirectParam.includes('?') ? '&' : '?';
      router.replace(`${redirectParam}${glue}auth=signin`, { scroll: false });
    } else {
      router.replace('/?auth=signin', { scroll: false });
    }
  }, [router, searchParams, openAuthDrawer, isAuthenticated]);

  return <LoadingSpinner className="p-16" />;
}

export default function LoginPage() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <Suspense fallback={<LoadingSpinner className="p-16" />}>
        <LoginRedirect />
      </Suspense>
    </div>
  );
}
