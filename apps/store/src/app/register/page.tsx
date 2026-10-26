'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/ui';

function RegisterRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { openAuthDrawer } = useAuth();

  useEffect(() => {
    openAuthDrawer('signup');
    const redirectParam = searchParams.get('redirect');
    const targetUrl = redirectParam
      ? `/?auth=signup&redirect=${encodeURIComponent(redirectParam)}`
      : '/?auth=signup';
    router.replace(targetUrl);
  }, [router, searchParams, openAuthDrawer]);

  return <LoadingSpinner className="p-16" />;
}

export default function RegisterPage() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <Suspense fallback={<LoadingSpinner className="p-16" />}>
        <RegisterRedirect />
      </Suspense>
    </div>
  );
}
