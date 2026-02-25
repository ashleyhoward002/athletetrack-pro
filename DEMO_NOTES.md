# AthleteTrack Pro - Demo Notes

## Test Logins

| Role | Email | Password |
|------|-------|----------|
| **Parent** | parent@test.com | Test123! |
| **Coach** | coach@test.com | Test123! |
| **Admin** | admin@test.com | Test123! |

**Live URL:** https://athletetrack-pro.vercel.app

---

## Sample Data (Parent Account)

**Athletes:**
- Marcus Johnson (Basketball) - 14 games, 31 pts season high
- Sophia Johnson (Soccer) - 14 games, hat trick game
- Ethan Johnson (Baseball) - 10 games, grand slam

**Stats Highlights:**
- 38 total games tracked
- 12 upcoming scheduled games
- 16 badges earned (including "Grand Slam Master" legendary)
- Physical metrics tracked over 3 months showing improvement

---

## Features to Demo

1. **Auth & Roles** - Login, signup, forgot password, role switching
2. **Multi-Athlete Management** - Add/edit athletes, track multiple kids
3. **Game Stats** - Log games with sport-specific stats (points, goals, hits, etc.)
4. **Physical Metrics** - Track height, weight, vertical jump over time
5. **Gamification** - Badges, streaks, XP system
6. **Scheduled Games** - Upcoming games calendar
7. **AI Coach** - RAG chatbot (load knowledge base first)
8. **Animated UI** - SplitText, CountUp, AnimatedCard, ShinyButton

---

## Advanced UI Components (21st.dev / ReactBits)

| Component | Where to See It |
|-----------|-----------------|
| **SplitText** | Dashboard header - animated text with blur |
| **CountUp** | Stats cards - numbers animate on scroll |
| **AnimatedCard** | Stats overview - 3D tilt + glow on hover |
| **ShinyButton** | "Drill Library" button - shimmer effect |

---

## Tech Stack

- **Frontend:** Next.js 14, Tailwind CSS, DaisyUI
- **Backend:** Supabase (Postgres, Auth, Edge Functions)
- **AI:** Gemini API for embeddings, RAG chatbot
- **Database:** 15+ tables with RLS, pgvector for semantic search
- **Deployment:** Vercel

---

## AI Coach Demo (if time permits)

1. Go to Dashboard → Knowledge Base card
2. Select sports → Click "Load Guides"
3. Ask: "How do I improve my shooting form?"

---

## Key Talking Points

- **Problem:** Parents struggle to track multiple kids across different sports
- **Solution:** One platform for all athletes, all sports, all stats
- **Differentiator:** AI-powered coaching advice based on sport-specific knowledge
- **Security:** Row Level Security ensures users only see their own data

---

## Database Schema (Key Tables)

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles with role (admin/coach/member) |
| `athletes` | Athlete profiles linked to users |
| `games` | Game statistics across all sports |
| `documents` | RAG knowledge base with pgvector embeddings |
| `physical_metrics` | Height, weight, vertical jump tracking |
| `scheduled_games` | Upcoming games calendar |
| `badges` / `athlete_badges` | Gamification badges |
| `seasons` | Season organization |

---

## Edge Functions

| Function | Purpose |
|----------|---------|
| `generate-embeddings` | Creates embeddings via Gemini API |
| `ai-coach` | RAG chatbot responses |
| `create-test-user` | Test account creation |

---

## MCP Server Integration

Supabase MCP Server used for:
- Database migrations
- SQL queries
- Edge Function deployment
- RLS policy management
