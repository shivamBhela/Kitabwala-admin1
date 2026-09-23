'use client';

import React, { useState, useEffect } from 'react';
import LoginPage from '@/components/LoginPage';
import { AUTH_COOKIE_NAME } from '@/constants/app';
import type { AuthUser } from '@/types/auth';
import { useRouter } from 'next/navigation';

const SESSION_KEY = 'kw_admin_user';

export default function Home() {
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedUser = localStorage.getItem(SESSION_KEY);
    const savedToken = localStorage.getItem(AUTH_COOKIE_NAME);
    
    if (savedUser && savedToken) {
      try {
        const user = JSON.parse(savedUser) as AuthUser;
        // Currently we only have Admin routing. If user is vendor, route to /vendor later
        router.push('/admin/dashboard');
      } catch {
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(AUTH_COOKIE_NAME);
      }
    }
    setHydrated(true);
  }, [router]);

  const handleLogin = (user: AuthUser) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    router.push('/admin/dashboard');
  };

  if (!hydrated) return null;

  return <LoginPage onLogin={handleLogin} />;
}
