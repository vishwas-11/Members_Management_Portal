# Church Member Registry

## Setup Instructions

### 1. Create Supabase Project
- Go to https://supabase.com and create a free account
- Create a new project
- Go to **Settings → API** and copy:
  - `Project URL` → paste as `NEXT_PUBLIC_SUPABASE_URL`
  - `anon public` key → paste as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Run the Database Schema
- In Supabase, go to **SQL Editor**
- Open and paste the entire contents of `supabase_schema.sql`
- Click **Run**

### 3. Configure Environment Variables
Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Enable Email Auth in Supabase
- Go to **Authentication → Providers**
- Make sure **Email** is enabled
- Under **Email Templates**, the magic link template is already configured

### 5. Set Redirect URL in Supabase
- Go to **Authentication → URL Configuration**
- Add to **Redirect URLs**: `http://localhost:3000/api/auth/callback`
- For production add: `https://your-app.vercel.app/api/auth/callback`

### 6. Run Locally
```bash
npm install
npm run dev
```

### 7. Make First Admin
- Register normally via the app
- In Supabase → **Table Editor → members**
- Find your row and change `role` from `member` to `admin`

### 8. Deploy to Vercel (Free)
```bash
# Push to GitHub first, then:
# 1. Go to vercel.com → Import your GitHub repo
# 2. Add environment variables in Vercel dashboard
# 3. Deploy
```

## Folder Structure
```
church-app/
├── app/
│   ├── api/auth/callback/   # Supabase auth callback
│   ├── login/               # Login with magic link
│   ├── register/            # 3-step member registration form
│   ├── dashboard/           # Member home page
│   ├── profile/             # Edit own profile
│   └── admin/               # Admin: member list + detail
├── components/ui/           # Shared UI components
├── lib/supabase/            # Supabase client (browser + server)
├── types/                   # TypeScript types
├── proxy.ts                 # Route protection + role redirect
└── supabase_schema.sql      # Run this in Supabase SQL Editor
```
