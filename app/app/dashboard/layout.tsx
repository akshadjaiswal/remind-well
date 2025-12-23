'use client';

import { useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal';
import { Toaster } from '@/components/ui/toaster';
import { SkeletonCard } from '@/components/ui/skeleton';
import { useUser } from '@/hooks/use-user';
import { useUserStore } from '@/lib/stores/user-store';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: user, isLoading } = useUser();
  const { setUser } = useUserStore();

  useEffect(() => {
    if (user) {
      setUser(user);
    }
  }, [user, setUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-8 w-48 bg-gray-200 rounded animate-pulse-soft" />
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse-soft" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/20 to-purple-50/20">
      <Header />
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <DeleteConfirmationModal />
      <Toaster />
    </div>
  );
}
