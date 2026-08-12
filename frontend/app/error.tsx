"use client";

/**
 * app/error.tsx
 * Next.js App Router error boundary — catches runtime errors in the layout.
 */

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "hsl(var(--background))" }}
    >
      <div className="text-center max-w-md px-6">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: "hsl(var(--danger-bg))" }}
        >
          <AlertTriangle className="w-8 h-8" style={{ color: "hsl(var(--danger))" }} />
        </div>

        <h1
          className="text-2xl font-bold mb-2"
          style={{ color: "hsl(var(--foreground))" }}
        >
          Something went wrong
        </h1>
        <p
          className="text-sm mb-6"
          style={{ color: "hsl(var(--foreground-muted))" }}
        >
          {error.message || "An unexpected error occurred. Our team has been notified."}
        </p>

        {error.digest && (
          <p
            className="text-xs font-mono mb-6"
            style={{ color: "hsl(var(--foreground-subtle))" }}
          >
            Error ID: {error.digest}
          </p>
        )}

        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all"
          style={{
            background: "hsl(var(--brand-primary))",
            color: "white",
          }}
        >
          <RefreshCw className="w-4 h-4" />
          Try again
        </button>
      </div>
    </div>
  );
}
