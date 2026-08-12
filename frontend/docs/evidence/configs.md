# Configuration Files — Kitabwalah Admin Portal

| File | Purpose |
|------|---------|
| next.config.ts | Next.js build config — remote image patterns (AWS S3, kitabwalah.com), typedRoutes: false |
| tsconfig.json | TypeScript compiler — strict mode, noEmit, bundler module resolution, @/* path aliases for all directories |
| postcss.config.mjs | PostCSS — @tailwindcss/postcss plugin |
| eslint.config.mjs | ESLint flat config — eslint-config-next core-web-vitals + typescript rules, ignores .next/build/out |
| .prettierrc | Prettier — semi: true, singleQuote: true, tabWidth: 2, trailingComma: es5, printWidth: 100 |
| .env.example | Environment variable template — NEXT_PUBLIC_API_URL, NEXT_PUBLIC_APP_NAME, etc. |
| .env.local | Local environment values (not committed to VCS) |
| .gitignore | Git ignore rules — node_modules, .next, .env.local, build, dist |
| package.json | Project manifest — all dependencies and scripts |

## config/site.ts

| Export | Description |
|--------|-------------|
| siteConfig | Site-wide metadata: name, description, url, keywords, nav links |

## constants/navigation.ts

| Export | Description |
|--------|-------------|
| navSections | Array of sidebar navigation groups with items, icons, tab keys, and badge config |

## constants/app.ts

| Export | Description |
|--------|-------------|
| APP_NAME, APP_VERSION | String constants |
| ITEMS_PER_PAGE | Default pagination size (20) |
| DATE_FORMAT | Default date format string |
| SUPPORTED_IMAGE_TYPES, MAX_IMAGE_SIZE | File upload constraints |
