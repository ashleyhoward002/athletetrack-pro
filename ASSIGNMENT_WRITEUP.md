# AthleteTrack Pro - Assignment Write-Up

**Live URL:** https://athletetrack-pro.vercel.app/
**Student:** [Your Name]
**Course:** Full-Stack NLP Application with RAG Chatbot & Supabase Integration

---

## Application Overview

**AthleteTrack Pro** is a comprehensive athletic performance tracking platform designed for sports parents and coaches. Users can track game statistics across 6 sports (basketball, baseball, soccer, football, tennis, volleyball), receive AI-powered coaching advice, analyze athletic form via video uploads, and manage athlete profiles. The RAG-powered AI Coach provides contextual training advice based on sport-specific knowledge bases.

---

## Requirements Mapping

| Requirement | Implementation Location | How to Test |
|-------------|------------------------|-------------|
| **1. Auth & Roles** | `/login`, `/signup`, Sidebar (admin badge) | See test credentials below |
| **2. User Profile** | `/dashboard/profile` | Edit name, bio, avatar; refresh to verify persistence |
| **3. Supabase Database** | 15+ tables with RLS, pgvector enabled | Schema listed below |
| **4. Advanced UI** | Dashboard page components | See component list below |
| **5. Edge Functions** | `generate-embeddings` function | Triggered when loading knowledge base |
| **6. MCP Integration** | Supabase MCP used throughout development | Used for migrations, SQL, Edge Function deployment |
| **7. RAG Chatbot** | `/dashboard` → AI Coach panel | See example questions below |

---

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@test.com | Test123! |
| Member | member@test.com | Test123! |

*Note: Create these accounts via signup, then manually set role to 'admin' in Supabase profiles table for admin account.*

---

## Database Schema (Key Tables)

| Table | Purpose | RLS |
|-------|---------|-----|
| `profiles` | User profiles with role (admin/coach/member), bio, avatar | ✅ |
| `documents` | RAG knowledge base with pgvector embeddings | ✅ |
| `athletes` | Athlete profiles linked to users | ✅ |
| `games` | Game statistics across all sports | ✅ |
| `training_resources` | YouTube videos and playbook links | ✅ |
| `form_analyses` | Video form analysis results | ✅ |
| `drills` | Training drill library | ✅ |
| `skill_trees` / `skill_nodes` | Gamified skill progression | ✅ |

**pgvector:** Enabled on `documents` table with `embedding vector(768)` column for semantic search.

---

## Advanced UI Components (21st.dev / ReactBits)

| Component | Source | Location |
|-----------|--------|----------|
| **SplitText** | ReactBits Text Animations | Dashboard header - animated text reveal with blur effect |
| **CountUp** | 21st.dev Numbers | Stats cards - animated number counters on scroll |
| **AnimatedCard** | 21st.dev Cards | Stats overview - 3D tilt + glow effect on hover |
| **ShinyButton** | ReactBits Buttons | "Drill Library" button - animated shimmer effect |

All components are in `/components/ui/` and functionally integrated into the dashboard workflow.

---

## Supabase Edge Function

| Function Name | Purpose | Trigger |
|---------------|---------|---------|
| `generate-embeddings` | Generates text embeddings using Gemini text-embedding-004 API | Called when uploading documents or seeding knowledge base |

**Location:** `supabase/functions/generate-embeddings/index.ts`

The Edge Function accepts text, calls the Gemini API (key stored in Supabase secrets), and returns a 768-dimension vector for storage in pgvector.

---

## MCP Server Integration

**Supabase MCP Server** was used throughout development for:
- Applying database migrations (`apply_migration`)
- Executing SQL queries (`execute_sql`)
- Deploying Edge Functions (`deploy_edge_function`)
- Managing storage buckets and RLS policies
- Listing and inspecting tables (`list_tables`)

This integration enabled rapid database iteration directly from the development environment without switching to the Supabase dashboard.

---

## RAG Chatbot Testing

### How It Works
1. User clicks "Load Sports Knowledge Base" on Dashboard
2. Selects their sport(s) (basketball, soccer, football, etc.)
3. System chunks content, generates embeddings via Edge Function, stores in `documents` table
4. User asks questions in AI Coach panel
5. System performs similarity search via pgvector, retrieves top-k relevant chunks
6. Sends context + question to LLM for contextual response

### Example Questions (Test These!)

| Question | Expected Behavior |
|----------|-------------------|
| "How do I improve my shooting form?" | Returns BEEF method, arc tips, common mistakes from basketball guide |
| "What's the proper tackling technique in football?" | Returns tackling fundamentals, safety tips, form breakdown |
| "Give me a good warm-up routine" | Returns dynamic warm-up protocol from conditioning guide |
| "How do I serve in volleyball?" | Returns underhand, float serve, and topspin serve techniques |
| "What are good dribbling drills for soccer?" | Returns close control tips, 1v1 moves, practice recommendations |

### Knowledge Base Contents
Pre-built guides for: Basketball, Baseball, Soccer, Football, Tennis, Volleyball, and General Conditioning. Each contains fundamentals, techniques, drills, and common mistakes.

---

## Step-by-Step Testing Guide

1. **Auth & Roles:** Sign up → Login → Check sidebar shows your email → (For admin: verify "Admin" badge appears next to name)

2. **Profile:** Click "Profile" in sidebar → Edit full name, bio → Upload avatar or select color → Save → Refresh page → Verify changes persisted

3. **RAG Chatbot:**
   - Go to Dashboard → Find "Knowledge Base" card
   - Select your sport(s) → Click "Load X Guides"
   - Wait for success message
   - In AI Coach panel, ask: "How do I improve my shooting form?"
   - Verify response includes specific techniques from the loaded guide

4. **Edge Function:** The `generate-embeddings` function is automatically called during step 3. Check Supabase Edge Function logs to verify execution.

5. **Advanced UI:** On Dashboard, observe:
   - "Dashboard" title animates in with blur effect (SplitText)
   - Stats numbers count up when scrolled into view (CountUp)
   - Hover over stat cards to see 3D tilt effect (AnimatedCard)
   - "Drill Library" button has shimmer animation (ShinyButton)

---

*Built with Next.js 14, Supabase, Tailwind CSS, DaisyUI, and Gemini AI*
