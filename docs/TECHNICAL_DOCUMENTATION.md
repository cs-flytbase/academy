# Academy Project Technical Documentation

## Table of Contents
1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Routing & Pages](#routing--pages)
5. [Components](#components)
6. [Supabase Integration](#supabase-integration)
7. [Environment Variables](#environment-variables)
8. [Database Schema](#database-schema)
9. [Development & Deployment](#development--deployment)
10. [Next Steps](#next-steps)

## Overview
This is a Next.js application for an online academy platform. It uses React, TypeScript, Tailwind CSS, and integrates with Supabase for authentication and data storage.

## Tech Stack
- **Next.js** (App Router)
- **React**
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (PostgreSQL, Auth)
- **Vercel** (for deployment)

## Project Structure
```
academy/
├── src/
│   ├── app/             # Next.js App Router (layouts & pages)
│   ├── components/      # Reusable React UI components
│   ├── utils/           # Supabase client setup
│   └── lib/             # Action handlers (e.g., auth-actions)
├── public/              # Static assets
├── supabase/            # Supabase CLI config (project reference)
├── docs/                # Project documentation (generated)
├── .env                 # Environment variables (ignored)
├── next.config.ts
├── tsconfig.json
└── tailwind.config.js
```

## Routing & Pages
- `/` (Home) – `src/app/page.tsx`
- `/concept` – Learning concept overview
- **Auth** (`src/app/(auth)/`)
  - `/auth/login`, `/auth/signup`, `/auth/logout`, `/auth/callback`
- **Protected** (`src/app/(protected)/`):
  - `/dashboard`
  - `/courses`, `/courses/[id]`
  - `/assignment/[id]`
  - `/test/[id]`
  - `/glossary`
  - `/simulator`
  - `/certificate`
- Custom 404 – `src/app/(404)/page.tsx`

## Components
- **Layout** – Main site wrapper (header, nav, footer)
- **LoginLogoutButton** – Sign-in/out UI
- **UserGreetText** – Personalized greeting
- **CertificateModal** – Certificate download flow
- **AuthGuard / AuthGuard2** – Protect client routes
- **TestimonialSlider**, **Card**, etc.

## Supabase Integration
- **Client (Browser)**: `src/utils/supabase/client.ts` uses `createBrowserClient`
- **Server**: `src/utils/supabase/server.ts` uses `createServerClient`
- **Auth Actions**: `src/lib/auth-actions.ts` for signIn, signOut, session
- **Auth Callback Route**: `src/app/(auth)/auth/callback/route.ts`
- **Data Operations**: `supabase.from(<table>).select()`, `.insert()`, `.upsert()`

## Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`  
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
- *(optional)* `SUPABASE_SERVICE_KEY` for server-side operations

## Database Schema
> *Note: Exact migrations/SQL not included. The following tables are inferred from code references.*
- **profiles**  
- **courses**  
- **course_enrollments**  
- **course_wishlist**  
- **videos**  
- **video_watched**  
- **assessments**  
- **assessment_attempts**  
- **questions**  
- **question_options**  
- **user_answers**  
- **certificate_user**  
- **glossary**  
- **testimonials**  
- **concepts**

## Development & Deployment
1. Install dependencies: `npm install`
2. Run dev server: `npm run dev`
3. Build for production: `npm run build`
4. Deploy (e.g., Vercel)

## Next Steps
- Add Supabase migration files or SQL export for full column definitions
- Generate ER diagrams and detailed column/docs
- Expand component-level documentation and API reference
