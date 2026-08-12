# Custom Hooks — Kitabwalah Admin Portal

| File | Export(s) | Description |
|------|-----------|-------------|
| hooks/useDebounce.ts | useDebounce<T>(value, delay) | Generic debounce — delays propagating value changes; used in search inputs |
| hooks/useDisclosure.ts | useDisclosure(initial?) | Returns { isOpen, open, close, toggle } for controlling modal/drawer open state |
| hooks/useLocalStorage.ts | useLocalStorage<T>(key, initial) | Syncs a value to localStorage with SSR safety; returns [value, setValue, remove] |
| hooks/useMediaQuery.ts | useMediaQuery(query), useIsMobile(), useIsTablet(), useIsDesktop() | Reactive CSS media query matching with lazy initializer for SSR safety |
| hooks/usePagination.ts | usePagination({ total, pageSize, initial }) | Client-side pagination state — returns { page, pageCount, slice, goTo, prev, next } |

Total Custom Hooks: 5 files, 8 exported hooks
