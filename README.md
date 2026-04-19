# Solve the Murders — AI Detective Game

A production-ready, AI-powered murder mystery game built with Next.js 15, Supabase, Claude API, and Stripe.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router) + Tailwind CSS |
| Auth + DB | Supabase (Auth, Postgres, RLS) |
| AI | Anthropic Claude (Sonnet for interrogation/tasks, Haiku for extraction/clues) |
| Payments | Stripe Checkout |
| Deploy | Vercel (recommended) |

---

## Quick Start

### 1. Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- An [Anthropic API](https://console.anthropic.com) key
- A [Stripe](https://stripe.com) account

### 2. Clone & Install

```bash
cd "Murder Mystery tool/solve-the-murders"
npm install
```

### 3. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in all values:

```bash
cp .env.local.example .env.local
```

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API (secret) |
| `ANTHROPIC_API_KEY` | console.anthropic.com → API Keys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → Developers → API keys |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → Webhooks → endpoint secret |
| `STRIPE_PRICE_ID` | Stripe Dashboard → Products → create a $9.99 one-time price |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` for dev |
| `ADMIN_EMAILS` | Comma-separated admin email addresses |

### 4. Set Up Supabase

#### A. Run Migration

In the Supabase SQL editor, paste and run the contents of:
```
supabase/migrations/001_initial_schema.sql
```

#### B. Seed Data

In the Supabase SQL editor, paste and run:
```
supabase/seed.sql
```

This creates all 5 cases with full suspect rosters and character data.

#### C. Storage (Optional)

If you want case cover images:
1. Create a public bucket called `case-images`
2. Upload images and set `cover_image_url` on each case

### 5. Set Up Stripe

#### A. Create a Product

In the Stripe Dashboard:
1. Products → Create product: "Solve the Murders — Full Access"
2. Price: $9.99 USD, one-time payment
3. Copy the Price ID → set as `STRIPE_PRICE_ID`

#### B. Configure Webhook

1. Stripe Dashboard → Developers → Webhooks → Add endpoint
2. URL: `https://your-domain.com/api/stripe/webhook`
3. Events to listen for:
   - `checkout.session.completed`
   - `checkout.session.expired`
4. Copy the signing secret → set as `STRIPE_WEBHOOK_SECRET`

For local development use the Stripe CLI:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### 6. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
solve-the-murders/
├── app/
│   ├── (auth)/            # Login, register, forgot-password, callback
│   ├── (game)/
│   │   ├── dashboard/     # Case board
│   │   └── case/[caseId]/
│   │       ├── page.tsx           # Case intro + rules gate
│   │       ├── investigate/       # Main investigation screen
│   │       └── solve/             # Solve submission (redirects to modal)
│   ├── payment/           # Stripe checkout + success
│   ├── admin/             # Admin panel (cases, suspects)
│   └── api/
│       ├── auth/signout/
│       ├── game/
│       │   ├── start-case/
│       │   ├── interrogate/       # AI interrogation + fact extraction
│       │   ├── run-task/          # Task engine
│       │   ├── get-clue/          # Hint system
│       │   ├── solve/             # Solution evaluation
│       │   └── chat-history/
│       ├── stripe/
│       │   ├── checkout/
│       │   └── webhook/
│       └── admin/
│           ├── cases/
│           └── suspects/
├── components/
│   ├── game/              # Investigation screen, chat, facts, solve modal
│   ├── admin/             # Case and suspect forms
│   └── ui/                # Shared UI primitives
├── lib/
│   ├── ai/prompts.ts      # All AI prompts (injection-hardened)
│   ├── game/              # Points engine + server actions
│   ├── supabase/          # Client, server, middleware
│   ├── stripe/
│   └── types/             # Database + game types
└── supabase/
    ├── migrations/        # SQL schema
    ├── seed.sql           # 5 cases with full character data
    └── functions/         # Edge function references
```

---

## Game Mechanics

### Detective Points

| Action | Effect |
|---|---|
| Start case | 25 points |
| Ask questions (interrogate) | +1 per new fact, +2 per high-relevance fact |
| Check alibis | −1 |
| Check records | −2 |
| Investigate scene | −3 |
| Tail suspect | −3 |
| Get clue | −2 |

When points reach 0: all tasks disabled. Only "Solve the Murder" remains.

### Solve System

- One attempt only
- Requires: killer name + motive + method
- Claude evaluates and returns a dramatic reveal

---

## Security

- **Solution fields never sent to client**: `solution_killer`, `solution_motive`, `solution_method` are only accessed server-side in API routes
- **Prompt injection protection**: User input is sanitized against known injection patterns before being passed to Claude
- **RLS**: Row-level security ensures users can only access their own progress, facts, and chat logs
- **Admin protection**: Admin routes require email-based allowlist (set `ADMIN_EMAILS` env var)
- **Stripe**: Payments are validated via webhook signature — never trust client-side success alone

---

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in Vercel, set all env vars
3. Deploy

### Supabase Edge Functions (Optional)

The Edge Functions in `supabase/functions/` are reference implementations. The app's Next.js API routes handle all AI calls directly. To deploy them anyway:

```bash
supabase functions deploy interrogate
supabase functions deploy extract-facts
supabase functions deploy resolve-task
supabase functions deploy generate-clue
```

---

## Cases Included

| # | Title | Difficulty | Access |
|---|---|---|---|
| 1 | Death at Glenwood Estate | Easy | Free |
| 2 | The Midnight Gallery | Medium | Free |
| 3 | The Silent Harbour | Medium | Free |
| 4 | Boardroom at Midnight | Hard | Premium |
| 5 | The Red Room Cipher | Hard | Premium |

Each case includes 5-6 characters with full personality, knowledge base, hidden truths, and reveal conditions.

---

## Admin Panel

Access at `/admin` — restricted to emails in `ADMIN_EMAILS`.

Features:
- Create / edit cases
- Add suspects with JSON knowledge bases and hidden truths
- Define solutions (never exposed to players)

---

## License

Private — all rights reserved.
