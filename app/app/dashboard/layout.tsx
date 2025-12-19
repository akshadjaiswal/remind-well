'use client';

import { useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal';
import { Toaster } from '@/components/ui/toaster';
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">💧</div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <DeleteConfirmationModal />
      <Toaster />
    </div>
  );
}
