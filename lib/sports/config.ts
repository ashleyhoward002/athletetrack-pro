// ============================================================
// Multi-Sport Configuration Module
// ============================================================
// This is the single source of truth for all sport-specific
// stat fields, positions, computed stats, chart definitions,
// and display configurations. Every component reads from here.
// ============================================================

export type SportId = "basketball" | "baseball" | "soccer" | "football" | "tennis" | "volleyball";

export interface StatFieldDef {
  key: string;
  label: string;
  shortLabel: string;
  type: "integer" | "decimal";
  group: string;
  max?: number;
  description: string;
  howToTrack?: string;
}

export interface ComputedStatDef {
  key: string;
  label: string;
  shortLabel: string;
  description: string;
  compute: (stats: Record<string, number>) => number;
  format: (value: number) => string;
}

export interface AverageCardDef {
  key: string;
  label: string;
  description: string;
  statKey: string; // the raw stat key to sum, or 'computed'
  compute: (totals: Record<string, number>, gameCount: number) => number;
  format: (value: number) => string;
}

export interface ChartLineDef {
  dataKey: string;
  label: string;
  color: string;
  compute: (stats: Record<string, number>) => number;
}

export interface TableColumnDef {
  key: string;
  label: string;
  description: string;
  compute: (stats: Record<string, number>) => string | number;
}

export interface FormAnalysisTypeDef {
  key: string;
  label: string;
  description: string;
  promptTemplate: string;
}

export interface SkillAreaDef {
  key: string;
  label: string;
  description: string;
  relatedStatKeys: string[];
  computeRating: (stats: Record<string, number>, gameCount: number) => number;
}

export interface ChallengeTemplateDef {
  name: string;
  description: string;
  type: "daily" | "weekly" | "milestone";
  criteria: { metric: string; target: number; timeframe?: string };
  xp_reward: number;
}

export interface SportConfig {
  id: SportId;
  name: string;
  icon: string;
  positions: string[];
  statFields: StatFieldDef[];
  computedStats: ComputedStatDef[];
  averageCards: AverageCardDef[];
  trendChartLines: ChartLineDef[];
  percentageChartLines: ChartLineDef[];
  tableColumns: TableColumnDef[];
  drillCategories: string[];
  formAnalysisTypes: FormAnalysisTypeDef[];
  skillAreas: SkillAreaDef[];
  challengeTemplates: ChallengeTemplateDef[];
}

// ============================================================
// BASKETBALL
// ============================================================
const basketballConfig: SportConfig = {
  id: "basketball",
  name: "Basketball",
  icon: "🏀",
  positions: ["PG", "SG", "SF", "PF", "C"],
  statFields: [
    // Game Info
    { key: "minutes", label: "Minutes", shortLabel: "MIN", type: "integer", group: "Game", description: "Total minutes the player was on the court.", howToTrack: "Use a stopwatch or check the scorebook for substitution times." },
    { key: "points", label: "Points", shortLabel: "PTS", type: "integer", group: "Game", description: "Total points scored. A regular basket is 2 points, a three-pointer is 3, and a free throw is 1.", howToTrack: "Count from the scoreboard or add up: (FG Made x 2) + (3PT Made x 3) + (FT Made)." },
    // Shooting
    { key: "fg_made", label: "FG Made", shortLabel: "FGM", type: "integer", group: "Shooting", description: "Field goals made — any basket scored from the floor (includes 2-pointers and 3-pointers).", howToTrack: "Mark a tally each time the player's shot goes in." },
    { key: "fg_attempted", label: "FG Attempted", shortLabel: "FGA", type: "integer", group: "Shooting", description: "Total shot attempts from the floor (made + missed, not counting free throws).", howToTrack: "Mark a tally for every shot taken, whether it goes in or not." },
    { key: "three_made", label: "3PT Made", shortLabel: "3PM", type: "integer", group: "Shooting", description: "Three-pointers made — baskets scored from behind the three-point arc.", howToTrack: "Tally each made shot from behind the arc." },
    { key: "three_attempted", label: "3PT Attempted", shortLabel: "3PA", type: "integer", group: "Shooting", description: "Total three-point shot attempts (made + missed).", howToTrack: "Tally every shot taken from behind the arc." },
    { key: "ft_made", label: "FT Made", shortLabel: "FTM", type: "integer", group: "Shooting", description: "Free throws made — successful shots from the free-throw line after a foul.", howToTrack: "Count each free throw that goes in." },
    { key: "ft_attempted", label: "FT Attempted", shortLabel: "FTA", type: "integer", group: "Shooting", description: "Total free throw attempts (made + missed).", howToTrack: "Count each time the player steps to the line for a free throw." },
    // Rebounds
    { key: "rebounds_off", label: "Off. Rebounds", shortLabel: "OREB", type: "integer", group: "Rebounds", description: "Offensive rebounds — grabbing the ball after a missed shot by your own team, giving another chance to score.", howToTrack: "Tally when the player grabs a rebound on the opponent's basket end." },
    { key: "rebounds_def", label: "Def. Rebounds", shortLabel: "DREB", type: "integer", group: "Rebounds", description: "Defensive rebounds — grabbing the ball after a missed shot by the opposing team.", howToTrack: "Tally when the player grabs a rebound on your own basket end." },
    // Other
    { key: "assists", label: "Assists", shortLabel: "AST", type: "integer", group: "Other", description: "A pass that directly leads to a teammate scoring a basket.", howToTrack: "Tally when a player's pass leads directly to a made basket." },
    { key: "steals", label: "Steals", shortLabel: "STL", type: "integer", group: "Other", description: "Taking the ball away from an opposing player through a deflection or interception.", howToTrack: "Tally when the player takes the ball from an opponent." },
    { key: "blocks", label: "Blocks", shortLabel: "BLK", type: "integer", group: "Other", description: "Deflecting an opponent's shot attempt, preventing it from reaching the basket.", howToTrack: "Tally when the player swats away an opponent's shot." },
    { key: "turnovers", label: "Turnovers", shortLabel: "TO", type: "integer", group: "Other", description: "Losing possession of the ball to the other team (bad pass, travel, stolen ball, etc.).", howToTrack: "Tally each time the player loses the ball to the other team." },
    { key: "fouls", label: "Fouls", shortLabel: "PF", type: "integer", group: "Other", description: "Personal fouls — illegal physical contact with an opponent (pushing, holding, hitting).", howToTrack: "The referee will signal fouls; tally each one called on the player." },
  ],
  computedStats: [
    {
      key: "fg_pct",
      label: "FG%",
      shortLabel: "FG%",
      description: "Field goal percentage — the fraction of floor shots that went in. Higher is better; 45%+ is strong for youth.",
      compute: (s) => s.fg_attempted > 0 ? (s.fg_made / s.fg_attempted) * 100 : 0,
      format: (v) => v.toFixed(1) + "%",
    },
    {
      key: "three_pct",
      label: "3PT%",
      shortLabel: "3P%",
      description: "Three-point percentage — fraction of three-point shots made. 30%+ is solid for youth players.",
      compute: (s) => s.three_attempted > 0 ? (s.three_made / s.three_attempted) * 100 : 0,
      format: (v) => v.toFixed(1) + "%",
    },
    {
      key: "ft_pct",
      label: "FT%",
      shortLabel: "FT%",
      description: "Free throw percentage — fraction of free throws made. 70%+ is a good target.",
      compute: (s) => s.ft_attempted > 0 ? (s.ft_made / s.ft_attempted) * 100 : 0,
      format: (v) => v.toFixed(1) + "%",
    },
    {
      key: "total_rebounds",
      label: "Total Rebounds",
      shortLabel: "REB",
      description: "Offensive + defensive rebounds combined.",
      compute: (s) => (s.rebounds_off || 0) + (s.rebounds_def || 0),
      format: (v) => v.toFixed(0),
    },
  ],
  averageCards: [
    {
      key: "ppg", label: "PPG", description: "Points Per Game — average points scored each game.", statKey: "points",
      compute: (totals, n) => n > 0 ? totals.points / n : 0,
      format: (v) => v.toFixed(1),
    },
    {
      key: "rpg", label: "RPG", description: "Rebounds Per Game — average rebounds grabbed each game.", statKey: "computed",
      compute: (totals, n) => n > 0 ? ((totals.rebounds_off || 0) + (totals.rebounds_def || 0)) / n : 0,
      format: (v) => v.toFixed(1),
    },
    {
      key: "apg", label: "APG", description: "Assists Per Game — average assists each game.", statKey: "assists",
      compute: (totals, n) => n > 0 ? totals.assists / n : 0,
      format: (v) => v.toFixed(1),
    },
    {
      key: "fg_pct", label: "FG%", description: "Overall field goal percentage across all games.", statKey: "computed",
      compute: (totals) => totals.fg_attempted > 0 ? (totals.fg_made / totals.fg_attempted) * 100 : 0,
      format: (v) => v.toFixed(1) + "%",
    },
    {
      key: "ft_pct", label: "FT%", description: "Overall free throw percentage across all games.", statKey: "computed",
      compute: (totals) => totals.ft_attempted > 0 ? (totals.ft_made / totals.ft_attempted) * 100 : 0,
      format: (v) => v.toFixed(1) + "%",
    },
  ],
  trendChartLines: [
    { dataKey: "points", label: "PTS", color: "#6366f1", compute: (s) => s.points || 0 },
    { dataKey: "rebounds", label: "REB", color: "#22c55e", compute: (s) => (s.rebounds_off || 0) + (s.rebounds_def || 0) },
    { dataKey: "assists", label: "AST", color: "#f59e0b", compute: (s) => s.assists || 0 },
  ],
  percentageChartLines: [
    { dataKey: "fg_pct", label: "FG%", color: "#6366f1", compute: (s) => s.fg_attempted > 0 ? (s.fg_made / s.fg_attempted) * 100 : 0 },
    { dataKey: "three_pct", label: "3P%", color: "#22c55e", compute: (s) => s.three_attempted > 0 ? (s.three_made / s.three_attempted) * 100 : 0 },
    { dataKey: "ft_pct", label: "FT%", color: "#f59e0b", compute: (s) => s.ft_attempted > 0 ? (s.ft_made / s.ft_attempted) * 100 : 0 },
  ],
  tableColumns: [
    { key: "points", label: "PTS", description: "Points scored", compute: (s) => s.points || 0 },
    { key: "rebounds", label: "REB", description: "Total rebounds (offensive + defensive)", compute: (s) => (s.rebounds_off || 0) + (s.rebounds_def || 0) },
    { key: "assists", label: "AST", description: "Assists — passes leading to a made basket", compute: (s) => s.assists || 0 },
    { key: "steals", label: "STL", description: "Steals — taking the ball from an opponent", compute: (s) => s.steals || 0 },
    { key: "blocks", label: "BLK", description: "Blocks — deflecting an opponent's shot", compute: (s) => s.blocks || 0 },
    { key: "fg_pct", label: "FG%", description: "Field goal percentage", compute: (s) => s.fg_attempted > 0 ? ((s.fg_made / s.fg_attempted) * 100).toFixed(1) + "%" : "—" },
    { key: "three_pct", label: "3P%", description: "Three-point percentage", compute: (s) => s.three_attempted > 0 ? ((s.three_made / s.three_attempted) * 100).toFixed(1) + "%" : "—" },
    { key: "ft_pct", label: "FT%", description: "Free throw percentage", compute: (s) => s.ft_attempted > 0 ? ((s.ft_made / s.ft_attempted) * 100).toFixed(1) + "%" : "—" },
  ],
  drillCategories: ["Shooting", "Defense", "Conditioning", "Playmaking"],
  formAnalysisTypes: [
    {
      key: "shooting_form",
      label: "Shooting Form",
      description: "Analyze jump shot, free throw, or three-point shooting mechanics",
      promptTemplate: `You are an expert basketball shooting coach analyzing a player's shooting form video. Evaluate these mechanics:
1. Foot placement and stance width
2. Knee bend and loading phase
3. Ball positioning (shooting pocket)
4. Elbow alignment (should form an "L" under the ball)
5. Release point and follow-through (goose neck)
6. Arc and trajectory
7. Balance and landing

Return your analysis as JSON with this exact structure:
{"overall_score": <1-100>, "strengths": ["..."], "improvements": ["..."], "detailed_analysis": "...", "drill_recommendations": ["..."]}`,
    },
    {
      key: "dribbling_form",
      label: "Dribbling Form",
      description: "Analyze ball handling technique and body positioning",
      promptTemplate: `You are an expert basketball ball-handling coach analyzing dribbling technique. Evaluate:
1. Body posture and low center of gravity
2. Head up and court vision
3. Hand positioning on the ball (fingertip control, not palm)
4. Crossover speed and tightness
5. Protect the ball from defenders
6. Change of pace and direction

Return your analysis as JSON with this exact structure:
{"overall_score": <1-100>, "strengths": ["..."], "improvements": ["..."], "detailed_analysis": "...", "drill_recommendations": ["..."]}`,
    },
    {
      key: "defensive_stance",
      label: "Defensive Stance",
      description: "Analyze defensive positioning and lateral movement",
      promptTemplate: `You are an expert basketball defensive coach analyzing defensive form. Evaluate:
1. Athletic stance (wide base, knees bent, butt low)
2. Active hands positioning
3. Lateral slide technique (no crossing feet)
4. Closeout mechanics
5. Hip positioning relative to the offensive player
6. Recovery speed and balance

Return your analysis as JSON with this exact structure:
{"overall_score": <1-100>, "strengths": ["..."], "improvements": ["..."], "detailed_analysis": "...", "drill_recommendations": ["..."]}`,
    },
  ],
  skillAreas: [
    {
      key: "shooting",
      label: "Shooting",
      description: "Overall shooting ability across field goals, three-pointers, and free throws",
      relatedStatKeys: ["fg_made", "fg_attempted", "three_made", "three_attempted", "ft_made", "ft_attempted", "points"],
      computeRating: (stats, gameCount) => {
        if (gameCount === 0) return 0;
        const fgPct = stats.fg_attempted > 0 ? stats.fg_made / stats.fg_attempted : 0;
        const ftPct = stats.ft_attempted > 0 ? stats.ft_made / stats.ft_attempted : 0;
        const ppg = stats.points / gameCount;
        return Math.min(100, Math.round((fgPct * 40 + ftPct * 20 + Math.min(ppg / 30, 1) * 40) * 100));
      },
    },
    {
      key: "passing",
      label: "Passing",
      description: "Court vision, assist generation, and turnover avoidance",
      relatedStatKeys: ["assists", "turnovers"],
      computeRating: (stats, gameCount) => {
        if (gameCount === 0) return 0;
        const apg = stats.assists / gameCount;
        const topg = (stats.turnovers || 1) / gameCount;
        const ratio = apg / topg;
        return Math.min(100, Math.round(Math.min(ratio / 3, 1) * 60 + Math.min(apg / 10, 1) * 40));
      },
    },
    {
      key: "rebounding",
      label: "Rebounding",
      description: "Offensive and defensive rebounding ability",
      relatedStatKeys: ["rebounds_off", "rebounds_def"],
      computeRating: (stats, gameCount) => {
        if (gameCount === 0) return 0;
        const rpg = ((stats.rebounds_off || 0) + (stats.rebounds_def || 0)) / gameCount;
        return Math.min(100, Math.round(Math.min(rpg / 12, 1) * 100));
      },
    },
    {
      key: "defense",
      label: "Defense",
      description: "Steals, blocks, and defensive impact",
      relatedStatKeys: ["steals", "blocks"],
      computeRating: (stats, gameCount) => {
        if (gameCount === 0) return 0;
        const spg = (stats.steals || 0) / gameCount;
        const bpg = (stats.blocks || 0) / gameCount;
        return Math.min(100, Math.round((Math.min(spg / 3, 1) * 50 + Math.min(bpg / 3, 1) * 50) * 100));
      },
    },
  ],
  challengeTemplates: [
    { name: "Drill Machine", description: "Complete 3 drills today", type: "daily", criteria: { metric: "drill_completions", target: 3, timeframe: "day" }, xp_reward: 50 },
    { name: "Shot Doctor", description: "Complete 2 shooting drills today", type: "daily", criteria: { metric: "drill_completions_category", target: 2, timeframe: "day" }, xp_reward: 40 },
    { name: "Weekly Grinder", description: "Complete 15 drills this week", type: "weekly", criteria: { metric: "drill_completions", target: 15, timeframe: "week" }, xp_reward: 200 },
    { name: "Film Study", description: "Upload a form analysis video", type: "daily", criteria: { metric: "form_analyses", target: 1, timeframe: "day" }, xp_reward: 30 },
    { name: "Century Club", description: "Complete 100 total drills", type: "milestone", criteria: { metric: "total_drill_completions", target: 100 }, xp_reward: 500 },
    { name: "Streak Starter", description: "Maintain a 7-day practice streak", type: "milestone", criteria: { metric: "streak_days", target: 7 }, xp_reward: 300 },
  ],
};

