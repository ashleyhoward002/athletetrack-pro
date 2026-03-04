# AthleteTrack Pro 🏀🏈🎾🏐

**Multi-sport performance analytics SaaS for athletes, parents, and coaches.**

🔗 **Live:** [athletetrack-pro.vercel.app](https://athletetrack-pro.vercel.app)

---

## Overview

AthleteTrack Pro is a full-stack SaaS platform that helps athletes and their families track performance, monitor skill progression, and analyze game-day stats across multiple sports — including basketball, football, tennis, and volleyball.

Designed with a **dual-mode UI** for parents and coaches, the app provides real-time stat entry, skill tree progression, performance analytics dashboards, and a 5-tier subscription model with Stripe payments.

---

## Features

- **Multi-sport support** — Basketball, football, tennis, volleyball with sport-specific stat tracking
- **Dual-mode UI** — Separate parent-friendly and coach-facing dashboards
- **Skill tree progression** — Visual skill milestones per sport and position
- **Game-day stat entry** — Real-time stat capture with session tracking
- **Performance dashboards** — Charts and analytics on player progress over time
- **5-tier subscription model** — Free through Pro plans with Stripe payment integration
- **Video upload pipeline** — Game footage upload and storage
- **Mobile-first design** — Responsive UI with Tailwind CSS

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14, React, TypeScript, Tailwind CSS |
| **Backend** | Next.js API routes, Node.js |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth (magic links + Google OAuth) |
| **Payments** | Stripe (webhooks + subscription management) |
| **Deployment** | Vercel (frontend + API) |
| **Storage** | Supabase Storage (video uploads) |

---

## Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project
- A Stripe account (for payment features)

### Installation

```bash
git clone https://github.com/ashleyhoward002/athletetrack-pro.git
cd athletetrack-pro
npm install
```

### Environment Setup

Copy `env.sample` to `.env.local` and fill in your credentials:

```bash
cp env.sample .env.local
```

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` — Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Your Supabase anon key
- `STRIPE_SECRET_KEY` — Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET` — Your Stripe webhook secret

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
athletetrack-pro/
├── app/              # Next.js App Router pages and API routes
├── components/       # Reusable UI components
├── hooks/            # Custom React hooks
├── lib/              # Utility functions and Supabase client
├── sql/              # Database migration files
├── supabase/         # Supabase configuration
├── types/            # TypeScript type definitions
└── public/           # Static assets
```

---

## Sports Supported

- 🏀 **Basketball** — Points, rebounds, assists, FG%, shot tracking
- 🏈 **Football** — Passing yards, rushing stats, touchdowns, tackles
- 🎾 **Tennis** — Sets, games, serve stats, rally tracking
- 🏐 **Volleyball** — Kills, assists, digs, serve aces

---

## Built By

Ashley Howard — [github.com/ashleyhoward002](https://github.com/ashleyhoward002)
