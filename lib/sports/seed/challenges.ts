interface ChallengeSeed {
    sport: string | null;
    name: string;
    description: string;
    type: string;
    criteria: { metric: string; target: number; timeframe?: string };
    xp_reward: number;
}

export const challengesSeed: ChallengeSeed[] = [
    // Daily challenges (all sports)
    { sport: null, name: "Daily Drill", description: "Complete 1 drill today", type: "daily", criteria: { metric: "drill_completions", target: 1, timeframe: "day" }, xp_reward: 20 },
    { sport: null, name: "Drill Machine", description: "Complete 3 drills today", type: "daily", criteria: { metric: "drill_completions", target: 3, timeframe: "day" }, xp_reward: 50 },
    { sport: null, name: "Drill Maniac", description: "Complete 5 drills today", type: "daily", criteria: { metric: "drill_completions", target: 5, timeframe: "day" }, xp_reward: 80 },
    { sport: null, name: "Film Study", description: "Upload a form analysis video", type: "daily", criteria: { metric: "form_analyses", target: 1, timeframe: "day" }, xp_reward: 30 },
    { sport: null, name: "Game Day", description: "Log a game", type: "daily", criteria: { metric: "games_logged", target: 1, timeframe: "day" }, xp_reward: 25 },

    // Weekly challenges (all sports)
    { sport: null, name: "Weekly Grinder", description: "Complete 10 drills this week", type: "weekly", criteria: { metric: "drill_completions", target: 10, timeframe: "week" }, xp_reward: 150 },
    { sport: null, name: "Iron Will", description: "Complete 20 drills this week", type: "weekly", criteria: { metric: "drill_completions", target: 20, timeframe: "week" }, xp_reward: 300 },
    { sport: null, name: "Form Focused", description: "Upload 3 form analyses this week", type: "weekly", criteria: { metric: "form_analyses", target: 3, timeframe: "week" }, xp_reward: 100 },

    // Basketball daily
    { sport: "basketball", name: "Shot Doctor", description: "Complete 2 shooting drills", type: "daily", criteria: { metric: "drill_completions_category", target: 2, timeframe: "day" }, xp_reward: 40 },
    { sport: "basketball", name: "Lockdown", description: "Complete 2 defense drills", type: "daily", criteria: { metric: "drill_completions_category", target: 2, timeframe: "day" }, xp_reward: 40 },

    // Baseball daily
    { sport: "baseball", name: "Batting Practice", description: "Complete 2 batting drills", type: "daily", criteria: { metric: "drill_completions_category", target: 2, timeframe: "day" }, xp_reward: 40 },
    { sport: "baseball", name: "Iron Arm", description: "Complete 2 pitching drills", type: "daily", criteria: { metric: "drill_completions_category", target: 2, timeframe: "day" }, xp_reward: 40 },

    // Soccer daily
    { sport: "soccer", name: "Pitch Perfect", description: "Complete 2 passing drills", type: "daily", criteria: { metric: "drill_completions_category", target: 2, timeframe: "day" }, xp_reward: 40 },
    { sport: "soccer", name: "Clinical Finisher", description: "Complete 2 finishing drills", type: "daily", criteria: { metric: "drill_completions_category", target: 2, timeframe: "day" }, xp_reward: 40 },

    // Milestone challenges
    { sport: null, name: "First Steps", description: "Complete your first drill", type: "milestone", criteria: { metric: "total_drill_completions", target: 1 }, xp_reward: 50 },
    { sport: null, name: "Getting Warmed Up", description: "Complete 10 total drills", type: "milestone", criteria: { metric: "total_drill_completions", target: 10 }, xp_reward: 100 },
    { sport: null, name: "Dedicated", description: "Complete 50 total drills", type: "milestone", criteria: { metric: "total_drill_completions", target: 50 }, xp_reward: 300 },
    { sport: null, name: "Century Club", description: "Complete 100 total drills", type: "milestone", criteria: { metric: "total_drill_completions", target: 100 }, xp_reward: 500 },
    { sport: null, name: "Streak Starter", description: "Maintain a 7-day practice streak", type: "milestone", criteria: { metric: "streak_days", target: 7 }, xp_reward: 300 },
    { sport: null, name: "Streak Master", description: "Maintain a 30-day practice streak", type: "milestone", criteria: { metric: "streak_days", target: 30 }, xp_reward: 1000 },
];
