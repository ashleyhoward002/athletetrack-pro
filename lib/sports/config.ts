// ============================================================
// Multi-Sport Configuration Module
// ============================================================
// This is the single source of truth for all sport-specific
// stat fields, positions, computed stats, chart definitions,
// and display configurations. Every component reads from here.
// ============================================================

export type SportId = "basketball" | "baseball" | "soccer";

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
};

// ============================================================
// EXPORTS
// ============================================================
export const SPORTS: Record<SportId, SportConfig> = {
  basketball: basketballConfig,
  baseball: baseballConfig,
  soccer: soccerConfig,
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
