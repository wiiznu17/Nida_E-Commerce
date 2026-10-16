'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfileOrdersRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/profile');
  }, [router]);

  return null;
}
