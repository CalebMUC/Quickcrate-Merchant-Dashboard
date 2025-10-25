'use client';

import { usePathname } from 'next/navigation';
import { ModularSidebar } from './ModularSidebar';
import { Header } from '@/components/header';
import { AuthGuard } from '@/components/auth/AuthGuard';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  
  // Don't show layout for auth pages
  if (pathname === '/login' || pathname === '/login/reset-password') {
    return <>{children}</>;
  }

  return (
    <AuthGuard requireAuth={true}>
      <div className="flex h-screen bg-background">
        <ModularSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}