/**
 * hooks/useDisclosure.ts
 * Controls open/closed state for modals, drawers, dropdowns.
 */

import { useCallback, useState } from "react";

interface UseDisclosureOptions {
  defaultOpen?: boolean;
}

interface UseDisclosureReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  onOpenChange: (open: boolean) => void;
}

export function useDisclosure({
  defaultOpen = false,
}: UseDisclosureOptions = {}): UseDisclosureReturn {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
  const onOpenChange = useCallback((open: boolean) => setIsOpen(open), []);

  return { isOpen, open, close, toggle, onOpenChange };
}
