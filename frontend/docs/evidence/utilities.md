# Utilities — Kitabwalah Admin Portal

## utils/format.ts

| Export | Signature | Description |
|--------|-----------|-------------|
| formatCurrency | (amount: number, currency?: string) => string | Formats a number as Indian Rupee (INR) by default using Intl.NumberFormat |
| formatDate | (date: string or Date, fmt?: string) => string | Formats a date string/object using date-fns format |
| formatRelativeDate | (date: string or Date) => string | Returns human-readable relative time (e.g. "2 hours ago") using date-fns formatDistanceToNow |
| truncate | (str: string, maxLen: number) => string | Truncates a string and appends ellipsis |
| capitalise | (str: string) => string | Capitalises the first letter of a string |
| formatPhone | (phone: string) => string | Formats Indian phone numbers (adds +91 prefix, groups digits) |
| formatFileSize | (bytes: number) => string | Converts bytes to human-readable size (KB, MB, etc.) |

## utils/validators.ts

| Export | Signature | Description |
|--------|-----------|-------------|
| isValidEmail | (email: string) => boolean | Validates email format via regex |
| isValidPhone | (phone: string) => boolean | Validates 10-digit Indian mobile number |
| isValidPincode | (pin: string) => boolean | Validates 6-digit Indian pincode |
| isValidGSTIN | (gstin: string) => boolean | Validates GSTIN format (15 chars, specific pattern) |
| isValidPAN | (pan: string) => boolean | Validates PAN card format |
| isValidIFSC | (ifsc: string) => boolean | Validates bank IFSC code |
| isValidAadhar | (aadhar: string) => boolean | Validates 12-digit Aadhaar number |

## lib/utils.ts

| Export | Description |
|--------|-------------|
| cn(...classes) | Merges Tailwind class names using clsx + tailwind-merge |

## lib/animations.ts

| Export | Description |
|--------|-------------|
| fadeIn | Framer Motion variant — fade in from transparent |
| slideInFromLeft | Framer Motion variant — slide in from left |
| slideInFromRight | Framer Motion variant — slide in from right |
| staggerContainer | Framer Motion variant — staggered child animations |
| scaleIn | Framer Motion variant — scale in from 0.9 |

Total utility files: 4