// ============================================================
// BASEBALL
// ============================================================
const baseballConfig: SportConfig = {
  id: "baseball",
  name: "Baseball",
  icon: "⚾",
  positions: ["P", "C", "1B", "2B", "3B", "SS", "LF", "CF", "RF", "DH", "UTL"],
  statFields: [
    // Batting
    { key: "at_bats", label: "At Bats", shortLabel: "AB", type: "integer", group: "Batting", description: "Official plate appearances where the batter puts the ball in play or strikes out. Walks and hit-by-pitches don't count.", howToTrack: "Count each time the batter completes a turn (not including walks, HBP, or sacrifices)." },
    { key: "hits", label: "Hits", shortLabel: "H", type: "integer", group: "Batting", description: "Times the batter reaches base safely by hitting the ball (singles + doubles + triples + home runs).", howToTrack: "Tally each time the batter hits the ball and reaches base safely." },
    { key: "singles", label: "Singles", shortLabel: "1B", type: "integer", group: "Batting", description: "Hits where the batter reaches first base.", howToTrack: "Tally when the batter gets a hit and stops at first base." },
    { key: "doubles", label: "Doubles", shortLabel: "2B", type: "integer", group: "Batting", description: "Hits where the batter reaches second base.", howToTrack: "Tally when the batter hits and reaches second base." },
    { key: "triples", label: "Triples", shortLabel: "3B", type: "integer", group: "Batting", description: "Hits where the batter reaches third base.", howToTrack: "Tally when the batter hits and reaches third base." },
    { key: "home_runs", label: "Home Runs", shortLabel: "HR", type: "integer", group: "Batting", description: "Hits where the batter rounds all bases and scores, usually over the outfield fence.", howToTrack: "Tally when the batter hits the ball over the fence or circles all bases on a hit." },
    { key: "rbis", label: "RBIs", shortLabel: "RBI", type: "integer", group: "Batting", description: "Runs Batted In — the number of runners who score because of this batter's action.", howToTrack: "Count how many runners cross home plate as a result of the batter's at-bat." },
    { key: "walks", label: "Walks", shortLabel: "BB", type: "integer", group: "Batting", description: "Base on balls — the batter reaches first base after 4 balls (pitches outside the strike zone).", howToTrack: "Tally when the umpire awards first base after ball four." },
    { key: "strikeouts", label: "Strikeouts", shortLabel: "SO", type: "integer", group: "Batting", description: "Times the batter is called out after 3 strikes.", howToTrack: "Tally each strikeout called by the umpire." },
    { key: "stolen_bases", label: "Stolen Bases", shortLabel: "SB", type: "integer", group: "Batting", description: "Successfully advancing to the next base while the pitcher is throwing to the batter.", howToTrack: "Tally when a runner advances a base on a steal attempt without the ball being hit." },
    { key: "caught_stealing", label: "Caught Stealing", shortLabel: "CS", type: "integer", group: "Batting", description: "Tagged out while attempting to steal a base.", howToTrack: "Tally when a runner is thrown out trying to steal." },
    { key: "hit_by_pitch", label: "Hit By Pitch", shortLabel: "HBP", type: "integer", group: "Batting", description: "Awarded first base after being hit by a pitched ball.", howToTrack: "Tally when the umpire sends the batter to first after being hit by a pitch." },
    { key: "sacrifice_flies", label: "Sacrifice Flies", shortLabel: "SF", type: "integer", group: "Batting", description: "A fly ball out that allows a runner to tag up and score.", howToTrack: "Tally when a batter flies out but a runner scores by tagging up." },
    // Pitching
    { key: "innings_pitched", label: "Innings Pitched", shortLabel: "IP", type: "decimal", group: "Pitching", description: "Number of innings pitched. Each out is 1/3 of an inning (e.g., 5.1 = 5 innings and 1 out).", howToTrack: "Count outs recorded while pitching; divide by 3 for innings." },
    { key: "earned_runs", label: "Earned Runs", shortLabel: "ER", type: "integer", group: "Pitching", description: "Runs scored against the pitcher that were not caused by fielding errors.", howToTrack: "Count runs that score without the help of errors." },
    { key: "strikeouts_thrown", label: "Strikeouts (P)", shortLabel: "K", type: "integer", group: "Pitching", description: "Batters the pitcher struck out.", howToTrack: "Tally each batter the pitcher strikes out." },
    { key: "walks_thrown", label: "Walks (P)", shortLabel: "BB", type: "integer", group: "Pitching", description: "Batters the pitcher walked (gave 4 balls to).", howToTrack: "Tally each batter awarded first base on balls." },
    { key: "hits_allowed", label: "Hits Allowed", shortLabel: "HA", type: "integer", group: "Pitching", description: "Base hits given up by the pitcher.", howToTrack: "Tally each hit the opposing batter gets off this pitcher." },
    { key: "home_runs_allowed", label: "HR Allowed", shortLabel: "HRA", type: "integer", group: "Pitching", description: "Home runs given up by the pitcher.", howToTrack: "Tally each home run hit off this pitcher." },
    { key: "pitches_thrown", label: "Pitches Thrown", shortLabel: "PC", type: "integer", group: "Pitching", description: "Total number of pitches thrown. Important for arm safety in youth baseball.", howToTrack: "Use a pitch counter or tally every pitch. Most youth leagues have pitch count limits." },
    // Fielding
    { key: "putouts", label: "Putouts", shortLabel: "PO", type: "integer", group: "Fielding", description: "Directly recording an out (catching a fly ball, tagging a runner, stepping on a base).", howToTrack: "Tally when the fielder directly makes an out." },
    { key: "fielding_errors", label: "Errors", shortLabel: "E", type: "integer", group: "Fielding", description: "Mistakes that allow a batter or runner to advance when they should have been out.", howToTrack: "Tally dropped balls, bad throws, or missed plays that extend an at-bat or let runners advance." },
    { key: "assists_fielding", label: "Assists (F)", shortLabel: "A", type: "integer", group: "Fielding", description: "Throwing or deflecting the ball to a teammate who records a putout.", howToTrack: "Tally when a fielder throws to another fielder who then makes the out." },
  ],
  computedStats: [
    {
      key: "batting_avg",
      label: "Batting Average",
      shortLabel: "AVG",
      description: "Hits divided by at-bats. Shows how often a batter gets a hit. .300+ is excellent.",
      compute: (s) => s.at_bats > 0 ? s.hits / s.at_bats : 0,
      format: (v) => v.toFixed(3).replace(/^0/, ""),
    },
    {
      key: "obp",
      label: "On-Base %",
      shortLabel: "OBP",
      description: "How often the batter reaches base (hits + walks + hit-by-pitch). Higher is better; .350+ is strong.",
      compute: (s) => {
        const pa = (s.at_bats || 0) + (s.walks || 0) + (s.hit_by_pitch || 0) + (s.sacrifice_flies || 0);
        return pa > 0 ? ((s.hits || 0) + (s.walks || 0) + (s.hit_by_pitch || 0)) / pa : 0;
      },
      format: (v) => v.toFixed(3).replace(/^0/, ""),
    },
    {
      key: "slg",
      label: "Slugging %",
      shortLabel: "SLG",
      description: "Total bases divided by at-bats. Measures hitting power — a home run counts as 4 bases, a double as 2, etc.",
      compute: (s) => {
        if (!s.at_bats || s.at_bats === 0) return 0;
        const totalBases = (s.singles || 0) + (s.doubles || 0) * 2 + (s.triples || 0) * 3 + (s.home_runs || 0) * 4;
        return totalBases / s.at_bats;
      },
      format: (v) => v.toFixed(3).replace(/^0/, ""),
    },
    {
      key: "era",
      label: "ERA",
      shortLabel: "ERA",
      description: "Earned Run Average — average earned runs allowed per 9 innings. Lower is better; under 3.00 is great.",
      compute: (s) => s.innings_pitched > 0 ? (s.earned_runs / s.innings_pitched) * 9 : 0,
      format: (v) => v.toFixed(2),
    },
    {
      key: "whip",
      label: "WHIP",
      shortLabel: "WHIP",
      description: "Walks + Hits per Inning Pitched. Measures how many baserunners a pitcher allows. Under 1.20 is strong.",
      compute: (s) => s.innings_pitched > 0 ? ((s.walks_thrown || 0) + (s.hits_allowed || 0)) / s.innings_pitched : 0,
      format: (v) => v.toFixed(2),
    },
  ],
  averageCards: [
    {
      key: "avg", label: "AVG", description: "Season batting average across all games.", statKey: "computed",
      compute: (totals, n) => totals.at_bats > 0 ? totals.hits / totals.at_bats : 0,
      format: (v) => v.toFixed(3).replace(/^0/, ""),
    },
    {
      key: "hr_per_game", label: "HR/G", description: "Home runs per game average.", statKey: "home_runs",
      compute: (totals, n) => n > 0 ? totals.home_runs / n : 0,
      format: (v) => v.toFixed(1),
    },
    {
      key: "rbi_per_game", label: "RBI/G", description: "Runs batted in per game average.", statKey: "rbis",
      compute: (totals, n) => n > 0 ? totals.rbis / n : 0,
      format: (v) => v.toFixed(1),
    },
    {
      key: "obp", label: "OBP", description: "Season on-base percentage across all games.", statKey: "computed",
      compute: (totals) => {
        const pa = (totals.at_bats || 0) + (totals.walks || 0) + (totals.hit_by_pitch || 0) + (totals.sacrifice_flies || 0);
        return pa > 0 ? ((totals.hits || 0) + (totals.walks || 0) + (totals.hit_by_pitch || 0)) / pa : 0;
      },
      format: (v) => v.toFixed(3).replace(/^0/, ""),
    },
    {
      key: "era", label: "ERA", description: "Season earned run average across all innings pitched.", statKey: "computed",
      compute: (totals) => totals.innings_pitched > 0 ? (totals.earned_runs / totals.innings_pitched) * 9 : 0,
      format: (v) => v.toFixed(2),
    },
  ],
  trendChartLines: [
    { dataKey: "hits", label: "Hits", color: "#6366f1", compute: (s) => s.hits || 0 },
    { dataKey: "rbis", label: "RBIs", color: "#22c55e", compute: (s) => s.rbis || 0 },
    { dataKey: "home_runs", label: "HRs", color: "#f59e0b", compute: (s) => s.home_runs || 0 },
  ],
  percentageChartLines: [
    { dataKey: "batting_avg", label: "AVG", color: "#6366f1", compute: (s) => s.at_bats > 0 ? s.hits / s.at_bats : 0 },
    { dataKey: "obp", label: "OBP", color: "#22c55e", compute: (s) => {
      const pa = (s.at_bats || 0) + (s.walks || 0) + (s.hit_by_pitch || 0) + (s.sacrifice_flies || 0);
      return pa > 0 ? ((s.hits || 0) + (s.walks || 0) + (s.hit_by_pitch || 0)) / pa : 0;
    }},
    { dataKey: "slg", label: "SLG", color: "#f59e0b", compute: (s) => {
      if (!s.at_bats || s.at_bats === 0) return 0;
      const totalBases = (s.singles || 0) + (s.doubles || 0) * 2 + (s.triples || 0) * 3 + (s.home_runs || 0) * 4;
      return totalBases / s.at_bats;
    }},
  ],
  tableColumns: [
    { key: "at_bats", label: "AB", description: "At bats", compute: (s) => s.at_bats || 0 },
    { key: "hits", label: "H", description: "Hits", compute: (s) => s.hits || 0 },
    { key: "home_runs", label: "HR", description: "Home runs", compute: (s) => s.home_runs || 0 },
    { key: "rbis", label: "RBI", description: "Runs batted in", compute: (s) => s.rbis || 0 },
    { key: "stolen_bases", label: "SB", description: "Stolen bases", compute: (s) => s.stolen_bases || 0 },
    { key: "batting_avg", label: "AVG", description: "Batting average (hits / at-bats)", compute: (s) => s.at_bats > 0 ? (s.hits / s.at_bats).toFixed(3).replace(/^0/, "") : "—" },
    { key: "strikeouts_thrown", label: "K", description: "Strikeouts thrown as pitcher", compute: (s) => s.strikeouts_thrown || 0 },
    { key: "era", label: "ERA", description: "Earned run average", compute: (s) => s.innings_pitched > 0 ? ((s.earned_runs / s.innings_pitched) * 9).toFixed(2) : "—" },
  ],
  drillCategories: ["Batting", "Pitching", "Fielding", "Base Running", "Conditioning", "Agility"],
  formAnalysisTypes: [
    {
      key: "batting_swing",
      label: "Batting Swing",
      description: "Analyze batting stance, swing mechanics, and follow-through",
      promptTemplate: `You are an expert baseball hitting coach analyzing a player's batting swing. Evaluate:
1. Stance and foot placement in the batter's box
2. Grip and hand positioning on the bat
3. Load and weight transfer (back to front)
4. Hip rotation and separation from upper body
5. Bat path through the zone (level swing vs. uppercut)
6. Contact point relative to the body
7. Follow-through and finish

Return your analysis as JSON with this exact structure:
{"overall_score": <1-100>, "strengths": ["..."], "improvements": ["..."], "detailed_analysis": "...", "drill_recommendations": ["..."]}`,
    },
    {
      key: "pitching_mechanics",
      label: "Pitching Mechanics",
      description: "Analyze pitching delivery, arm action, and release point",
      promptTemplate: `You are an expert baseball pitching coach analyzing pitching mechanics. Evaluate:
1. Wind-up or stretch position
2. Leg lift and balance point
3. Stride length and direction
4. Arm action and arm slot
5. Hip-to-shoulder separation
6. Release point consistency
7. Follow-through and deceleration (injury prevention)

Return your analysis as JSON with this exact structure:
{"overall_score": <1-100>, "strengths": ["..."], "improvements": ["..."], "detailed_analysis": "...", "drill_recommendations": ["..."]}`,
    },
    {
      key: "fielding_form",
      label: "Fielding Form",
      description: "Analyze fielding mechanics, glove work, and throwing motion",
      promptTemplate: `You are an expert baseball fielding coach analyzing fielding technique. Evaluate:
1. Ready position and athletic stance
2. First step and reaction
3. Glove positioning (fingers down for grounders, up for fly balls)
4. Fielding the ball out front
5. Transfer from glove to throwing hand
6. Throwing mechanics and footwork
7. Follow-through on the throw

Return your analysis as JSON with this exact structure:
{"overall_score": <1-100>, "strengths": ["..."], "improvements": ["..."], "detailed_analysis": "...", "drill_recommendations": ["..."]}`,
    },
  ],
  skillAreas: [
    {
      key: "hitting",
      label: "Hitting",
      description: "Contact ability, power, and plate discipline",
      relatedStatKeys: ["at_bats", "hits", "home_runs", "strikeouts", "walks"],
      computeRating: (stats, gameCount) => {
        if (gameCount === 0 || !stats.at_bats) return 0;
        const avg = stats.hits / stats.at_bats;
        const power = Math.min((stats.home_runs || 0) / gameCount / 0.5, 1);
        const discipline = stats.at_bats > 0 ? 1 - ((stats.strikeouts || 0) / (stats.at_bats + (stats.walks || 0))) : 0;
        return Math.min(100, Math.round((avg / 0.4 * 40 + power * 30 + discipline * 30)));
      },
    },
    {
      key: "pitching",
      label: "Pitching",
      description: "Command, strikeout ability, and run prevention",
      relatedStatKeys: ["innings_pitched", "earned_runs", "strikeouts_thrown", "walks_thrown", "hits_allowed"],
      computeRating: (stats, gameCount) => {
        if (!stats.innings_pitched || stats.innings_pitched === 0) return 0;
        const era = (stats.earned_runs / stats.innings_pitched) * 9;
        const k9 = (stats.strikeouts_thrown / stats.innings_pitched) * 9;
        const whip = ((stats.walks_thrown || 0) + (stats.hits_allowed || 0)) / stats.innings_pitched;
        const eraScore = Math.max(0, 1 - era / 9);
        const kScore = Math.min(k9 / 12, 1);
        const whipScore = Math.max(0, 1 - whip / 2);
        return Math.min(100, Math.round((eraScore * 40 + kScore * 30 + whipScore * 30) * 100));
      },
    },
    {
      key: "fielding",
      label: "Fielding",
      description: "Defensive reliability and range",
      relatedStatKeys: ["putouts", "fielding_errors", "assists_fielding"],
      computeRating: (stats, gameCount) => {
        if (gameCount === 0) return 0;
        const totalChances = (stats.putouts || 0) + (stats.assists_fielding || 0) + (stats.fielding_errors || 0);
        if (totalChances === 0) return 50;
        const fieldingPct = ((stats.putouts || 0) + (stats.assists_fielding || 0)) / totalChances;
        return Math.min(100, Math.round(fieldingPct * 100));
      },
    },
    {
      key: "baserunning",
      label: "Base Running",
      description: "Speed, stolen base success, and base running IQ",
      relatedStatKeys: ["stolen_bases", "caught_stealing"],
      computeRating: (stats, gameCount) => {
        if (gameCount === 0) return 0;
        const sbAttempts = (stats.stolen_bases || 0) + (stats.caught_stealing || 0);
        const sbPct = sbAttempts > 0 ? (stats.stolen_bases || 0) / sbAttempts : 0;
        const sbPerGame = (stats.stolen_bases || 0) / gameCount;
        return Math.min(100, Math.round(sbPct * 60 + Math.min(sbPerGame / 0.5, 1) * 40));
      },
    },
  ],
  challengeTemplates: [
    { name: "Batting Practice", description: "Complete 3 batting drills today", type: "daily", criteria: { metric: "drill_completions_category", target: 3, timeframe: "day" }, xp_reward: 50 },
    { name: "Iron Arm", description: "Complete 2 pitching drills today", type: "daily", criteria: { metric: "drill_completions_category", target: 2, timeframe: "day" }, xp_reward: 40 },
    { name: "Weekly Warrior", description: "Complete 15 drills this week", type: "weekly", criteria: { metric: "drill_completions", target: 15, timeframe: "week" }, xp_reward: 200 },
    { name: "Film Room", description: "Upload a form analysis video", type: "daily", criteria: { metric: "form_analyses", target: 1, timeframe: "day" }, xp_reward: 30 },
    { name: "Century Club", description: "Complete 100 total drills", type: "milestone", criteria: { metric: "total_drill_completions", target: 100 }, xp_reward: 500 },
    { name: "Streak Starter", description: "Maintain a 7-day practice streak", type: "milestone", criteria: { metric: "streak_days", target: 7 }, xp_reward: 300 },
  ],
};

