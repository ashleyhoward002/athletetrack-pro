import { SportId } from "@/lib/sports/config";

export interface GameRow {
  id: string;
  user_id: string;
  athlete_id: string | null;
  season_id: string | null;
  date: string;
  opponent: string;
  sport: SportId;
  stats: Record<string, number>;
  // Legacy basketball columns (kept for backward compat)
  minutes?: number;
  points?: number;
  fg_made?: number;
  fg_attempted?: number;
  three_made?: number;
  three_attempted?: number;
  ft_made?: number;
  ft_attempted?: number;
  rebounds_off?: number;
  rebounds_def?: number;
  assists?: number;
  steals?: number;
  blocks?: number;
  turnovers?: number;
  fouls?: number;
  created_at: string;
  // Joined relations
  athletes?: { id: string; name: string } | null;
  seasons?: { id: string; name: string } | null;
}

export interface GameFormData {
  sport: SportId;
  date: string;
  opponent: string;
  athlete_id?: string;
  season_id?: string;
  stats: Record<string, string>; // string because form inputs are strings
}

export interface GameCreatePayload {
  sport: SportId;
  date: string;
  opponent: string;
  athlete_id?: string;
  season_id?: string;
  stats: Record<string, number>;
}
