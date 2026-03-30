# المحامية مي تونسي — Lawyer Mai Tunsy
## نظام إدارة القضايا القانونية المتكامل

A premium, production-ready legal case management system built with Next.js 15, Supabase, and TypeScript. Fully bilingual (Arabic RTL / English LTR), with dark/light mode, unique QR codes per case, and a secure public file-sharing page.

---

## ✨ Features

- **2 Admin Pages** — Dashboard + Cases (all details open in a premium drawer)
- **Case Drawer** — 6 tabs: Overview, Payments, Files, Notes, Activity, QR
- **Unique QR per Case** — Each case has its own secure token-based public link
- **Public Share Page** — Shows uploaded files only (no fees, no notes, no private data)
- **Arabic + English** — Full RTL/LTR support with instant language switching
- **Dark / Light Mode** — Premium design in both themes
- **Mobile Camera Upload** — Direct camera capture on mobile devices
- **Supabase Auth + RLS** — Row-level security on all tables

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Supabase (Auth, PostgreSQL, Storage) |
| QR | qrcode npm package |
| i18n | Custom context (AR/EN) |
| Theme | next-themes |

---

## 🚀 Setup Guide

### 1. Clone & Install

```bash
git clone https://github.com/yourorg/lawyer-mai-tunsy.git
cd lawyer-mai-tunsy
npm install
```

### 2. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) → New Project
2. Choose a region close to your users (e.g., EU West for Egypt/MENA)
3. Set a strong database password and save it

### 3. Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

Open `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Find these values in:
- Supabase Dashboard → Project Settings → API

### 4. Run Database Migrations

In the Supabase Dashboard → SQL Editor, run these files **in order**:

**Step 1:** Run `supabase/migrations/001_initial_schema.sql`
**Step 2:** Run `supabase/migrations/002_rls_policies.sql`

Or using the Supabase CLI:

```bash
npx supabase login
npx supabase link --project-ref your-project-id
npx supabase db push
```

### 5. Create the Storage Bucket

In Supabase Dashboard → Storage → New Bucket:

- **Name:** `case-files`
- **Public:** ❌ No (private bucket)
- Click **Create**

Then add storage policies via SQL Editor:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Auth users can upload case files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'case-files');

-- Allow authenticated users to read their files
CREATE POLICY "Auth users can read case files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'case-files');

-- Allow authenticated users to delete
CREATE POLICY "Auth users can delete case files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'case-files');

-- Allow service role to read (for signed URLs on public share page)
CREATE POLICY "Service role full access"
ON storage.objects FOR ALL
TO service_role
USING (true);
```

### 6. Create Your Admin User

In Supabase Dashboard → Authentication → Users → Invite user:

- Enter your email
- You'll receive a confirmation email
- Set your password

Or via SQL (for testing):

```sql
-- Run this in the SQL editor after your user signs up:
UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
```

### 7. Load Demo Data (Optional)

In Supabase SQL Editor, run `supabase/seed.sql`.

> **Note:** The seed script uses the first user in your `auth.users` table. Make sure you've created a user first.

### 8. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
lawyer-mai-tunsy/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx          # Protected admin layout
│   │   ├── page.tsx            # Dashboard page
│   │   └── cases/
│   │       └── page.tsx        # Cases list page
│   ├── login/
│   │   └── page.tsx            # Auth page
│   ├── share/
│   │   └── [token]/
│   │       ├── page.tsx        # Server: loads safe data
│   │       └── public-share-client.tsx  # Client: renders public page
│   ├── layout.tsx              # Root layout + providers
│   └── globals.css             # Design system tokens
│
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx         # Dark sidebar navigation
│   │   └── header.tsx          # Top bar with lang/theme controls
│   ├── dashboard/
│   │   └── stat-card.tsx       # KPI stat cards
│   ├── cases/
│   │   ├── case-drawer.tsx     # Main 6-tab drawer
│   │   ├── new-case-dialog.tsx # Create case modal
│   │   ├── edit-case-dialog.tsx
│   │   └── drawer-tabs/
│   │       ├── overview-tab.tsx
│   │       ├── payments-tab.tsx
│   │       ├── files-tab.tsx
│   │       ├── notes-tab.tsx
│   │       ├── activity-tab.tsx
│   │       └── qr-tab.tsx      # QR generation + settings
│   └── ui/                     # shadcn/ui components
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser Supabase client
│   │   └── server.ts           # Server Supabase client
│   ├── services/
│   │   └── cases.ts            # All data operations
│   ├── i18n/
│   │   └── translations.ts     # AR + EN dictionaries
│   └── utils/
│       ├── index.ts            # Formatting helpers
│       ├── qr.ts               # QR code generation
│       └── status.ts           # Case status constants
│
├── contexts/
│   └── language-context.tsx    # AR/EN context + hook
│
├── hooks/
│   └── use-toast.ts
│
├── types/
│   └── database.ts             # Full Supabase type definitions
│
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   └── 002_rls_policies.sql
│   └── seed.sql
│
├── middleware.ts               # Auth route protection
├── next.config.ts
├── tailwind.config.ts
└── .env.example
```

---

## 🔐 Security Model

| Layer | Protection |
|---|---|
| Admin routes | `middleware.ts` checks Supabase session |
| All tables | Row Level Security (RLS) enabled |
| Financial data | Never exposed to public routes |
| Public share | Token-based, server-side only, service role reads files |
| QR tokens | 64-char hex random, regeneratable (invalidates old link) |
| File URLs | Signed URLs with 1-hour expiry (not permanent public URLs) |

### What the public `/share/[token]` page shows:
- ✅ Uploaded files (with signed download URLs if enabled)
- ✅ Client name (optional toggle)
- ✅ Case title (optional toggle)
- ❌ Total fees
- ❌ Payments
- ❌ Notes
- ❌ Activity logs
- ❌ Any admin controls

---

## 🌍 Internationalization

The app defaults to **Arabic (RTL)**. Switch to English via the header language button.

Translations live in `lib/i18n/translations.ts`. To add a new language:

1. Add a new key to the `translations` object
2. Update the `Language` type
3. Add a toggle option in the header

---

## 📱 Mobile Support

- Fully responsive, mobile-first design
- Camera upload button uses `capture="environment"` for rear camera on mobile
- Touch-friendly controls throughout
- Sidebar collapses to a slide-in drawer on mobile

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

Set environment variables in Vercel Dashboard → Project Settings → Environment Variables.

Update `NEXT_PUBLIC_APP_URL` to your production domain.

### Self-hosted

```bash
npm run build
npm start
```

---

## 🔧 Common Issues

**QR code not generating?**
- Make sure `qrcode` npm package is installed: `npm install qrcode @types/qrcode`
- Check that `NEXT_PUBLIC_APP_URL` is set correctly

**Files not uploading?**
- Verify the `case-files` bucket exists in Supabase Storage
- Check storage RLS policies are applied
- Confirm `SUPABASE_SERVICE_ROLE_KEY` is set (used for signed URLs)

**Auth redirect loop?**
- Clear browser cookies/localStorage
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct

**Arabic text not displaying correctly?**
- The Google Fonts for Noto Naskh Arabic load from the CDN. Ensure internet access in development.

---

## 📄 License

Private — for use by Lawyer Mai Tunsy law office only.