// ============================================================
// SOCCER
// ============================================================
const soccerConfig: SportConfig = {
  id: "soccer",
  name: "Soccer",
  icon: "⚽",
  positions: ["GK", "CB", "LB", "RB", "CDM", "CM", "CAM", "LM", "RM", "LW", "RW", "ST"],
  statFields: [
    // Game
    { key: "minutes_played", label: "Minutes Played", shortLabel: "MIN", type: "integer", group: "Game", description: "Total minutes the player was on the field.", howToTrack: "Note when the player subs in and out; subtract for total time." },
    // Attacking
    { key: "goals", label: "Goals", shortLabel: "G", type: "integer", group: "Attacking", description: "Times the player scored by getting the ball into the opponent's net.", howToTrack: "Tally each goal the player scores." },
    { key: "assists", label: "Assists", shortLabel: "A", type: "integer", group: "Attacking", description: "A pass or play that directly sets up a teammate to score a goal.", howToTrack: "Tally when a player's pass leads directly to a goal." },
    { key: "shots", label: "Shots", shortLabel: "SH", type: "integer", group: "Attacking", description: "Any attempt to score, whether on target, off target, or blocked.", howToTrack: "Tally every time the player kicks or heads the ball toward goal." },
    { key: "shots_on_target", label: "Shots on Target", shortLabel: "SOT", type: "integer", group: "Attacking", description: "Shots that would go in if not saved by the goalkeeper or blocked on the line.", howToTrack: "Tally shots that force a save or go in the goal." },
    // Passing
    { key: "passes_completed", label: "Passes Completed", shortLabel: "PC", type: "integer", group: "Passing", description: "Passes that successfully reach a teammate.", howToTrack: "Tally each pass that a teammate receives." },
    { key: "passes_attempted", label: "Passes Attempted", shortLabel: "PA", type: "integer", group: "Passing", description: "Total passes attempted (completed + incomplete).", howToTrack: "Tally every pass, whether it reaches a teammate or not." },
    { key: "key_passes", label: "Key Passes", shortLabel: "KP", type: "integer", group: "Passing", description: "Passes that directly create a shooting opportunity for a teammate.", howToTrack: "Tally when a pass leads to a teammate taking a shot." },
    // Defending
    { key: "tackles", label: "Tackles", shortLabel: "TKL", type: "integer", group: "Defending", description: "Successfully dispossessing an opponent of the ball using your feet.", howToTrack: "Tally when the player wins the ball from an opponent in a challenge." },
    { key: "interceptions", label: "Interceptions", shortLabel: "INT", type: "integer", group: "Defending", description: "Reading the play and cutting off an opponent's pass before it reaches the intended target.", howToTrack: "Tally when the player steps into a passing lane to win the ball." },
    { key: "clearances", label: "Clearances", shortLabel: "CLR", type: "integer", group: "Defending", description: "Kicking or heading the ball away from the danger zone near your own goal.", howToTrack: "Tally when the player clears the ball out of the defensive area." },
    // Discipline
    { key: "fouls_committed", label: "Fouls Committed", shortLabel: "FC", type: "integer", group: "Discipline", description: "Illegal actions against an opponent (tripping, pushing, holding, etc.).", howToTrack: "Tally each foul called against the player by the referee." },
    { key: "fouls_drawn", label: "Fouls Drawn", shortLabel: "FD", type: "integer", group: "Discipline", description: "Fouls committed by opponents against this player.", howToTrack: "Tally each time the referee awards a foul in favor of this player." },
    { key: "yellow_cards", label: "Yellow Cards", shortLabel: "YC", type: "integer", group: "Discipline", description: "A caution from the referee for unsportsmanlike play. Two yellows = a red card and ejection.", howToTrack: "Tally when the referee shows the player a yellow card." },
    { key: "red_cards", label: "Red Cards", shortLabel: "RC", type: "integer", group: "Discipline", description: "An ejection from the game for serious foul play or two yellow cards.", howToTrack: "Tally when the referee shows the player a red card." },
    // Goalkeeping
    { key: "saves", label: "Saves", shortLabel: "SV", type: "integer", group: "Goalkeeping", description: "Shots on target stopped by the goalkeeper.", howToTrack: "Tally each time the keeper stops a shot that was heading into the goal." },
    { key: "goals_conceded", label: "Goals Conceded", shortLabel: "GC", type: "integer", group: "Goalkeeping", description: "Goals scored against the goalkeeper while they were in net.", howToTrack: "Tally each goal the opposing team scores." },
  ],
  computedStats: [
    {
      key: "shot_accuracy",
      label: "Shot Accuracy",
      shortLabel: "SA%",
      description: "Percentage of shots that are on target. Shows shooting precision; 40%+ is good.",
      compute: (s) => s.shots > 0 ? (s.shots_on_target / s.shots) * 100 : 0,
      format: (v) => v.toFixed(1) + "%",
    },
    {
      key: "pass_accuracy",
      label: "Pass Accuracy",
      shortLabel: "PA%",
      description: "Percentage of passes that reach a teammate. 75%+ is solid for youth players.",
      compute: (s) => s.passes_attempted > 0 ? (s.passes_completed / s.passes_attempted) * 100 : 0,
      format: (v) => v.toFixed(1) + "%",
    },
    {
      key: "goal_contributions",
      label: "Goal Contributions",
      shortLabel: "G+A",
      description: "Goals + assists combined. A key measure of attacking impact.",
      compute: (s) => (s.goals || 0) + (s.assists || 0),
      format: (v) => v.toFixed(0),
    },
  ],
  averageCards: [
    {
      key: "goals_per_game", label: "Goals/G", description: "Average goals scored per game.", statKey: "goals",
      compute: (totals, n) => n > 0 ? totals.goals / n : 0,
      format: (v) => v.toFixed(1),
    },
    {
      key: "assists_per_game", label: "Assists/G", description: "Average assists per game.", statKey: "assists",
      compute: (totals, n) => n > 0 ? totals.assists / n : 0,
      format: (v) => v.toFixed(1),
    },
    {
      key: "shot_accuracy", label: "Shot Acc.", description: "Season shot accuracy across all games.", statKey: "computed",
      compute: (totals) => totals.shots > 0 ? (totals.shots_on_target / totals.shots) * 100 : 0,
      format: (v) => v.toFixed(1) + "%",
    },
    {
      key: "pass_accuracy", label: "Pass Acc.", description: "Season pass accuracy across all games.", statKey: "computed",
      compute: (totals) => totals.passes_attempted > 0 ? (totals.passes_completed / totals.passes_attempted) * 100 : 0,
      format: (v) => v.toFixed(1) + "%",
    },
    {
      key: "tackles_per_game", label: "Tackles/G", description: "Average tackles won per game.", statKey: "tackles",
      compute: (totals, n) => n > 0 ? totals.tackles / n : 0,
      format: (v) => v.toFixed(1),
    },
  ],
  trendChartLines: [
    { dataKey: "goals", label: "Goals", color: "#6366f1", compute: (s) => s.goals || 0 },
    { dataKey: "assists", label: "Assists", color: "#22c55e", compute: (s) => s.assists || 0 },
    { dataKey: "tackles", label: "Tackles", color: "#f59e0b", compute: (s) => s.tackles || 0 },
  ],
  percentageChartLines: [
    { dataKey: "shot_accuracy", label: "Shot Acc.", color: "#6366f1", compute: (s) => s.shots > 0 ? (s.shots_on_target / s.shots) * 100 : 0 },
    { dataKey: "pass_accuracy", label: "Pass Acc.", color: "#22c55e", compute: (s) => s.passes_attempted > 0 ? (s.passes_completed / s.passes_attempted) * 100 : 0 },
  ],
  tableColumns: [
    { key: "goals", label: "G", description: "Goals scored", compute: (s) => s.goals || 0 },
    { key: "assists", label: "A", description: "Assists — passes leading to a goal", compute: (s) => s.assists || 0 },
    { key: "shots_on_target", label: "SOT", description: "Shots on target", compute: (s) => s.shots_on_target || 0 },
    { key: "passes_completed", label: "PC", description: "Passes completed", compute: (s) => s.passes_completed || 0 },
    { key: "tackles", label: "TKL", description: "Tackles won", compute: (s) => s.tackles || 0 },
    { key: "interceptions", label: "INT", description: "Interceptions", compute: (s) => s.interceptions || 0 },
    { key: "yellow_cards", label: "YC", description: "Yellow cards received", compute: (s) => s.yellow_cards || 0 },
    { key: "saves", label: "SV", description: "Goalkeeper saves", compute: (s) => s.saves || 0 },
  ],
  drillCategories: ["Passing", "Finishing", "Defending", "Goalkeeping", "Set Pieces", "Conditioning", "Agility"],
  formAnalysisTypes: [
    {
      key: "free_kick",
      label: "Free Kick Technique",
      description: "Analyze free kick approach, strike, and placement",
      promptTemplate: `You are an expert soccer coach analyzing free kick technique. Evaluate:
1. Approach angle and run-up
2. Plant foot placement relative to the ball
3. Striking foot contact point (instep, inside, laces)
4. Body lean and posture at the point of contact
5. Follow-through direction
6. Ball flight (curve, dip, knuckling)
7. Target selection and accuracy

Return your analysis as JSON with this exact structure:
{"overall_score": <1-100>, "strengths": ["..."], "improvements": ["..."], "detailed_analysis": "...", "drill_recommendations": ["..."]}`,
    },
    {
      key: "passing_technique",
      label: "Passing Technique",
      description: "Analyze short and long passing mechanics",
      promptTemplate: `You are an expert soccer passing coach analyzing passing technique. Evaluate:
1. Body shape and open hips to receive
2. First touch quality and direction
3. Passing foot surface selection (inside, outside, instep)
4. Weight and accuracy of the pass
5. Vision and head position before passing
6. Follow-through toward the target
7. Ability to play under pressure

Return your analysis as JSON with this exact structure:
{"overall_score": <1-100>, "strengths": ["..."], "improvements": ["..."], "detailed_analysis": "...", "drill_recommendations": ["..."]}`,
    },
    {
      key: "dribbling_moves",
      label: "Dribbling & Moves",
      description: "Analyze ball control, skill moves, and 1v1 ability",
      promptTemplate: `You are an expert soccer dribbling coach analyzing technique. Evaluate:
1. Close ball control and touch frequency
2. Change of direction speed and balance
3. Use of both feet
4. Body feints and deception
5. Acceleration out of moves
6. Head position and awareness
7. Protecting the ball under pressure

Return your analysis as JSON with this exact structure:
{"overall_score": <1-100>, "strengths": ["..."], "improvements": ["..."], "detailed_analysis": "...", "drill_recommendations": ["..."]}`,
    },
  ],
  skillAreas: [
    {
      key: "attacking",
      label: "Attacking",
      description: "Goal scoring, shot accuracy, and creative play",
      relatedStatKeys: ["goals", "shots", "shots_on_target", "assists"],
      computeRating: (stats, gameCount) => {
        if (gameCount === 0) return 0;
        const gpg = (stats.goals || 0) / gameCount;
        const shotAcc = stats.shots > 0 ? (stats.shots_on_target || 0) / stats.shots : 0;
        const contributions = ((stats.goals || 0) + (stats.assists || 0)) / gameCount;
        return Math.min(100, Math.round((Math.min(gpg / 1, 1) * 35 + shotAcc * 30 + Math.min(contributions / 1.5, 1) * 35) * 100));
      },
    },
    {
      key: "passing",
      label: "Passing",
      description: "Pass accuracy, key passes, and distribution",
      relatedStatKeys: ["passes_completed", "passes_attempted", "key_passes"],
      computeRating: (stats, gameCount) => {
        if (gameCount === 0) return 0;
        const passAcc = stats.passes_attempted > 0 ? (stats.passes_completed || 0) / stats.passes_attempted : 0;
        const kpg = (stats.key_passes || 0) / gameCount;
        return Math.min(100, Math.round((passAcc * 60 + Math.min(kpg / 3, 1) * 40) * 100));
      },
    },
    {
      key: "defending",
      label: "Defending",
      description: "Tackling, interceptions, and defensive awareness",
      relatedStatKeys: ["tackles", "interceptions", "clearances"],
      computeRating: (stats, gameCount) => {
        if (gameCount === 0) return 0;
        const tpg = (stats.tackles || 0) / gameCount;
        const ipg = (stats.interceptions || 0) / gameCount;
        const cpg = (stats.clearances || 0) / gameCount;
        return Math.min(100, Math.round((Math.min(tpg / 5, 1) * 40 + Math.min(ipg / 3, 1) * 35 + Math.min(cpg / 5, 1) * 25) * 100));
      },
    },
    {
      key: "discipline",
      label: "Discipline",
      description: "Fair play, avoiding cards, and drawing fouls",
      relatedStatKeys: ["fouls_committed", "fouls_drawn", "yellow_cards", "red_cards"],
      computeRating: (stats, gameCount) => {
        if (gameCount === 0) return 50;
        const foulsPg = (stats.fouls_committed || 0) / gameCount;
        const cardsPg = ((stats.yellow_cards || 0) + (stats.red_cards || 0) * 3) / gameCount;
        const foulsDrawnPg = (stats.fouls_drawn || 0) / gameCount;
        const cleanScore = Math.max(0, 1 - foulsPg / 4 - cardsPg);
        return Math.min(100, Math.round((cleanScore * 60 + Math.min(foulsDrawnPg / 3, 1) * 40) * 100));
      },
    },
  ],
  challengeTemplates: [
    { name: "Pitch Perfect", description: "Complete 3 passing drills today", type: "daily", criteria: { metric: "drill_completions_category", target: 3, timeframe: "day" }, xp_reward: 50 },
    { name: "Clinical Finisher", description: "Complete 2 finishing drills today", type: "daily", criteria: { metric: "drill_completions_category", target: 2, timeframe: "day" }, xp_reward: 40 },
    { name: "Weekly Warrior", description: "Complete 15 drills this week", type: "weekly", criteria: { metric: "drill_completions", target: 15, timeframe: "week" }, xp_reward: 200 },
    { name: "Film Study", description: "Upload a form analysis video", type: "daily", criteria: { metric: "form_analyses", target: 1, timeframe: "day" }, xp_reward: 30 },
    { name: "Century Club", description: "Complete 100 total drills", type: "milestone", criteria: { metric: "total_drill_completions", target: 100 }, xp_reward: 500 },
    { name: "Streak Starter", description: "Maintain a 7-day practice streak", type: "milestone", criteria: { metric: "streak_days", target: 7 }, xp_reward: 300 },
  ],
};

