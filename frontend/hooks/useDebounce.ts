/**
 * hooks/useDebounce.ts
 * Debounces a value change — used for search inputs to reduce API calls.
 */

import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delayMs: number = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}
