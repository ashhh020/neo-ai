# NeoHomeo AI — Progress Tracker

## Legend
- ✅ Done  
- 🔄 In Progress  
- ⬜ Todo  
- 🚫 Blocked

---

## Phase 1 — Supabase Real Auth 🔄

### What's built
- ✅ `lib/supabase/client.ts` — browser Supabase client
- ✅ `lib/supabase/server.ts` — server-side Supabase client (SSR)
- ✅ `middleware.ts` — auth guard + role-based redirect
- ✅ `app/auth/callback/route.ts` — OAuth callback handler
- ✅ `app/login/page.tsx` — email + Google sign-in (NO Apple/GitHub/Microsoft)
- ✅ `app/register/page.tsx` — role picker at signup (Student/Practitioner/Educator/Admin)
- ✅ `types/database.ts` — full Supabase DB types
- ✅ `scripts/migrate.sql` — complete schema SQL (run in Supabase dashboard)

### To activate real auth (YOU need to do this):
1. Go to https://supabase.com/dashboard/project/emutdiiqfhbsfkdnkdfb/settings/api
2. Copy the **anon/public** key
3. Paste into `.env.local` → `NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-key>`
4. Go to https://supabase.com/dashboard/project/emutdiiqfhbsfkdnkdfb/sql
5. Run the SQL in `scripts/migrate.sql`
6. Go to Authentication → Providers → Enable **Google** (add OAuth credentials from Google Cloud Console)
7. Set redirect URL to: `https://emutdiiqfhbsfkdnkdfb.supabase.co/auth/v1/callback`

### Seed demo users (run in Supabase SQL editor after migration):
```sql
-- Demo users are created when they sign up — role stored in profiles table
-- To manually add: INSERT INTO profiles (id, email, name, role) VALUES (...)
```

---

## Phase 2 — Silica Glassmorphism Theme ✅

- ✅ `app/globals.css` — silica CSS variables, grain overlay, glass blur
- ✅ `components/shared/RefractionCursor.tsx` — mouse-follow cursor blob  
- ✅ `components/ui/shard.tsx` — glass card primitive
- ✅ `app/layout.tsx` — global cursor + ThemeProvider
- ✅ Plus Jakarta Sans + JetBrains Mono fonts
- ✅ `.shard` class: backdrop-filter blur(24px) saturate(160%)

---

## Phase 3 — Student Dashboard ✅

- ✅ `app/student/page.tsx` — stats, remedy of day, quiz, achievements
- ✅ `app/student/layout.tsx` — transparent body, sidebar
- ✅ `components/layout/StudentSidebar.tsx` — glass sidebar, nav groups
- ✅ `components/layout/TopBar.tsx` — glass header

---

## Phase 4 — All Student Pages ✅

- ✅ `app/student/chat/page.tsx` — ChatGPT-style chat with thread sidebar
- ✅ `app/student/chat/history/page.tsx` — thread list with search + delete
- ✅ `app/student/materia-medica-tutor/page.tsx` — MM mode AI chat
- ✅ `app/student/notes/page.tsx` — CRUD notes with tags + colors
- ✅ `app/student/saved-cases/page.tsx` — saved repertory cases
- ✅ `app/student/saved-remedies/page.tsx` — bookmarked remedies grid
- ✅ `app/student/saved-rubrics/page.tsx` — saved rubrics with grade display
- ✅ `app/student/research/page.tsx` — searchable doc library
- ✅ `app/student/settings/page.tsx` — profile, notifications, sign out

### Todo:
- ⬜ `app/student/flashcards/page.tsx` — spaced repetition card flipper
- ⬜ `app/student/quiz/page.tsx` — MCQ quiz engine with scoring
- ⬜ `app/student/materia-medica/page.tsx` — full MM browser (by remedy/author)

---

## Phase 5 — Repertory Tool (Kent) ✅

- ✅ `lib/repertory-data.ts` — 70+ rubrics across 17 chapters (Kent public domain)
- ✅ `app/student/repertory/page.tsx` — full oorep-style interface:
  - ✅ Multi-word search + exclusion with `-word`
  - ✅ Chapter filter tabs (Mind, Head, Eye, Nose, Stomach, Generals…)
  - ✅ Add to case + weight (1/2/3)
  - ✅ Top remedies ranked bar chart
  - ✅ Repertorisation grid (rows=rubrics, cols=remedies, grade cells, total score)
  - ✅ MM info panel per rubric
  - ✅ Quick-search chips

### Todo:
- ⬜ Expand rubric DB to 500+ rubrics (all Kent chapters)
- ⬜ Save case to Supabase (requires Phase 1 activation)
- ⬜ Load saved cases from DB
- ⬜ Patient demographics form (age, sex, chief complaint)
- ⬜ Export case as PDF

---

## Phase 6 — AI Chat (ChatGPT Style) ✅

- ✅ `app/student/chat/page.tsx` — left thread list + centered conversation + sticky composer
- ✅ `components/shared/MessageRenderer.tsx` — structured output renderer:
  - ✅ Tables (pipe format)
  - ✅ Bullet + numbered lists
  - ✅ Aphorism blockquotes (§153: …)
  - ✅ Remedy cards
  - ✅ No raw hashtags or asterisks
- ✅ `app/api/dr-neo/route.ts` — Groq LLaMA 70B with mode-specific system prompts
- ✅ 6 chat modes: General, Materia Medica, Organon, Repertory, Clinical, Research
- ✅ Auto-growing textarea, Shift+Enter for newline

### To activate Groq AI:
1. Get API key from https://console.groq.com
2. Add to `.env.local` → `GROQ_API_KEY=<your-key>`

---

## Phase 7 — Doctor Dashboard ⬜

- ⬜ `app/doctor/page.tsx` — practitioner dashboard
- ⬜ `app/doctor/layout.tsx` — doctor sidebar
- ⬜ `components/layout/DoctorSidebar.tsx`
- ⬜ `app/doctor/patients/page.tsx` — patient list
- ⬜ `app/doctor/cases/page.tsx` — case management
- ⬜ `app/doctor/repertory/page.tsx` — practitioner repertory

---

## Phase 8 — Educator / Patient Dashboard ⬜

- ⬜ `app/patient/page.tsx` — educator dashboard
- ⬜ Course management, lesson planner
- ⬜ Student roster view

---

## Phase 9 — Admin Portal ⬜

- ⬜ `app/admin/page.tsx` — admin dashboard
- ⬜ User management (list, role change, suspend)
- ⬜ Content management (remedies, docs)
- ⬜ Analytics overview

---

## Phase 10 — Landing Page ⬜

- ⬜ `app/page.tsx` — marketing landing page with Silica theme
- ⬜ Hero, features, pricing, CTA

---

## Env Variables Required

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://emutdiiqfhbsfkdnkdfb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<get from Supabase dashboard>
GROQ_API_KEY=<get from console.groq.com>
```

---

## Role → Dashboard Mapping

| Role | Dashboard | Redirect |
|------|-----------|----------|
| Student | /student | Learning, chat, repertory |
| Practitioner | /doctor | Patient cases, clinical tools |
| Educator | /patient | Course management |
| Admin | /admin | Platform management |

*Researcher role has been removed. All roles chosen at SIGNUP only.*