// ============================================================
// FOOTBALL (American)
// ============================================================
const footballConfig: SportConfig = {
  id: "football",
  name: "Football",
  icon: "🏈",
  positions: ["QB", "RB", "FB", "WR", "TE", "OL", "DL", "LB", "CB", "S", "K", "P"],
  statFields: [
    // Passing
    { key: "pass_attempts", label: "Pass Attempts", shortLabel: "ATT", type: "integer", group: "Passing", description: "Number of pass attempts thrown.", howToTrack: "Tally every forward pass attempt by the quarterback." },
    { key: "pass_completions", label: "Completions", shortLabel: "CMP", type: "integer", group: "Passing", description: "Passes caught by a receiver.", howToTrack: "Tally each pass that is successfully caught." },
    { key: "passing_yards", label: "Passing Yards", shortLabel: "YDS", type: "integer", group: "Passing", description: "Total yards gained through completed passes.", howToTrack: "Sum the yardage gained on each completed pass." },
    { key: "passing_tds", label: "Passing TDs", shortLabel: "TD", type: "integer", group: "Passing", description: "Touchdown passes thrown.", howToTrack: "Tally each pass that results in a touchdown." },
    { key: "interceptions_thrown", label: "Interceptions", shortLabel: "INT", type: "integer", group: "Passing", description: "Passes caught by the opposing defense.", howToTrack: "Tally each pass intercepted by the defense." },
    { key: "sacks_taken", label: "Sacks Taken", shortLabel: "SCK", type: "integer", group: "Passing", description: "Times the quarterback was tackled behind the line of scrimmage.", howToTrack: "Tally each time the QB is tackled before throwing." },
    // Rushing
    { key: "rush_attempts", label: "Rush Attempts", shortLabel: "ATT", type: "integer", group: "Rushing", description: "Number of times the player carried the ball.", howToTrack: "Tally each handoff or QB scramble." },
    { key: "rushing_yards", label: "Rushing Yards", shortLabel: "YDS", type: "integer", group: "Rushing", description: "Total yards gained on rushing plays.", howToTrack: "Sum the yardage gained on each carry." },
    { key: "rushing_tds", label: "Rushing TDs", shortLabel: "TD", type: "integer", group: "Rushing", description: "Touchdowns scored by running the ball.", howToTrack: "Tally each rushing touchdown." },
    { key: "fumbles", label: "Fumbles", shortLabel: "FUM", type: "integer", group: "Rushing", description: "Times the ball carrier lost possession.", howToTrack: "Tally each time the player drops the ball." },
    { key: "fumbles_lost", label: "Fumbles Lost", shortLabel: "FL", type: "integer", group: "Rushing", description: "Fumbles recovered by the opposing team.", howToTrack: "Tally fumbles that the defense recovers." },
    // Receiving
    { key: "targets", label: "Targets", shortLabel: "TGT", type: "integer", group: "Receiving", description: "Number of times a pass was thrown to this receiver.", howToTrack: "Tally each pass intended for this player." },
    { key: "receptions", label: "Receptions", shortLabel: "REC", type: "integer", group: "Receiving", description: "Passes successfully caught.", howToTrack: "Tally each pass this player catches." },
    { key: "receiving_yards", label: "Receiving Yards", shortLabel: "YDS", type: "integer", group: "Receiving", description: "Total yards gained after catching passes.", howToTrack: "Sum yardage gained on each reception." },
    { key: "receiving_tds", label: "Receiving TDs", shortLabel: "TD", type: "integer", group: "Receiving", description: "Touchdowns scored by catching passes.", howToTrack: "Tally each receiving touchdown." },
    // Defense
    { key: "tackles_solo", label: "Solo Tackles", shortLabel: "SOLO", type: "integer", group: "Defense", description: "Tackles made by this player alone.", howToTrack: "Tally when the player brings down the ball carrier without help." },
    { key: "tackles_assisted", label: "Assisted Tackles", shortLabel: "AST", type: "integer", group: "Defense", description: "Tackles made with help from teammates.", howToTrack: "Tally when the player helps bring down the ball carrier." },
    { key: "sacks", label: "Sacks", shortLabel: "SCK", type: "decimal", group: "Defense", description: "Tackles of the quarterback behind the line of scrimmage.", howToTrack: "Tally each time this player sacks the QB (0.5 for shared)." },
    { key: "interceptions_caught", label: "Interceptions", shortLabel: "INT", type: "integer", group: "Defense", description: "Passes caught from the opposing quarterback.", howToTrack: "Tally each pass this defender intercepts." },
    { key: "passes_defended", label: "Passes Defended", shortLabel: "PD", type: "integer", group: "Defense", description: "Passes broken up or knocked away.", howToTrack: "Tally when the defender breaks up a pass." },
    { key: "forced_fumbles", label: "Forced Fumbles", shortLabel: "FF", type: "integer", group: "Defense", description: "Fumbles caused by this defender.", howToTrack: "Tally when this player strips or knocks the ball loose." },
    { key: "fumble_recoveries", label: "Fumble Recoveries", shortLabel: "FR", type: "integer", group: "Defense", description: "Fumbles recovered by this player.", howToTrack: "Tally each fumble this player recovers." },
    // Kicking
    { key: "fg_made", label: "FG Made", shortLabel: "FGM", type: "integer", group: "Kicking", description: "Field goals successfully kicked.", howToTrack: "Tally each field goal that goes through the uprights." },
    { key: "fg_attempted", label: "FG Attempted", shortLabel: "FGA", type: "integer", group: "Kicking", description: "Field goal attempts.", howToTrack: "Tally each field goal attempt." },
    { key: "xp_made", label: "XP Made", shortLabel: "XPM", type: "integer", group: "Kicking", description: "Extra points made after touchdowns.", howToTrack: "Tally each successful extra point kick." },
    { key: "xp_attempted", label: "XP Attempted", shortLabel: "XPA", type: "integer", group: "Kicking", description: "Extra point attempts.", howToTrack: "Tally each extra point attempt." },
  ],
  computedStats: [
    {
      key: "completion_pct",
      label: "Completion %",
      shortLabel: "CMP%",
      description: "Percentage of passes completed. 60%+ is excellent for youth.",
      compute: (s) => s.pass_attempts > 0 ? (s.pass_completions / s.pass_attempts) * 100 : 0,
      format: (v) => v.toFixed(1) + "%",
    },
    {
      key: "yards_per_carry",
      label: "Yards/Carry",
      shortLabel: "YPC",
      description: "Average yards gained per rushing attempt. 4+ yards is good.",
      compute: (s) => s.rush_attempts > 0 ? s.rushing_yards / s.rush_attempts : 0,
      format: (v) => v.toFixed(1),
    },
    {
      key: "yards_per_catch",
      label: "Yards/Catch",
      shortLabel: "Y/R",
      description: "Average yards gained per reception.",
      compute: (s) => s.receptions > 0 ? s.receiving_yards / s.receptions : 0,
      format: (v) => v.toFixed(1),
    },
    {
      key: "total_tackles",
      label: "Total Tackles",
      shortLabel: "TKL",
      description: "Solo tackles + assisted tackles.",
      compute: (s) => (s.tackles_solo || 0) + (s.tackles_assisted || 0),
      format: (v) => v.toFixed(0),
    },
    {
      key: "total_tds",
      label: "Total TDs",
      shortLabel: "TD",
      description: "All touchdowns (passing + rushing + receiving).",
      compute: (s) => (s.passing_tds || 0) + (s.rushing_tds || 0) + (s.receiving_tds || 0),
      format: (v) => v.toFixed(0),
    },
  ],
  averageCards: [
    {
      key: "passing_ypg", label: "Pass YPG", description: "Passing yards per game.", statKey: "passing_yards",
      compute: (totals, n) => n > 0 ? totals.passing_yards / n : 0,
      format: (v) => v.toFixed(1),
    },
    {
      key: "rushing_ypg", label: "Rush YPG", description: "Rushing yards per game.", statKey: "rushing_yards",
      compute: (totals, n) => n > 0 ? (totals.rushing_yards || 0) / n : 0,
      format: (v) => v.toFixed(1),
    },
    {
      key: "receiving_ypg", label: "Rec YPG", description: "Receiving yards per game.", statKey: "receiving_yards",
      compute: (totals, n) => n > 0 ? (totals.receiving_yards || 0) / n : 0,
      format: (v) => v.toFixed(1),
    },
    {
      key: "tds_per_game", label: "TD/G", description: "Total touchdowns per game.", statKey: "computed",
      compute: (totals, n) => n > 0 ? ((totals.passing_tds || 0) + (totals.rushing_tds || 0) + (totals.receiving_tds || 0)) / n : 0,
      format: (v) => v.toFixed(1),
    },
    {
      key: "tackles_per_game", label: "TKL/G", description: "Total tackles per game.", statKey: "computed",
      compute: (totals, n) => n > 0 ? ((totals.tackles_solo || 0) + (totals.tackles_assisted || 0)) / n : 0,
      format: (v) => v.toFixed(1),
    },
  ],
  trendChartLines: [
    { dataKey: "passing_yards", label: "Pass YDS", color: "#6366f1", compute: (s) => s.passing_yards || 0 },
    { dataKey: "rushing_yards", label: "Rush YDS", color: "#22c55e", compute: (s) => s.rushing_yards || 0 },
    { dataKey: "receiving_yards", label: "Rec YDS", color: "#f59e0b", compute: (s) => s.receiving_yards || 0 },
  ],
  percentageChartLines: [
    { dataKey: "completion_pct", label: "CMP%", color: "#6366f1", compute: (s) => s.pass_attempts > 0 ? (s.pass_completions / s.pass_attempts) * 100 : 0 },
    { dataKey: "catch_pct", label: "Catch%", color: "#22c55e", compute: (s) => s.targets > 0 ? (s.receptions / s.targets) * 100 : 0 },
  ],
  tableColumns: [
    { key: "pass_completions", label: "CMP", description: "Pass completions", compute: (s) => s.pass_completions || 0 },
    { key: "passing_yards", label: "P.YDS", description: "Passing yards", compute: (s) => s.passing_yards || 0 },
    { key: "rushing_yards", label: "R.YDS", description: "Rushing yards", compute: (s) => s.rushing_yards || 0 },
    { key: "receptions", label: "REC", description: "Receptions", compute: (s) => s.receptions || 0 },
    { key: "receiving_yards", label: "REC.YDS", description: "Receiving yards", compute: (s) => s.receiving_yards || 0 },
    { key: "total_tds", label: "TD", description: "Total touchdowns", compute: (s) => (s.passing_tds || 0) + (s.rushing_tds || 0) + (s.receiving_tds || 0) },
    { key: "tackles", label: "TKL", description: "Total tackles", compute: (s) => (s.tackles_solo || 0) + (s.tackles_assisted || 0) },
    { key: "interceptions_caught", label: "INT", description: "Interceptions (defense)", compute: (s) => s.interceptions_caught || 0 },
  ],
  drillCategories: ["Passing", "Catching", "Running", "Blocking", "Tackling", "Conditioning", "Agility"],
  formAnalysisTypes: [
    {
      key: "throwing_mechanics",
      label: "Throwing Mechanics",
      description: "Analyze quarterback throwing form and release",
      promptTemplate: `You are an expert football quarterback coach analyzing throwing mechanics. Evaluate:
1. Stance and footwork in the pocket
2. Grip on the football
3. Wind-up and arm action
4. Elbow position and release point
5. Hip and shoulder rotation
6. Follow-through
7. Ball spiral and accuracy

Return your analysis as JSON with this exact structure:
{"overall_score": <1-100>, "strengths": ["..."], "improvements": ["..."], "detailed_analysis": "...", "drill_recommendations": ["..."]}`,
    },
    {
      key: "route_running",
      label: "Route Running",
      description: "Analyze receiver route technique and separation",
      promptTemplate: `You are an expert football receiving coach analyzing route running. Evaluate:
1. Stance and release off the line
2. Speed and acceleration
3. Breaking in and out of cuts
4. Hip fluidity and footwork at the break
5. Head and shoulder fakes
6. Hands positioning for the catch
7. Catching technique and securing the ball

Return your analysis as JSON with this exact structure:
{"overall_score": <1-100>, "strengths": ["..."], "improvements": ["..."], "detailed_analysis": "...", "drill_recommendations": ["..."]}`,
    },
    {
      key: "tackling_form",
      label: "Tackling Form",
      description: "Analyze defensive tackling technique",
      promptTemplate: `You are an expert football defensive coach analyzing tackling form. Evaluate:
1. Approach angle and breakdown
2. Pad level (staying low)
3. Head placement (head up, across the body)
4. Arm wrap and grip
5. Leg drive through contact
6. Finishing the tackle
7. Safety considerations (no leading with helmet)

Return your analysis as JSON with this exact structure:
{"overall_score": <1-100>, "strengths": ["..."], "improvements": ["..."], "detailed_analysis": "...", "drill_recommendations": ["..."]}`,
    },
  ],
  skillAreas: [
    {
      key: "passing",
      label: "Passing",
      description: "Accuracy, decision making, and arm strength",
      relatedStatKeys: ["pass_completions", "pass_attempts", "passing_yards", "passing_tds", "interceptions_thrown"],
      computeRating: (stats, gameCount) => {
        if (gameCount === 0 || !stats.pass_attempts) return 0;
        const compPct = stats.pass_completions / stats.pass_attempts;
        const ypa = stats.passing_yards / stats.pass_attempts;
        const tdRate = stats.passing_tds / stats.pass_attempts;
        const intRate = (stats.interceptions_thrown || 0) / stats.pass_attempts;
        return Math.min(100, Math.round((compPct * 30 + Math.min(ypa / 10, 1) * 25 + Math.min(tdRate / 0.08, 1) * 25 + (1 - Math.min(intRate / 0.05, 1)) * 20) * 100));
      },
    },
    {
      key: "rushing",
      label: "Rushing",
      description: "Ball carrying, vision, and power",
      relatedStatKeys: ["rush_attempts", "rushing_yards", "rushing_tds", "fumbles"],
      computeRating: (stats, gameCount) => {
        if (gameCount === 0 || !stats.rush_attempts) return 0;
        const ypc = stats.rushing_yards / stats.rush_attempts;
        const tdRate = (stats.rushing_tds || 0) / stats.rush_attempts;
        const fumbleRate = (stats.fumbles || 0) / stats.rush_attempts;
        return Math.min(100, Math.round((Math.min(ypc / 6, 1) * 50 + Math.min(tdRate / 0.1, 1) * 30 + (1 - Math.min(fumbleRate / 0.05, 1)) * 20) * 100));
      },
    },
    {
      key: "receiving",
      label: "Receiving",
      description: "Catching ability, route running, and yards after catch",
      relatedStatKeys: ["targets", "receptions", "receiving_yards", "receiving_tds"],
      computeRating: (stats, gameCount) => {
        if (gameCount === 0 || !stats.targets) return 0;
        const catchRate = stats.receptions / stats.targets;
        const ypr = stats.receptions > 0 ? stats.receiving_yards / stats.receptions : 0;
        return Math.min(100, Math.round((catchRate * 50 + Math.min(ypr / 15, 1) * 50) * 100));
      },
    },
    {
      key: "defense",
      label: "Defense",
      description: "Tackling, coverage, and playmaking",
      relatedStatKeys: ["tackles_solo", "tackles_assisted", "sacks", "interceptions_caught", "passes_defended"],
      computeRating: (stats, gameCount) => {
        if (gameCount === 0) return 0;
        const tpg = ((stats.tackles_solo || 0) + (stats.tackles_assisted || 0)) / gameCount;
        const bigPlays = ((stats.sacks || 0) + (stats.interceptions_caught || 0) + (stats.forced_fumbles || 0)) / gameCount;
        return Math.min(100, Math.round((Math.min(tpg / 10, 1) * 50 + Math.min(bigPlays / 1, 1) * 50) * 100));
      },
    },
  ],
  challengeTemplates: [
    { name: "Arm Day", description: "Complete 3 passing drills today", type: "daily", criteria: { metric: "drill_completions_category", target: 3, timeframe: "day" }, xp_reward: 50 },
    { name: "Gridiron Grinder", description: "Complete 15 drills this week", type: "weekly", criteria: { metric: "drill_completions", target: 15, timeframe: "week" }, xp_reward: 200 },
    { name: "Film Study", description: "Upload a form analysis video", type: "daily", criteria: { metric: "form_analyses", target: 1, timeframe: "day" }, xp_reward: 30 },
    { name: "Century Club", description: "Complete 100 total drills", type: "milestone", criteria: { metric: "total_drill_completions", target: 100 }, xp_reward: 500 },
    { name: "Streak Starter", description: "Maintain a 7-day practice streak", type: "milestone", criteria: { metric: "streak_days", target: 7 }, xp_reward: 300 },
  ],
};

