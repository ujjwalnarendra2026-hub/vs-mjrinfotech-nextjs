# VS-MJR Infotech (Next.js)

Production-ready Next.js App Router migration of the original Lovable-generated `swift-render-clone` project.

## Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- Supabase (DB + Storage)

## Project Structure

- `app/` App Router routes, layouts, metadata, API routes
- `components/` UI sections and page components
- `lib/` shared utilities, SEO schema, service data, Supabase server helpers
- `styles/` global styles
- `public/` static assets

## Environment Variables

Copy `.env.example` to `.env` and configure:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASSWORD`
- `GMAIL_USER`
- `GMAIL_APP_PASSWORD`
- `EMAIL_TO`
- `EMAIL_BCC`

## Scripts

- `npm run dev` - development server
- `npm run lint` - lint checks
- `npm run build` - production build
- `npm start` - run production server

## Migration Summary

### Lovable Lock-In Removed

- Removed Lovable runtime/tooling artifacts:
  - `.lovable/`
  - `vite.config.ts`
  - Vite bootstrapping (`src/main.tsx`, `src/App.tsx`, `index.html`)
  - `lovable-tagger` and Lovable docs references
- Removed `react-router-dom` routing and replaced with Next App Router.

### Architecture Refactor

- Migrated to App Router route model:
  - `/`, `/about`, `/contact`, `/careers`, `/certificates`, `/services/[slug]`, `/admin`
- Introduced route group layout for site pages:
  - shared navbar/footer via `app/(site)/layout.tsx`
- Split and centralized shared data/utilities:
  - `lib/services.ts`, `lib/seo.ts`, `lib/types.ts`

### Supabase and Backend Portability

- Replaced Supabase Edge Function dependency with native Next.js API routes:
  - `POST /api/forms/submit` for contact/newsletter/career submissions
  - `POST /api/admin` for admin login, CRUD operations, signed upload URL generation
- Kept Supabase as backend service but moved privileged operations server-side via service role key.

### Security Hardening

- Secrets moved to environment-only server usage.
- Admin auth token generation/verification implemented using HMAC (`lib/security.ts`).
- Added baseline security headers in `next.config.ts`:
  - CSP
  - X-Frame-Options
  - X-Content-Type-Options
  - Referrer-Policy
  - Strict-Transport-Security
  - Permissions-Policy

### SEO Improvements

- Added Next Metadata API across routes.
- Added JSON-LD structured data for organization, website, breadcrumbs, and services.
- Added dynamic crawlers endpoints:
  - `app/sitemap.ts`
  - `app/robots.ts`
- Canonical URLs configured per page.

### Performance Improvements

- Removed unnecessary client-side routing framework and old runtime overhead.
- Prefer server-side data fetch for public lists (clients, positions, certificates).
- Font loading migrated to `next/font` with `display: swap` to reduce CLS risk.

### Accessibility Improvements

- Added/retained semantic section structure.
- Improved form labeling and required field behavior in newsletter/contact/career forms.

## Validation

Executed successfully:

- `npm install`
- `npm run lint` (warnings only)
- `npm run build`
- `npm start`

## Deployment Notes

Target domain: `https://vs-mjrinfotech.com/`

Before deployment, ensure production env vars are set and Supabase tables/storage buckets exist with expected schema.
