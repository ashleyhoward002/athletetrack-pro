import { SportId } from "@/lib/sports/config";

// ============================================================
// Skill Trees
// ============================================================

export interface SkillTree {
  id: string;
  sport: SportId;
  name: string;
  description: string | null;
  icon: string | null;
  display_order: number;
}

export interface SkillNode {
  id: string;
  tree_id: string;
  name: string;
  description: string | null;
  level: number;
  xp_required: number;
  prerequisites: string[];
  stat_keys: string[];
  icon: string | null;
  display_order: number;
}

export interface SkillNodeWithProgress extends SkillNode {
  progress: AthleteSkillProgress | null;
}

export interface SkillTreeWithNodes extends SkillTree {
  skill_nodes: SkillNodeWithProgress[];
}

export interface AthleteSkillProgress {
  id: string;
  user_id: string;
  skill_node_id: string;
  status: "locked" | "available" | "in_progress" | "completed";
  xp_earned: number;
  completed_at: string | null;
}

// ============================================================
// Workout Programs
// ============================================================

export interface WorkoutProgram {
  id: string;
  user_id: string;
  sport: SportId;
  name: string;
  description: string | null;
  difficulty: "Rookie" | "Pro" | "All-Star";
  duration_weeks: number;
  is_ai_generated: boolean;
  source: "custom" | "ai" | "curated";
  status: "active" | "paused" | "completed" | "archived";
  created_at: string;
  updated_at: string;
  program_days?: ProgramDay[];
}

export interface ProgramDay {
  id: string;
  program_id: string;
  day_number: number;
  week_number: number;
  name: string | null;
  rest_day: boolean;
  program_day_drills?: ProgramDayDrill[];
}

export interface ProgramDayDrill {
  id: string;
  program_day_id: string;
  drill_id: string;
  order_index: number;
  sets_override: number | null;
  reps_override: number | null;
  notes: string | null;
  drills?: DrillRow;
}

export interface DrillRow {
  id: string;
  name: string;
  category: string;
  difficulty: string;
  description: string;
  video_url: string | null;
  sport: SportId;
  duration_minutes: number;
  equipment: string[];
  sets: number;
  reps: number;
  xp_reward: number;
  skill_node_ids: string[];
  is_curated: boolean;
  user_id: string | null;
}

export interface DrillCompletion {
  id: string;
  user_id: string;
  drill_id: string;
  program_day_id: string | null;
  completed_at: string;
  duration_seconds: number | null;
  notes: string | null;
  rating: number | null;
  xp_earned: number;
}

// ============================================================
// Form Analysis
// ============================================================

export interface FormAnalysisFeedback {
  overall_score: number;
  strengths: string[];
  improvements: string[];
  detailed_analysis: string;
  drill_recommendations: string[];
}

export interface FormAnalysis {
  id: string;
  user_id: string;
  sport: SportId;
  analysis_type: string;
  video_url: string;
  video_thumbnail_url: string | null;
  status: "processing" | "completed" | "failed";
  ai_feedback: FormAnalysisFeedback | null;
  overall_score: number | null;
  created_at: string;
}

// ============================================================
// Challenges & Achievements
// ============================================================

export interface Challenge {
  id: string;
  sport: SportId | null;
  name: string;
  description: string;
  type: "daily" | "weekly" | "milestone";
  criteria: { metric: string; target: number; timeframe?: string };
  xp_reward: number;
  badge_id: string | null;
  is_active: boolean;
}

export interface AthleteChallenge {
  id: string;
  user_id: string;
  challenge_id: string;
  progress: number;
  target: number;
  status: "active" | "completed" | "expired";
  started_at: string;
  completed_at: string | null;
  challenges?: Challenge;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "streak" | "skill" | "challenge" | "milestone";
  rarity: "common" | "rare" | "epic" | "legendary";
}

export interface AthleteBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  badges?: Badge;
}

export interface AthleteStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  total_xp: number;
  level: number;
}

// ============================================================
// Training Plans & Skill Ratings
// ============================================================

export interface TrainingPlanAnalysis {
  weaknesses: { area: string; score: number; detail: string }[];
  strengths: { area: string; score: number; detail: string }[];
  focus_areas: string[];
}

export interface TrainingPlan {
  id: string;
  user_id: string;
  sport: SportId;
  name: string;
  ai_analysis: TrainingPlanAnalysis | null;
  program_id: string | null;
  status: "active" | "completed" | "archived";
  created_at: string;
  updated_at: string;
  workout_programs?: WorkoutProgram;
}

export interface SkillRating {
  id: string;
  user_id: string;
  sport: SportId;
  skill_area: string;
  rating: number;
  source: "ai" | "manual" | "game_derived";
  assessed_at: string;
}

// ============================================================
// Leaderboard
// ============================================================

export type LeaderboardCategory = "xp" | "streaks" | "drills" | "badges";
export type LeaderboardTimePeriod = "all_time" | "weekly" | "monthly";

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  total_xp?: number;
  level?: number;
  drill_count?: number;
  drills_completed?: number;
  total_xp_earned?: number;
  current_streak?: number;
  longest_streak?: number;
  badges_earned?: number;
}

export interface LeaderboardFilters {
  category: LeaderboardCategory;
  timePeriod: LeaderboardTimePeriod;
  sport: SportId | null;
  teamId: string | null;
}

export interface UserRank {
  rank: number;
  value: number;
}

// ============================================================
// Teams
// ============================================================

export type TeamRole = "owner" | "admin" | "member";

export interface Team {
  id: string;
  name: string;
  description: string | null;
  sport: SportId | null;
  invite_code: string;
  created_by: string;
  avatar_url: string | null;
  max_members: number;
  created_at: string;
  updated_at: string;
  member_count?: number;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: TeamRole;
  joined_at: string;
  display_name?: string;
  avatar_url?: string | null;
}

// ============================================================
// XP & Leveling Helpers
// ============================================================

export function calculateLevel(totalXp: number): number {
  return Math.floor(Math.sqrt(totalXp / 100)) + 1;
}

export function xpForLevel(level: number): number {
  return (level - 1) * (level - 1) * 100;
}

export function xpToNextLevel(totalXp: number): {
  currentLevel: number;
  xpInCurrentLevel: number;
  xpNeededForNext: number;
  progress: number;
} {
  const currentLevel = calculateLevel(totalXp);
  const currentLevelXp = xpForLevel(currentLevel);
  const nextLevelXp = xpForLevel(currentLevel + 1);
  const xpInCurrentLevel = totalXp - currentLevelXp;
  const xpNeededForNext = nextLevelXp - currentLevelXp;
  return {
    currentLevel,
    xpInCurrentLevel,
    xpNeededForNext,
    progress: xpNeededForNext > 0 ? xpInCurrentLevel / xpNeededForNext : 0,
  };
}