// ============================================================
// TENNIS
// ============================================================
const tennisConfig: SportConfig = {
  id: "tennis",
  name: "Tennis",
  icon: "🎾",
  positions: ["Singles", "Doubles"],
  statFields: [
    // Serving
    { key: "aces", label: "Aces", shortLabel: "ACE", type: "integer", group: "Serving", description: "Serves that the opponent cannot touch, resulting in a point.", howToTrack: "Tally each serve that lands in and the opponent doesn't touch." },
    { key: "double_faults", label: "Double Faults", shortLabel: "DF", type: "integer", group: "Serving", description: "Two consecutive serve faults, giving the point to the opponent.", howToTrack: "Tally each time both first and second serves miss." },
    { key: "first_serves_in", label: "1st Serves In", shortLabel: "1st In", type: "integer", group: "Serving", description: "First serves that land in the service box.", howToTrack: "Tally each first serve that lands in." },
    { key: "first_serves_total", label: "1st Serve Attempts", shortLabel: "1st Att", type: "integer", group: "Serving", description: "Total first serve attempts.", howToTrack: "Tally every first serve attempted." },
    { key: "first_serve_points_won", label: "1st Serve Pts Won", shortLabel: "1st Won", type: "integer", group: "Serving", description: "Points won when the first serve lands in.", howToTrack: "Tally points won after making the first serve." },
    { key: "second_serve_points_won", label: "2nd Serve Pts Won", shortLabel: "2nd Won", type: "integer", group: "Serving", description: "Points won when serving on second serve.", howToTrack: "Tally points won after a first serve fault." },
    { key: "second_serve_attempts", label: "2nd Serve Attempts", shortLabel: "2nd Att", type: "integer", group: "Serving", description: "Total second serve attempts (after first serve faults).", howToTrack: "Tally each second serve attempted." },
    // Returning
    { key: "return_points_won", label: "Return Pts Won", shortLabel: "Ret Won", type: "integer", group: "Returning", description: "Points won while returning serve.", howToTrack: "Tally points won when the opponent was serving." },
    { key: "return_points_played", label: "Return Pts Played", shortLabel: "Ret Pld", type: "integer", group: "Returning", description: "Total points played while returning.", howToTrack: "Tally all points where the opponent served." },
    { key: "break_points_converted", label: "Break Pts Converted", shortLabel: "BP Conv", type: "integer", group: "Returning", description: "Break points converted (winning an opponent's service game).", howToTrack: "Tally each break point that results in winning the game." },
    { key: "break_points_faced", label: "Break Pts Faced", shortLabel: "BP Faced", type: "integer", group: "Returning", description: "Break points opportunities you had.", howToTrack: "Tally each break point opportunity." },
    // Rally
    { key: "winners", label: "Winners", shortLabel: "WIN", type: "integer", group: "Rally", description: "Shots that win the point outright (opponent can't reach it).", howToTrack: "Tally each shot that wins the point without an error." },
    { key: "unforced_errors", label: "Unforced Errors", shortLabel: "UE", type: "integer", group: "Rally", description: "Errors made without pressure from the opponent.", howToTrack: "Tally errors on routine shots without pressure." },
    { key: "forced_errors", label: "Forced Errors", shortLabel: "FE", type: "integer", group: "Rally", description: "Errors caused by good shots from the opponent.", howToTrack: "Tally errors made due to opponent's pressure." },
    { key: "net_points_won", label: "Net Pts Won", shortLabel: "Net Won", type: "integer", group: "Rally", description: "Points won when approaching the net.", howToTrack: "Tally points won when you came to the net." },
    { key: "net_points_played", label: "Net Pts Played", shortLabel: "Net Pld", type: "integer", group: "Rally", description: "Total points where you approached the net.", howToTrack: "Tally all points where you came to the net." },
    // Match
    { key: "games_won", label: "Games Won", shortLabel: "G Won", type: "integer", group: "Match", description: "Total games won in the match.", howToTrack: "Count games won at the end of each set." },
    { key: "games_lost", label: "Games Lost", shortLabel: "G Lost", type: "integer", group: "Match", description: "Total games lost in the match.", howToTrack: "Count games lost at the end of each set." },
    { key: "sets_won", label: "Sets Won", shortLabel: "S Won", type: "integer", group: "Match", description: "Sets won in the match.", howToTrack: "Count sets won." },
    { key: "sets_lost", label: "Sets Lost", shortLabel: "S Lost", type: "integer", group: "Match", description: "Sets lost in the match.", howToTrack: "Count sets lost." },
  ],
  computedStats: [
    {
      key: "first_serve_pct",
      label: "1st Serve %",
      shortLabel: "1st%",
      description: "Percentage of first serves that land in. 60%+ is good.",
      compute: (s) => s.first_serves_total > 0 ? (s.first_serves_in / s.first_serves_total) * 100 : 0,
      format: (v) => v.toFixed(1) + "%",
    },
    {
      key: "first_serve_win_pct",
      label: "1st Serve Win %",
      shortLabel: "1stW%",
      description: "Points won when first serve lands in. 70%+ is strong.",
      compute: (s) => s.first_serves_in > 0 ? (s.first_serve_points_won / s.first_serves_in) * 100 : 0,
      format: (v) => v.toFixed(1) + "%",
    },
    {
      key: "winner_ue_ratio",
      label: "Winner/UE Ratio",
      shortLabel: "W/UE",
      description: "Winners divided by unforced errors. Above 1.0 is good.",
      compute: (s) => s.unforced_errors > 0 ? s.winners / s.unforced_errors : s.winners || 0,
      format: (v) => v.toFixed(2),
    },
    {
      key: "break_point_conversion",
      label: "Break Pt Conv %",
      shortLabel: "BP%",
      description: "Percentage of break points converted.",
      compute: (s) => s.break_points_faced > 0 ? (s.break_points_converted / s.break_points_faced) * 100 : 0,
      format: (v) => v.toFixed(1) + "%",
    },
  ],
  averageCards: [
    {
      key: "aces_per_match", label: "Aces/M", description: "Average aces per match.", statKey: "aces",
      compute: (totals, n) => n > 0 ? totals.aces / n : 0,
      format: (v) => v.toFixed(1),
    },
    {
      key: "winners_per_match", label: "Win/M", description: "Average winners per match.", statKey: "winners",
      compute: (totals, n) => n > 0 ? (totals.winners || 0) / n : 0,
      format: (v) => v.toFixed(1),
    },
    {
      key: "first_serve_pct", label: "1st%", description: "Overall first serve percentage.", statKey: "computed",
      compute: (totals) => totals.first_serves_total > 0 ? (totals.first_serves_in / totals.first_serves_total) * 100 : 0,
      format: (v) => v.toFixed(1) + "%",
    },
    {
      key: "winner_ue", label: "W/UE", description: "Overall winner to unforced error ratio.", statKey: "computed",
      compute: (totals) => totals.unforced_errors > 0 ? (totals.winners || 0) / totals.unforced_errors : (totals.winners || 0),
      format: (v) => v.toFixed(2),
    },
    {
      key: "win_pct", label: "Win %", description: "Match win percentage.", statKey: "computed",
      compute: (totals, n) => {
        const wins = totals.sets_won > totals.sets_lost ? 1 : 0;
        return n > 0 ? (wins / n) * 100 : 0;
      },
      format: (v) => v.toFixed(1) + "%",
    },
  ],
  trendChartLines: [
    { dataKey: "aces", label: "Aces", color: "#6366f1", compute: (s) => s.aces || 0 },
    { dataKey: "winners", label: "Winners", color: "#22c55e", compute: (s) => s.winners || 0 },
    { dataKey: "unforced_errors", label: "UE", color: "#ef4444", compute: (s) => s.unforced_errors || 0 },
  ],
  percentageChartLines: [
    { dataKey: "first_serve_pct", label: "1st Serve%", color: "#6366f1", compute: (s) => s.first_serves_total > 0 ? (s.first_serves_in / s.first_serves_total) * 100 : 0 },
    { dataKey: "return_win_pct", label: "Return Win%", color: "#22c55e", compute: (s) => s.return_points_played > 0 ? (s.return_points_won / s.return_points_played) * 100 : 0 },
  ],
  tableColumns: [
    { key: "aces", label: "ACE", description: "Aces served", compute: (s) => s.aces || 0 },
    { key: "double_faults", label: "DF", description: "Double faults", compute: (s) => s.double_faults || 0 },
    { key: "first_serve_pct", label: "1st%", description: "First serve percentage", compute: (s) => s.first_serves_total > 0 ? ((s.first_serves_in / s.first_serves_total) * 100).toFixed(1) + "%" : "—" },
    { key: "winners", label: "WIN", description: "Winners hit", compute: (s) => s.winners || 0 },
    { key: "unforced_errors", label: "UE", description: "Unforced errors", compute: (s) => s.unforced_errors || 0 },
    { key: "games_won", label: "G", description: "Games won", compute: (s) => s.games_won || 0 },
    { key: "sets_won", label: "S", description: "Sets won", compute: (s) => s.sets_won || 0 },
    { key: "result", label: "Result", description: "Match result", compute: (s) => (s.sets_won || 0) > (s.sets_lost || 0) ? "W" : "L" },
  ],
  drillCategories: ["Serving", "Groundstrokes", "Volleys", "Footwork", "Returns", "Conditioning", "Mental"],
  formAnalysisTypes: [
    {
      key: "serve_technique",
      label: "Serve Technique",
      description: "Analyze serve motion, toss, and power",
      promptTemplate: `You are an expert tennis coach analyzing serve technique. Evaluate:
1. Ready position and stance
2. Ball toss height, placement, and consistency
3. Trophy position (racket back, elbow high)
4. Leg drive and body coil
5. Pronation and wrist snap at contact
6. Contact point height and extension
7. Follow-through and recovery

Return your analysis as JSON with this exact structure:
{"overall_score": <1-100>, "strengths": ["..."], "improvements": ["..."], "detailed_analysis": "...", "drill_recommendations": ["..."]}`,
    },
    {
      key: "forehand_technique",
      label: "Forehand Technique",
      description: "Analyze forehand groundstroke mechanics",
      promptTemplate: `You are an expert tennis coach analyzing forehand technique. Evaluate:
1. Ready position and split step
2. Unit turn and early racket preparation
3. Grip (Eastern, Semi-Western, Western)
4. Footwork and weight transfer
5. Contact point relative to body
6. Racket path and topspin generation
7. Follow-through and recovery

Return your analysis as JSON with this exact structure:
{"overall_score": <1-100>, "strengths": ["..."], "improvements": ["..."], "detailed_analysis": "...", "drill_recommendations": ["..."]}`,
    },
    {
      key: "backhand_technique",
      label: "Backhand Technique",
      description: "Analyze one-handed or two-handed backhand",
      promptTemplate: `You are an expert tennis coach analyzing backhand technique. Evaluate:
1. Grip (one-hand vs two-hand)
2. Shoulder turn and racket preparation
3. Footwork and stance (open vs closed)
4. Contact point and extension
5. Hip and shoulder rotation
6. Racket path and spin
7. Follow-through and balance

Return your analysis as JSON with this exact structure:
{"overall_score": <1-100>, "strengths": ["..."], "improvements": ["..."], "detailed_analysis": "...", "drill_recommendations": ["..."]}`,
    },
  ],
  skillAreas: [
    {
      key: "serving",
      label: "Serving",
      description: "Serve accuracy, power, and variety",
      relatedStatKeys: ["aces", "double_faults", "first_serves_in", "first_serves_total", "first_serve_points_won"],
      computeRating: (stats, gameCount) => {
        if (gameCount === 0) return 0;
        const firstPct = stats.first_serves_total > 0 ? stats.first_serves_in / stats.first_serves_total : 0;
        const aceRate = stats.first_serves_total > 0 ? (stats.aces || 0) / stats.first_serves_total : 0;
        const dfRate = stats.first_serves_total > 0 ? (stats.double_faults || 0) / stats.first_serves_total : 0;
        return Math.min(100, Math.round((firstPct * 40 + Math.min(aceRate / 0.1, 1) * 30 + (1 - Math.min(dfRate / 0.1, 1)) * 30) * 100));
      },
    },
    {
      key: "returning",
      label: "Returning",
      description: "Return effectiveness and break point conversion",
      relatedStatKeys: ["return_points_won", "return_points_played", "break_points_converted", "break_points_faced"],
      computeRating: (stats, gameCount) => {
        if (gameCount === 0) return 0;
        const returnPct = stats.return_points_played > 0 ? stats.return_points_won / stats.return_points_played : 0;
        const bpConv = stats.break_points_faced > 0 ? stats.break_points_converted / stats.break_points_faced : 0;
        return Math.min(100, Math.round((returnPct * 50 + bpConv * 50) * 100));
      },
    },
    {
      key: "groundstrokes",
      label: "Groundstrokes",
      description: "Consistency, power, and shot selection",
      relatedStatKeys: ["winners", "unforced_errors", "forced_errors"],
      computeRating: (stats, gameCount) => {
        if (gameCount === 0) return 0;
        const winnerUE = stats.unforced_errors > 0 ? (stats.winners || 0) / stats.unforced_errors : (stats.winners || 0);
        return Math.min(100, Math.round(Math.min(winnerUE / 1.5, 1) * 100));
      },
    },
    {
      key: "net_game",
      label: "Net Game",
      description: "Volleying and net approach effectiveness",
      relatedStatKeys: ["net_points_won", "net_points_played"],
      computeRating: (stats, gameCount) => {
        if (gameCount === 0) return 0;
        const netPct = stats.net_points_played > 0 ? stats.net_points_won / stats.net_points_played : 0;
        return Math.min(100, Math.round(netPct * 100));
      },
    },
  ],
  challengeTemplates: [
    { name: "Serve Practice", description: "Complete 3 serving drills today", type: "daily", criteria: { metric: "drill_completions_category", target: 3, timeframe: "day" }, xp_reward: 50 },
    { name: "Court Warrior", description: "Complete 15 drills this week", type: "weekly", criteria: { metric: "drill_completions", target: 15, timeframe: "week" }, xp_reward: 200 },
    { name: "Film Study", description: "Upload a form analysis video", type: "daily", criteria: { metric: "form_analyses", target: 1, timeframe: "day" }, xp_reward: 30 },
    { name: "Century Club", description: "Complete 100 total drills", type: "milestone", criteria: { metric: "total_drill_completions", target: 100 }, xp_reward: 500 },
    { name: "Streak Starter", description: "Maintain a 7-day practice streak", type: "milestone", criteria: { metric: "streak_days", target: 7 }, xp_reward: 300 },
  ],
};

