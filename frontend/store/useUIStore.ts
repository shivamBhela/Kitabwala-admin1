/**
 * store/useUIStore.ts
 * Zustand store for global UI state only.
 * - Sidebar open/collapsed state
 * - Active modal tracking
 * Server state (API data) is handled by TanStack Query — NOT here.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  // Sidebar
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Mobile sidebar (separate from desktop collapse)
  isMobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;

  // Active modal tracking (by modal ID)
  activeModal: string | null;
  openModal: (modalId: string) => void;
  closeModal: () => void;

  // Global loading state (for full-page operations)
  isGlobalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Sidebar — persisted across sessions
      isSidebarOpen: true,
      toggleSidebar: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSidebarOpen: (open) => set({ isSidebarOpen: open }),

      // Mobile sidebar — not persisted
      isMobileSidebarOpen: false,
      setMobileSidebarOpen: (open) => set({ isMobileSidebarOpen: open }),

      // Modals — not persisted
      activeModal: null,
      openModal: (modalId) => set({ activeModal: modalId }),
      closeModal: () => set({ activeModal: null }),

      // Global loading
      isGlobalLoading: false,
      setGlobalLoading: (loading) => set({ isGlobalLoading: loading }),
    }),
    {
      name: "kw-admin-ui",
      // Only persist sidebar state
      partialize: (state) => ({ isSidebarOpen: state.isSidebarOpen }),
    }
  )
);
