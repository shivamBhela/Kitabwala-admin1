import Link from "next/link";
import { Search } from "lucide-react";

/**
 * app/not-found.tsx
 * 404 page for all unmatched routes.
 */

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "hsl(var(--background))" }}
    >
      <div className="text-center max-w-md px-6">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: "hsl(var(--background-secondary))" }}
        >
          <Search className="w-8 h-8" style={{ color: "hsl(var(--foreground-muted))" }} />
        </div>

        <p
          className="text-6xl font-bold mb-4 gradient-brand-text"
        >
          404
        </p>
        <h1
          className="text-xl font-semibold mb-2"
          style={{ color: "hsl(var(--foreground))" }}
        >
          Page not found
        </h1>
        <p
          className="text-sm mb-8"
          style={{ color: "hsl(var(--foreground-muted))" }}
        >
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm text-white transition-opacity hover:opacity-90 gradient-brand"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
