"use client";

/**
 * app/global-error.tsx
 * Root-level error boundary — catches errors in the root layout itself.
 */

import { AlertTriangle, RefreshCw } from "lucide-react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b0f1a",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "400px", padding: "24px" }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "rgba(239, 68, 68, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
            }}
          >
            <AlertTriangle style={{ width: 32, height: 32, color: "#ef4444" }} />
          </div>
          <h1 style={{ color: "#f1f5f9", fontSize: "1.5rem", fontWeight: 700, marginBottom: 8 }}>
            Critical Error
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "0.875rem", marginBottom: 24 }}>
            {error.message || "A critical error occurred. Please refresh the page."}
          </p>
          <button
            onClick={reset}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              background: "#6366f1",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 500,
              fontSize: "0.875rem",
            }}
          >
            <RefreshCw style={{ width: 16, height: 16 }} />
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
