/**
 * app/loading.tsx
 * Root-level loading UI — shown during navigation.
 */

export default function RootLoading() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "hsl(var(--background))" }}
    >
      <div className="flex flex-col items-center gap-4">
        {/* Spinning logo mark */}
        <div className="relative w-12 h-12">
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent animate-spin"
            style={{
              borderTopColor: "hsl(var(--brand-primary))",
              borderRightColor: "hsl(var(--brand-secondary))",
            }}
          />
          <div
            className="absolute inset-2 rounded-full"
            style={{ background: "hsl(var(--brand-primary) / 0.15)" }}
          />
        </div>
        <p
          className="text-sm font-medium"
          style={{ color: "hsl(var(--foreground-muted))" }}
        >
          Loading Kitabwalah Admin…
        </p>
      </div>
    </div>
  );
}