// ============================================================
// VOLLEYBALL
// ============================================================
const volleyballConfig: SportConfig = {
  id: "volleyball",
  name: "Volleyball",
  icon: "🏐",
  positions: ["Setter", "Outside Hitter", "Middle Blocker", "Opposite", "Libero", "Defensive Specialist"],
  statFields: [
    // Attacking
    { key: "kills", label: "Kills", shortLabel: "K", type: "integer", group: "Attacking", description: "Attacks that result in an immediate point (ball hits the floor or opponent's error on the attack).", howToTrack: "Tally each attack that directly wins the point." },
    { key: "attack_attempts", label: "Attack Attempts", shortLabel: "ATT", type: "integer", group: "Attacking", description: "Total number of attack swings.", howToTrack: "Tally every time the player swings to attack." },
    { key: "attack_errors", label: "Attack Errors", shortLabel: "AE", type: "integer", group: "Attacking", description: "Attacks that go out of bounds, into the net, or are blocked for a point.", howToTrack: "Tally attacks that result in a point for the opponent." },
    // Serving
    { key: "aces", label: "Service Aces", shortLabel: "SA", type: "integer", group: "Serving", description: "Serves that result in an immediate point.", howToTrack: "Tally serves that hit the floor or cause an unplayable pass." },
    { key: "serve_attempts", label: "Serve Attempts", shortLabel: "S.ATT", type: "integer", group: "Serving", description: "Total serves attempted.", howToTrack: "Tally every serve." },
    { key: "serve_errors", label: "Serve Errors", shortLabel: "SE", type: "integer", group: "Serving", description: "Serves into the net or out of bounds.", howToTrack: "Tally serves that miss." },
    // Passing/Reception
    { key: "receptions", label: "Receptions", shortLabel: "REC", type: "integer", group: "Passing", description: "Serve receives attempted.", howToTrack: "Tally each time the player receives a serve." },
    { key: "reception_errors", label: "Reception Errors", shortLabel: "RE", type: "integer", group: "Passing", description: "Poor passes that result in a point for the opponent.", howToTrack: "Tally passes that lead directly to opponent points." },
    { key: "perfect_passes", label: "Perfect Passes", shortLabel: "PP", type: "integer", group: "Passing", description: "Passes rated as perfect (3-point pass to target).", howToTrack: "Tally passes that reach the setter perfectly in zone." },
    // Setting
    { key: "assists", label: "Assists", shortLabel: "A", type: "integer", group: "Setting", description: "Sets that directly lead to a kill.", howToTrack: "Tally when your set leads to a teammate's kill." },
    { key: "ball_handling_errors", label: "BH Errors", shortLabel: "BHE", type: "integer", group: "Setting", description: "Double contacts or lifts called on sets.", howToTrack: "Tally setting violations called by the referee." },
    // Blocking
    { key: "blocks_solo", label: "Solo Blocks", shortLabel: "BS", type: "integer", group: "Blocking", description: "Blocks made alone that result in a point.", howToTrack: "Tally blocks where only you touched the ball." },
    { key: "blocks_assisted", label: "Block Assists", shortLabel: "BA", type: "integer", group: "Blocking", description: "Blocks made with teammates that result in a point.", howToTrack: "Tally blocks where multiple players touched the ball." },
    { key: "block_errors", label: "Block Errors", shortLabel: "BE", type: "integer", group: "Blocking", description: "Net violations or touches that result in opponent points.", howToTrack: "Tally net touches and blocking errors." },
    // Defense
    { key: "digs", label: "Digs", shortLabel: "D", type: "integer", group: "Defense", description: "Successful defensive plays on attacked balls.", howToTrack: "Tally each attack you successfully dig up." },
    { key: "dig_errors", label: "Dig Errors", shortLabel: "DE", type: "integer", group: "Defense", description: "Defensive plays that result in a point for the opponent.", howToTrack: "Tally when a ball hits the floor you were trying to dig." },
    // Points
    { key: "points_scored", label: "Points", shortLabel: "PTS", type: "integer", group: "Points", description: "Total points contributed (kills + aces + blocks).", howToTrack: "Add up kills, aces, and blocks." },
  ],
  computedStats: [
    {
      key: "hitting_pct",
      label: "Hitting %",
      shortLabel: "HIT%",
      description: "Kills minus errors divided by attempts. Above .300 is excellent.",
      compute: (s) => s.attack_attempts > 0 ? ((s.kills - s.attack_errors) / s.attack_attempts) : 0,
      format: (v) => v.toFixed(3).replace(/^0/, ""),
    },
    {
      key: "kill_pct",
      label: "Kill %",
      shortLabel: "K%",
      description: "Percentage of attacks that result in kills. 40%+ is strong.",
      compute: (s) => s.attack_attempts > 0 ? (s.kills / s.attack_attempts) * 100 : 0,
      format: (v) => v.toFixed(1) + "%",
    },
    {
      key: "pass_rating",
      label: "Pass Rating",
      shortLabel: "Pass",
      description: "Average pass quality (0-3 scale). 2.0+ is good.",
      compute: (s) => s.receptions > 0 ? ((s.perfect_passes || 0) * 3) / s.receptions : 0,
      format: (v) => v.toFixed(2),
    },
    {
      key: "total_blocks",
      label: "Total Blocks",
      shortLabel: "TB",
      description: "Solo blocks plus half of assisted blocks.",
      compute: (s) => (s.blocks_solo || 0) + (s.blocks_assisted || 0) * 0.5,
      format: (v) => v.toFixed(1),
    },
  ],
  averageCards: [
    {
      key: "kills_per_set", label: "K/S", description: "Kills per set played.", statKey: "kills",
      compute: (totals, n) => n > 0 ? totals.kills / (n * 3) : 0, // Assuming ~3 sets per match
      format: (v) => v.toFixed(2),
    },
    {
      key: "hitting_pct", label: "HIT%", description: "Overall hitting percentage.", statKey: "computed",
      compute: (totals) => totals.attack_attempts > 0 ? (totals.kills - totals.attack_errors) / totals.attack_attempts : 0,
      format: (v) => v.toFixed(3).replace(/^0/, ""),
    },
    {
      key: "assists_per_set", label: "A/S", description: "Assists per set played.", statKey: "assists",
      compute: (totals, n) => n > 0 ? (totals.assists || 0) / (n * 3) : 0,
      format: (v) => v.toFixed(2),
    },
    {
      key: "digs_per_set", label: "D/S", description: "Digs per set played.", statKey: "digs",
      compute: (totals, n) => n > 0 ? (totals.digs || 0) / (n * 3) : 0,
      format: (v) => v.toFixed(2),
    },
    {
      key: "aces_per_set", label: "SA/S", description: "Service aces per set played.", statKey: "aces",
      compute: (totals, n) => n > 0 ? (totals.aces || 0) / (n * 3) : 0,
      format: (v) => v.toFixed(2),
    },
  ],
  trendChartLines: [
    { dataKey: "kills", label: "Kills", color: "#6366f1", compute: (s) => s.kills || 0 },
    { dataKey: "digs", label: "Digs", color: "#22c55e", compute: (s) => s.digs || 0 },
    { dataKey: "assists", label: "Assists", color: "#f59e0b", compute: (s) => s.assists || 0 },
  ],
  percentageChartLines: [
    { dataKey: "hitting_pct", label: "Hit%", color: "#6366f1", compute: (s) => s.attack_attempts > 0 ? ((s.kills - s.attack_errors) / s.attack_attempts) * 100 : 0 },
    { dataKey: "kill_pct", label: "Kill%", color: "#22c55e", compute: (s) => s.attack_attempts > 0 ? (s.kills / s.attack_attempts) * 100 : 0 },
  ],
  tableColumns: [
    { key: "kills", label: "K", description: "Kills", compute: (s) => s.kills || 0 },
    { key: "attack_errors", label: "AE", description: "Attack errors", compute: (s) => s.attack_errors || 0 },
    { key: "hitting_pct", label: "HIT%", description: "Hitting percentage", compute: (s) => s.attack_attempts > 0 ? ((s.kills - s.attack_errors) / s.attack_attempts).toFixed(3).replace(/^0/, "") : "—" },
    { key: "assists", label: "A", description: "Assists", compute: (s) => s.assists || 0 },
    { key: "aces", label: "SA", description: "Service aces", compute: (s) => s.aces || 0 },
    { key: "digs", label: "D", description: "Digs", compute: (s) => s.digs || 0 },
    { key: "blocks", label: "B", description: "Total blocks", compute: (s) => (s.blocks_solo || 0) + (s.blocks_assisted || 0) },
    { key: "points", label: "PTS", description: "Total points", compute: (s) => (s.kills || 0) + (s.aces || 0) + (s.blocks_solo || 0) + (s.blocks_assisted || 0) * 0.5 },
  ],
  drillCategories: ["Hitting", "Serving", "Passing", "Setting", "Blocking", "Defense", "Conditioning"],
  formAnalysisTypes: [
    {
      key: "attacking_form",
      label: "Attacking Form",
      description: "Analyze approach, jump, and swing mechanics",
      promptTemplate: `You are an expert volleyball coach analyzing attacking technique. Evaluate:
1. Approach footwork (3-step or 4-step)
2. Arm swing timing and load
3. Jump height and timing relative to set
4. Shoulder and hip rotation
5. Contact point height and in front of body
6. Wrist snap and follow-through
7. Landing balance and safety

Return your analysis as JSON with this exact structure:
{"overall_score": <1-100>, "strengths": ["..."], "improvements": ["..."], "detailed_analysis": "...", "drill_recommendations": ["..."]}`,
    },
    {
      key: "serve_technique",
      label: "Serve Technique",
      description: "Analyze float serve, jump serve, or topspin serve",
      promptTemplate: `You are an expert volleyball coach analyzing serve technique. Evaluate:
1. Starting position and ball hold
2. Toss height and placement
3. Approach footwork (for jump serve)
4. Contact point and hand shape
5. Arm swing path
6. Follow-through and body control
7. Consistency and targeting

Return your analysis as JSON with this exact structure:
{"overall_score": <1-100>, "strengths": ["..."], "improvements": ["..."], "detailed_analysis": "...", "drill_recommendations": ["..."]}`,
    },
    {
      key: "passing_platform",
      label: "Passing Platform",
      description: "Analyze serve receive and platform technique",
      promptTemplate: `You are an expert volleyball coach analyzing passing technique. Evaluate:
1. Ready position and stance
2. Platform formation (arms together, flat surface)
3. Footwork to the ball
4. Body posture and angle to target
5. Contact point on the arms
6. Absorbing vs directing the ball
7. Follow-through toward target

Return your analysis as JSON with this exact structure:
{"overall_score": <1-100>, "strengths": ["..."], "improvements": ["..."], "detailed_analysis": "...", "drill_recommendations": ["..."]}`,
    },
  ],
  skillAreas: [
    {
      key: "attacking",
      label: "Attacking",
      description: "Kill efficiency and hitting power",
      relatedStatKeys: ["kills", "attack_attempts", "attack_errors"],
      computeRating: (stats, gameCount) => {
        if (gameCount === 0 || !stats.attack_attempts) return 0;
        const hitPct = (stats.kills - stats.attack_errors) / stats.attack_attempts;
        const killPct = stats.kills / stats.attack_attempts;
        return Math.min(100, Math.round((hitPct / 0.4 * 50 + killPct * 50) * 100));
      },
    },
    {
      key: "serving",
      label: "Serving",
      description: "Aces, consistency, and pressure",
      relatedStatKeys: ["aces", "serve_attempts", "serve_errors"],
      computeRating: (stats, gameCount) => {
        if (gameCount === 0 || !stats.serve_attempts) return 0;
        const aceRate = (stats.aces || 0) / stats.serve_attempts;
        const errorRate = (stats.serve_errors || 0) / stats.serve_attempts;
        return Math.min(100, Math.round((Math.min(aceRate / 0.1, 1) * 50 + (1 - Math.min(errorRate / 0.15, 1)) * 50) * 100));
      },
    },
    {
      key: "passing",
      label: "Passing",
      description: "Serve receive and ball control",
      relatedStatKeys: ["receptions", "reception_errors", "perfect_passes"],
      computeRating: (stats, gameCount) => {
        if (gameCount === 0 || !stats.receptions) return 0;
        const passRating = ((stats.perfect_passes || 0) * 3) / stats.receptions;
        const errorRate = (stats.reception_errors || 0) / stats.receptions;
        return Math.min(100, Math.round((passRating / 3 * 60 + (1 - errorRate) * 40) * 100));
      },
    },
    {
      key: "defense",
      label: "Defense",
      description: "Digging and floor defense",
      relatedStatKeys: ["digs", "dig_errors"],
      computeRating: (stats, gameCount) => {
        if (gameCount === 0) return 0;
        const dpg = (stats.digs || 0) / gameCount;
        const errorRate = (stats.digs || 0) > 0 ? (stats.dig_errors || 0) / ((stats.digs || 0) + (stats.dig_errors || 0)) : 0;
        return Math.min(100, Math.round((Math.min(dpg / 15, 1) * 60 + (1 - errorRate) * 40) * 100));
      },
    },
    {
      key: "blocking",
      label: "Blocking",
      description: "Net presence and block effectiveness",
      relatedStatKeys: ["blocks_solo", "blocks_assisted", "block_errors"],
      computeRating: (stats, gameCount) => {
        if (gameCount === 0) return 0;
        const bpg = ((stats.blocks_solo || 0) + (stats.blocks_assisted || 0) * 0.5) / gameCount;
        return Math.min(100, Math.round(Math.min(bpg / 2, 1) * 100));
      },
    },
  ],
  challengeTemplates: [
    { name: "Hitting Practice", description: "Complete 3 hitting drills today", type: "daily", criteria: { metric: "drill_completions_category", target: 3, timeframe: "day" }, xp_reward: 50 },
    { name: "Court Dominator", description: "Complete 15 drills this week", type: "weekly", criteria: { metric: "drill_completions", target: 15, timeframe: "week" }, xp_reward: 200 },
    { name: "Film Study", description: "Upload a form analysis video", type: "daily", criteria: { metric: "form_analyses", target: 1, timeframe: "day" }, xp_reward: 30 },
    { name: "Century Club", description: "Complete 100 total drills", type: "milestone", criteria: { metric: "total_drill_completions", target: 100 }, xp_reward: 500 },
    { name: "Streak Starter", description: "Maintain a 7-day practice streak", type: "milestone", criteria: { metric: "streak_days", target: 7 }, xp_reward: 300 },
  ],
};

// ============================================================
// EXPORTS
// ============================================================
export const SPORTS: Record<SportId, SportConfig> = {
  basketball: basketballConfig,
  baseball: baseballConfig,
  soccer: soccerConfig,
  football: footballConfig,
  tennis: tennisConfig,
  volleyball: volleyballConfig,
};

export const getSportConfig = (sport: SportId): SportConfig => SPORTS[sport];

export const SPORT_LIST = Object.values(SPORTS);

export const DEFAULT_SPORT: SportId = "basketball";

// Helper: sum stats across multiple games
export function sumStats(games: Array<{ stats: Record<string, number> }>): Record<string, number> {
  return games.reduce((totals, game) => {
    const stats = game.stats || {};
    for (const [key, value] of Object.entries(stats)) {
      totals[key] = (totals[key] || 0) + (Number(value) || 0);
    }
    return totals;
  }, {} as Record<string, number>);
}

// Helper: group stat fields by their group name
export function groupStatFields(fields: StatFieldDef[]): Record<string, StatFieldDef[]> {
  return fields.reduce((groups, field) => {
    if (!groups[field.group]) groups[field.group] = [];
    groups[field.group].push(field);
    return groups;
  }, {} as Record<string, StatFieldDef[]>);
}
