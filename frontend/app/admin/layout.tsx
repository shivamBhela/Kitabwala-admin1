'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { logout as logoutRequest } from '@/services/authService';
import { AUTH_COOKIE_NAME } from '@/constants/app';
import type { AuthUser } from '@/types/auth';
import { useRouter } from 'next/navigation';
import { AdminStoreProvider } from '@/lib/store';

const SESSION_KEY = 'kw_admin_user';

function readStoredSession(): AuthUser | null {
  const savedUser = localStorage.getItem(SESSION_KEY);
  const savedToken = localStorage.getItem(AUTH_COOKIE_NAME);

  if (savedUser && savedToken) {
    try {
      return JSON.parse(savedUser) as AuthUser;
    } catch {
      // fall through
    }
  }
  return null;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [adminUser, setAdminUser] = useState<AuthUser | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const restoredUser = readStoredSession();
    if (!restoredUser) {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(AUTH_COOKIE_NAME);
      router.push('/');
    } else {
      setAdminUser(restoredUser);
    }
    setHydrated(true);
  }, [router]);

  const handleLogout = () => {
    logoutRequest().catch(() => {});
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(AUTH_COOKIE_NAME);
    router.push('/');
  };

  if (!hydrated || !adminUser) return null; // Or a loading spinner

  return (
    <div className="flex h-screen font-sans overflow-hidden" style={{ background: '#ffffff' }}>
      <AdminStoreProvider>
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto" style={{ background: '#ffffff' }}>
        <Header adminUser={adminUser.displayName} onLogout={handleLogout} />
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6" style={{ background: '#ffffff' }}>
          {children}
        </main>

        <footer
          className="px-6 py-4 flex items-center justify-between text-xs shrink-0 mt-auto"
          style={{
            borderTop: '1.5px solid #FFC10730',
            background: '#FFFDF0',
            color: '#888888',
          }}
        >
          <span>© {new Date().getFullYear()} Kitabwalah — Enterprise Admin Portal</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: '#FFC107' }} />
            All systems operational
          </span>
        </footer>
      </div>
      </AdminStoreProvider>
    </div>
  );
}
