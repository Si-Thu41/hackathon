# Uni Pharma — Smart Warehouse

A Next.js 16 pharmacy operations dashboard for administrators and pharmacists.

## Overview

Uni Pharma integrates role-based access, inventory management, sales tracking, and AI-assisted prescription processing.

Key capabilities:
- Admin dashboard for branch inventory, revenue analytics, stock alerts, and staff access control
- Pharmacist portal for prescription fulfilment, pharmacy bookings, and sale recording
- AI-powered prescription parsing via OCR + OpenRouter/OpenAI
- AI business summary generation for inventory and revenue insights
- Clerk authentication with role metadata gating for admin and pharmacist views
- Supabase data backend for medicines, sales, bookings, and user sessions

## Technologies

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Clerk (`@clerk/nextjs`) for auth
- Supabase (`@supabase/supabase-js`, `@supabase/ssr`) for backend data
- OpenRouter/OpenAI for AI endpoints
- Recharts for dashboard graphs
- Tesseract.js for OCR uploads

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` with required values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-public-key
OPEN_ROUTER=your-openrouter-api-key
# Clerk vars (example names; set values from your Clerk app)
CLERK_FRONTEND_API=your-clerk-frontend-api
CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key
```

3. Run the app:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Available Scripts

- `npm run dev` — start the development server
- `npm run build` — build the production app
- `npm run start` — start the production server
- `npm run lint` — run ESLint

## App Structure

- `app/page.tsx` — landing page with Admin and Pharmacist portal selection
- `app/dashboard/page.tsx` — role-based dashboard routing
- `app/dashboard/adminPanel/` — admin inventory and analytics UI
- `app/dashboard/pharmacistPanel/` — pharmacist prescription, bookings, and sales UI
- `app/gemini/prescription.tsx` — prescription OCR + AI parsing UI
- `app/api/gemini-prescription/route.ts` — AI prescription parser endpoint
- `app/api/ai-summary/route.ts` — AI business summary generator endpoint
- `utils/supabase.ts` — Supabase client helpers

## Notes

- User roles are enforced by Clerk metadata and query parameters.
- The AI endpoints rely on `OPEN_ROUTER` and corresponding OpenRouter/OpenAI credentials.
- Inventory, sales, and booking data are stored in Supabase.

## Next Steps

- Add `.env.example` with sample variable names
- Configure Clerk roles and access policies
- Seed Supabase tables for medicines, sale items, and bookings (you can copy/paste the SQL from `database.sql`)
- Secure production API keys and review Supabase row-level security
