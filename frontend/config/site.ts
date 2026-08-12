/**
 * config/site.ts
 * Site-wide metadata and SEO configuration.
 */

export const siteConfig = {
  name: "Kitabwalah Admin",
  description:
    "Enterprise Admin Portal for Kitabwalah — multi-vendor book ecommerce platform",
  url: "https://admin.kitabwalah.com",
  ogImage: "/og-image.png",
  links: {
    storefront: "https://kitabwalah.com",
  },
  keywords: [
    "Kitabwalah",
    "admin portal",
    "vendor management",
    "order management",
    "ecommerce",
  ],
} as const;

export type SiteConfig = typeof siteConfig;
