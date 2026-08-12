"use client";

/**
 * providers/index.tsx
 * Composed root provider — single import in root layout.
 * Order matters: Theme wraps everything, Query is inside.
 */

import type { ReactNode } from "react";
import { ThemeProvider } from "./ThemeProvider";
import { QueryProvider } from "./QueryProvider";
import { Toaster } from "sonner";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <QueryProvider>
        {children}
        <Toaster position="top-center" richColors theme="light" />
      </QueryProvider>
    </ThemeProvider>
  );
}
