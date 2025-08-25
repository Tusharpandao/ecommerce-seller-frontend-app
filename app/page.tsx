'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        if (user?.role === 'ADMIN') {
          router.push('/admin/dashboard');
        } else if (user?.role === 'SELLER') {
          router.push('/seller/dashboard');
        } else {
          // Fallback for unexpected roles or if user is authenticated but not admin/seller
          router.push('/login');
        }
      } else {
        router.push('/login');
      }
    }
  }, [isAuthenticated, user, isLoading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Redirecting...</p>
    </div>
  );
}
