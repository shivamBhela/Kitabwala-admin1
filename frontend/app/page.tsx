'use client';

import React, { useState, useEffect } from 'react';
import { AdminStoreProvider, useAdminStore } from '@/lib/store';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import LoginPage from '@/components/LoginPage';
import { logout as logoutRequest } from '@/services/authService';
import { AUTH_COOKIE_NAME } from '@/constants/app';
import type { AuthUser } from '@/types/auth';

import DashboardSection from '@/components/sections/DashboardSection';
import SameDayAnalyticsSection from '@/components/sections/SameDayAnalyticsSection';
import MapSection from '@/components/sections/MapSection';
import OrdersSection from '@/components/sections/OrdersSection';
import ProductsSection from '@/components/sections/ProductsSection';
import VendorsSection from '@/components/sections/VendorsSection';
import UsersSection from '@/components/sections/UsersSection';
import DeliverySection from '@/components/sections/DeliverySection';
import PincodesSection from '@/components/sections/PincodesSection';
import ReturnsSection from '@/components/sections/ReturnsSection';
import WithdrawalsSection from '@/components/sections/WithdrawalsSection';
import CouponsSection from '@/components/sections/CouponsSection';
import BannersSection from '@/components/sections/BannersSection';
import HomepagePinsSection from '@/components/sections/HomepagePinsSection';
import ReviewsSection from '@/components/sections/ReviewsSection';
import SupportSection from '@/components/sections/SupportSection';
import ExamsSection from '@/components/sections/ExamsSection';
import AppSettingsSection from '@/components/sections/AppSettingsSection';
import StaticPagesSection from '@/components/sections/StaticPagesSection';
import NotificationsSection from '@/components/sections/NotificationsSection';
import AuditLogsSection from '@/components/sections/AuditLogsSection';
import EmailLogsSection from '@/components/sections/EmailLogsSection';
import MigrationLogsSection from '@/components/sections/MigrationLogsSection';
import SchemaRefSection from '@/components/sections/SchemaRefSection';

const SESSION_KEY = 'kw_admin_user';

/** Reads a previously-persisted session, clearing it if incomplete/corrupt. */
function readStoredSession(): AuthUser | null {
  const savedUser = localStorage.getItem(SESSION_KEY);
  const savedToken = localStorage.getItem(AUTH_COOKIE_NAME);

  if (savedUser && savedToken) {
    try {
      return JSON.parse(savedUser) as AuthUser;
    } catch {
      // fall through to cleanup below
    }
  }
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(AUTH_COOKIE_NAME);
  return null;
}

function AdminMainContent({ adminUser }: { adminUser: AuthUser }) {
  const { activeTab } = useAdminStore();

  const handleLogout = () => {
    // Best-effort — revokes the refresh token server-side, but the local
    // session is cleared regardless of whether this call succeeds.
    logoutRequest().catch(() => {});
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(AUTH_COOKIE_NAME);
    window.location.reload();
  };

  const renderSection = () => {
    switch (activeTab) {
      case 'dashboard':      return <DashboardSection />;
      case 'same-day-analytics': return <SameDayAnalyticsSection />;
      case 'map':            return <MapSection />;
      case 'orders':         return <OrdersSection />;
      case 'products':       return <ProductsSection />;
      case 'vendors':        return <VendorsSection />;
      case 'users':          return <UsersSection />;
      case 'delivery':       return <DeliverySection />;
      case 'pincodes':       return <PincodesSection />;
      case 'returns':        return <ReturnsSection />;
      case 'withdrawals':    return <WithdrawalsSection />;
      case 'coupons':        return <CouponsSection />;
      case 'banners':        return <BannersSection />;
      case 'pins':           return <HomepagePinsSection />;
      case 'reviews':        return <ReviewsSection />;
      case 'support':        return <SupportSection />;
      case 'exams':          return <ExamsSection />;
      case 'settings':       return <AppSettingsSection />;
      case 'static-pages':   return <StaticPagesSection />;
      case 'notifications':  return <NotificationsSection />;
      case 'audit-logs':     return <AuditLogsSection />;
      case 'email-logs':     return <EmailLogsSection />;
      case 'migration-logs': return <MigrationLogsSection />;
      case 'schema-ref':     return <SchemaRefSection />;
      default:               return <DashboardSection />;
    }
  };

  return (
    <div
      className="flex h-screen font-sans overflow-hidden"
      style={{ background: '#ffffff' }}
    >
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto" style={{ background: '#ffffff' }}>
        <Header adminUser={adminUser.displayName} onLogout={handleLogout} />
        <main
          className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6"
          style={{ background: '#ffffff' }}
        >
          {renderSection()}
        </main>

        {/* Footer */}
        <footer
          className="px-6 py-4 flex items-center justify-between text-xs shrink-0 mt-auto"
          style={{
            borderTop: '1.5px solid #FFC10730',
            background: '#FFFDF0',
            color: '#888888',
          }}
        >
          <span>
            © {new Date().getFullYear()} Kitabwalah — Enterprise Admin Portal
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: '#FFC107' }}
            />
            All systems operational
          </span>
        </footer>
      </div>
    </div>
  );
}

export default function Home() {
  const [adminUser, setAdminUser] = useState<AuthUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // A valid session needs both the access token and the cached user info —
    // if only one survived (e.g. manual localStorage edit), treat as logged out.
    const restoredUser = readStoredSession();
    // localStorage is unavailable during SSR, so restoring the session can only
    // happen client-side post-mount — the effect+setState shape is unavoidable here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAdminUser(restoredUser);
    setHydrated(true);
  }, []);

  const handleLogin = (user: AuthUser) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    setAdminUser(user);
  };

  // Avoid hydration mismatch
  if (!hydrated) return null;

  if (!adminUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <AdminStoreProvider>
      <AdminMainContent adminUser={adminUser} />
    </AdminStoreProvider>
  );
}
