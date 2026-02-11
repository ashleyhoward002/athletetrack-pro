// ============================================================
// Physical Development Metrics Configuration
// ============================================================
// Defines sport-specific physical/athletic metrics that track
// an athlete's physical development over time (separate from game stats)
// ============================================================

import { SportId } from "./config";

export interface PhysicalMetricDef {
  key: string;
  label: string;
  shortLabel: string;
  unit: string;
  type: "number" | "time" | "distance";
  description: string;
  howToMeasure: string;
  benchmarks?: {
    youth?: { poor: number; average: number; good: number; elite: number };
    highSchool?: { poor: number; average: number; good: number; elite: number };
  };
  higherIsBetter: boolean;
}

export interface PhysicalMetricCategory {
  category: string;
  icon: string;
  metrics: PhysicalMetricDef[];
}

export interface SportPhysicalConfig {
  sportId: SportId;
  categories: PhysicalMetricCategory[];
}

// ============================================================
// UNIVERSAL METRICS (All Sports)
// ============================================================
const universalMetrics: PhysicalMetricCategory = {
  category: "Body Measurements",
  icon: "📏",
  metrics: [
    {
      key: "height",
      label: "Height",
      shortLabel: "HT",
      unit: "inches",
      type: "number",
      description: "Standing height without shoes",
      howToMeasure: "Stand barefoot against a wall with heels together, measure from floor to top of head",
      higherIsBetter: true,
    },
    {
      key: "weight",
      label: "Weight",
      shortLabel: "WT",
      unit: "lbs",
      type: "number",
      description: "Body weight",
      howToMeasure: "Weigh in the morning before eating, wearing light clothing",
      higherIsBetter: false, // Neutral, depends on sport
    },
    {
      key: "wingspan",
      label: "Wingspan",
      shortLabel: "WS",
      unit: "inches",
      type: "number",
      description: "Fingertip to fingertip with arms extended horizontally",
      howToMeasure: "Stand against wall, extend arms horizontally, measure from fingertip to fingertip",
      higherIsBetter: true,
    },
    {
      key: "body_fat",
      label: "Body Fat %",
      shortLabel: "BF%",
      unit: "%",
      type: "number",
      description: "Percentage of body mass that is fat tissue",
      howToMeasure: "Use a body composition scale or skinfold calipers",
      higherIsBetter: false,
    },
  ],
};

// ============================================================
// BASKETBALL PHYSICAL METRICS
// ============================================================
export const basketballPhysicalConfig: SportPhysicalConfig = {
  sportId: "basketball",
  categories: [
    universalMetrics,
    {
      category: "Reach & Hand Size",
      icon: "🖐️",
      metrics: [
        {
          key: "standing_reach",
          label: "Standing Reach",
          shortLabel: "REACH",
          unit: "inches",
          type: "number",
          description: "Height of fingertips when standing flat-footed with arm extended overhead",
          howToMeasure: "Stand flat-footed next to a wall, reach up with one arm, mark highest point of fingertips",
          higherIsBetter: true,
          benchmarks: {
            youth: { poor: 72, average: 78, good: 84, elite: 90 },
            highSchool: { poor: 84, average: 90, good: 96, elite: 102 },
          },
        },
        {
          key: "hand_length",
          label: "Hand Length",
          shortLabel: "HAND-L",
          unit: "inches",
          type: "number",
          description: "Length from base of palm to tip of middle finger",
          howToMeasure: "Measure from the base of the palm to the tip of the middle finger",
          higherIsBetter: true,
        },
        {
          key: "hand_width",
          label: "Hand Width",
          shortLabel: "HAND-W",
          unit: "inches",
          type: "number",
          description: "Width of hand with fingers spread",
          howToMeasure: "Spread fingers as wide as possible, measure from thumb tip to pinky tip",
          higherIsBetter: true,
        },
      ],
    },
    {
      category: "Explosiveness",
      icon: "🚀",
      metrics: [
        {
          key: "vertical_jump",
          label: "Vertical Jump",
          shortLabel: "VERT",
          unit: "inches",
          type: "number",
          description: "Maximum vertical leap from standing position",
          howToMeasure: "Stand next to wall, mark standing reach, then jump and mark highest point. Difference is vertical jump.",
          higherIsBetter: true,
          benchmarks: {
            youth: { poor: 12, average: 16, good: 20, elite: 26 },
            highSchool: { poor: 18, average: 24, good: 30, elite: 36 },
          },
        },
        {
          key: "max_vertical",
          label: "Max Vertical (Running)",
          shortLabel: "MAX-V",
          unit: "inches",
          type: "number",
          description: "Maximum vertical leap with approach steps",
          howToMeasure: "Take 2-3 approach steps then jump as high as possible",
          higherIsBetter: true,
          benchmarks: {
            youth: { poor: 14, average: 19, good: 24, elite: 30 },
            highSchool: { poor: 22, average: 28, good: 34, elite: 40 },
          },
        },
        {
          key: "broad_jump",
          label: "Broad Jump",
          shortLabel: "BROAD",
          unit: "inches",
          type: "distance",
          description: "Standing long jump distance",
          howToMeasure: "Stand at line, jump forward as far as possible, measure from line to back of heels",
          higherIsBetter: true,
        },
      ],
    },
    {
      category: "Speed & Agility",
      icon: "⚡",
      metrics: [
        {
          key: "lane_agility",
          label: "Lane Agility",
          shortLabel: "LANE",
          unit: "seconds",
          type: "time",
          description: "Time to complete the lane agility drill (defensive slides around the key)",
          howToMeasure: "Start at baseline corner, defensive slide to elbow, sprint to half-court elbow, slide across, sprint back",
          higherIsBetter: false,
          benchmarks: {
            youth: { poor: 14.0, average: 12.5, good: 11.0, elite: 10.0 },
            highSchool: { poor: 12.5, average: 11.5, good: 10.5, elite: 9.5 },
          },
        },
        {
          key: "three_quarter_sprint",
          label: "3/4 Court Sprint",
          shortLabel: "3/4 SPR",
          unit: "seconds",
          type: "time",
          description: "Time to sprint 3/4 of the court length",
          howToMeasure: "Sprint from baseline to opposite free throw line, time with stopwatch",
          higherIsBetter: false,
          benchmarks: {
            youth: { poor: 4.5, average: 4.0, good: 3.5, elite: 3.2 },
            highSchool: { poor: 4.0, average: 3.5, good: 3.2, elite: 2.9 },
          },
        },
        {
          key: "shuttle_run",
          label: "Shuttle Run",
          shortLabel: "SHUTTLE",
          unit: "seconds",
          type: "time",
          description: "Time to complete a defensive shuffle/sprint shuttle",
          howToMeasure: "Side shuffle 10 feet, touch line, shuffle back, touch, sprint 10 feet, back",
          higherIsBetter: false,
        },
      ],
    },
  ],
};

// ============================================================
// BASEBALL PHYSICAL METRICS
// ============================================================
export const baseballPhysicalConfig: SportPhysicalConfig = {
  sportId: "baseball",
  categories: [
    universalMetrics,
    {
      category: "Speed",
      icon: "⚡",
      metrics: [
        {
          key: "sixty_yard_dash",
          label: "60-Yard Dash",
          shortLabel: "60YD",
          unit: "seconds",
          type: "time",
          description: "Time to sprint 60 yards - the standard baseball speed test",
          howToMeasure: "Sprint 60 yards (180 feet) from a standing start, time with stopwatch",
          higherIsBetter: false,
          benchmarks: {
            youth: { poor: 9.0, average: 8.0, good: 7.5, elite: 7.0 },
            highSchool: { poor: 7.8, average: 7.2, good: 6.8, elite: 6.4 },
          },
        },
        {
          key: "home_to_first",
          label: "Home to 1st",
          shortLabel: "H-1ST",
          unit: "seconds",
          type: "time",
          description: "Time from home plate to first base after contact",
          howToMeasure: "Time from bat contact to touching first base (90 feet)",
          higherIsBetter: false,
          benchmarks: {
            youth: { poor: 5.5, average: 5.0, good: 4.5, elite: 4.2 },
            highSchool: { poor: 4.8, average: 4.4, good: 4.1, elite: 3.9 },
          },
        },
      ],
    },
    {
      category: "Arm Strength",
      icon: "💪",
      metrics: [
        {
          key: "pitching_velocity",
          label: "Pitching Velocity",
          shortLabel: "VEL",
          unit: "mph",
          type: "number",
          description: "Maximum fastball velocity",
          howToMeasure: "Use a radar gun to measure pitch speed. Record the highest reading.",
          higherIsBetter: true,
          benchmarks: {
            youth: { poor: 45, average: 55, good: 65, elite: 75 },
            highSchool: { poor: 65, average: 75, good: 85, elite: 90 },
          },
        },
        {
          key: "throwing_velocity",
          label: "Throwing Velocity (Position)",
          shortLabel: "THR-VEL",
          unit: "mph",
          type: "number",
          description: "Maximum throwing velocity from fielding position",
          howToMeasure: "Use radar gun on throws from position (OF, IF, C)",
          higherIsBetter: true,
        },
        {
          key: "catcher_pop_time",
          label: "Catcher Pop Time",
          shortLabel: "POP",
          unit: "seconds",
          type: "time",
          description: "Time from ball hitting catcher's mitt to ball arriving at 2nd base",
          howToMeasure: "Time from catch to ball reaching second baseman's glove",
          higherIsBetter: false,
          benchmarks: {
            youth: { poor: 2.5, average: 2.2, good: 2.0, elite: 1.9 },
            highSchool: { poor: 2.2, average: 2.0, good: 1.9, elite: 1.8 },
          },
        },
      ],
    },
    {
      category: "Hitting Power",
      icon: "🏏",
      metrics: [
        {
          key: "exit_velocity",
          label: "Exit Velocity",
          shortLabel: "EXIT-V",
          unit: "mph",
          type: "number",
          description: "Speed of ball off the bat at contact",
          howToMeasure: "Use a radar gun or bat sensor to measure ball speed immediately after contact",
          higherIsBetter: true,
          benchmarks: {
            youth: { poor: 55, average: 65, good: 75, elite: 85 },
            highSchool: { poor: 75, average: 85, good: 95, elite: 105 },
          },
        },
        {
          key: "bat_speed",
          label: "Bat Speed",
          shortLabel: "BAT-SPD",
          unit: "mph",
          type: "number",
          description: "Speed of bat head through the hitting zone",
          howToMeasure: "Use a bat sensor (like Blast Motion) or high-speed camera analysis",
          higherIsBetter: true,
        },
      ],
    },
    {
      category: "Explosiveness",
      icon: "🚀",
      metrics: [
        {
          key: "vertical_jump",
          label: "Vertical Jump",
          shortLabel: "VERT",
          unit: "inches",
          type: "number",
          description: "Standing vertical leap height",
          howToMeasure: "Jump from standing position, measure highest point reached minus standing reach",
          higherIsBetter: true,
        },
        {
          key: "broad_jump",
          label: "Broad Jump",
          shortLabel: "BROAD",
          unit: "inches",
          type: "number",
          description: "Standing long jump distance",
          howToMeasure: "Jump forward from standing, measure from start line to back of heels",
          higherIsBetter: true,
          benchmarks: {
            youth: { poor: 60, average: 72, good: 84, elite: 96 },
            highSchool: { poor: 84, average: 96, good: 108, elite: 120 },
          },
        },
        {
          key: "grip_strength",
          label: "Grip Strength",
          shortLabel: "GRIP",
          unit: "lbs",
          type: "number",
          description: "Maximum grip strength (important for bat control and throwing)",
          howToMeasure: "Use a hand dynamometer, squeeze as hard as possible",
          higherIsBetter: true,
        },
      ],
    },
  ],
};

// ============================================================
// SOCCER PHYSICAL METRICS
// ============================================================
export const soccerPhysicalConfig: SportPhysicalConfig = {
  sportId: "soccer",
  categories: [
    universalMetrics,
    {
      category: "Speed",
      icon: "⚡",
      metrics: [
        {
          key: "sprint_10m",
          label: "10m Sprint",
          shortLabel: "10M",
          unit: "seconds",
          type: "time",
          description: "Acceleration test - time to sprint 10 meters",
          howToMeasure: "Sprint from standing start, time over 10 meters",
          higherIsBetter: false,
          benchmarks: {
            youth: { poor: 2.3, average: 2.0, good: 1.85, elite: 1.7 },
            highSchool: { poor: 2.0, average: 1.85, good: 1.7, elite: 1.6 },
          },
        },
        {
          key: "sprint_30m",
          label: "30m Sprint",
          shortLabel: "30M",
          unit: "seconds",
          type: "time",
          description: "Maximum speed test - time to sprint 30 meters",
          howToMeasure: "Sprint from standing start, time over 30 meters",
          higherIsBetter: false,
          benchmarks: {
            youth: { poor: 5.5, average: 5.0, good: 4.5, elite: 4.2 },
            highSchool: { poor: 4.8, average: 4.4, good: 4.1, elite: 3.8 },
          },
        },
        {
          key: "sprint_40m",
          label: "40m Sprint",
          shortLabel: "40M",
          unit: "seconds",
          type: "time",
          description: "Extended sprint test - time to sprint 40 meters",
          howToMeasure: "Sprint from standing start, time over 40 meters",
          higherIsBetter: false,
        },
      ],
    },
    {
      category: "Agility",
      icon: "🔄",
      metrics: [
        {
          key: "illinois_agility",
          label: "Illinois Agility Test",
          shortLabel: "ILL-AGI",
          unit: "seconds",
          type: "time",
          description: "Agility test involving sprints, turns, and weaving through cones",
          howToMeasure: "Complete the standard Illinois agility course as fast as possible",
          higherIsBetter: false,
          benchmarks: {
            youth: { poor: 20.0, average: 18.0, good: 16.5, elite: 15.0 },
            highSchool: { poor: 17.5, average: 16.0, good: 15.0, elite: 14.0 },
          },
        },
        {
          key: "t_test",
          label: "T-Test",
          shortLabel: "T-TEST",
          unit: "seconds",
          type: "time",
          description: "Agility test in a T-shape pattern with forward, lateral, and backward movement",
          howToMeasure: "Sprint forward, shuffle left, shuffle right, shuffle back to center, backpedal to start",
          higherIsBetter: false,
        },
        {
          key: "cod_505",
          label: "5-0-5 Change of Direction",
          shortLabel: "505",
          unit: "seconds",
          type: "time",
          description: "Measures ability to change direction at speed",
          howToMeasure: "Sprint 5m, turn 180°, sprint 5m back",
          higherIsBetter: false,
        },
      ],
    },
    {
      category: "Endurance",
      icon: "🫁",
      metrics: [
        {
          key: "yoyo_ir1",
          label: "Yo-Yo IR1 Test",
          shortLabel: "YOYO",
          unit: "meters",
          type: "distance",
          description: "Intermittent recovery test measuring repeated sprint ability",
          howToMeasure: "Run 20m shuttles at increasing speeds with 10s recovery between each",
          higherIsBetter: true,
          benchmarks: {
            youth: { poor: 440, average: 720, good: 1000, elite: 1400 },
            highSchool: { poor: 1000, average: 1400, good: 1800, elite: 2200 },
          },
        },
        {
          key: "beep_test",
          label: "Beep Test Level",
          shortLabel: "BEEP",
          unit: "level",
          type: "number",
          description: "Multi-stage fitness test (20m shuttle run)",
          howToMeasure: "Run 20m shuttles to audio beeps until exhaustion",
          higherIsBetter: true,
          benchmarks: {
            youth: { poor: 5, average: 7, good: 9, elite: 11 },
            highSchool: { poor: 8, average: 10, good: 12, elite: 14 },
          },
        },
      ],
    },
    {
      category: "Explosiveness",
      icon: "🚀",
      metrics: [
        {
          key: "vertical_jump",
          label: "Vertical Jump",
          shortLabel: "VERT",
          unit: "inches",
          type: "number",
          description: "Standing vertical leap height",
          howToMeasure: "Jump from standing position, measure peak height",
          higherIsBetter: true,
        },
        {
          key: "broad_jump",
          label: "Broad Jump",
          shortLabel: "BROAD",
          unit: "inches",
          type: "distance",
          description: "Standing long jump distance",
          howToMeasure: "Jump forward from standing position",
          higherIsBetter: true,
        },
      ],
    },
  ],
};

// ============================================================
// FOOTBALL PHYSICAL METRICS
// ============================================================
export const footballPhysicalConfig: SportPhysicalConfig = {
  sportId: "football",
  categories: [
    universalMetrics,
    {
      category: "Speed",
      icon: "⚡",
      metrics: [
        {
          key: "forty_yard_dash",
          label: "40-Yard Dash",
          shortLabel: "40YD",
          unit: "seconds",
          type: "time",
          description: "The standard NFL Combine speed test - 40 yards from 3-point stance",
          howToMeasure: "Start in 3-point stance, sprint 40 yards, hand-timed or electronic",
          higherIsBetter: false,
          benchmarks: {
            youth: { poor: 6.5, average: 5.8, good: 5.3, elite: 4.9 },
            highSchool: { poor: 5.5, average: 5.0, good: 4.7, elite: 4.4 },
          },
        },
        {
          key: "ten_yard_split",
          label: "10-Yard Split",
          shortLabel: "10YD",
          unit: "seconds",
          type: "time",
          description: "First 10 yards of 40 - measures acceleration/explosion",
          howToMeasure: "Time the first 10 yards of the 40-yard dash",
          higherIsBetter: false,
        },
        {
          key: "twenty_yard_split",
          label: "20-Yard Split",
          shortLabel: "20YD",
          unit: "seconds",
          type: "time",
          description: "First 20 yards of 40 - measures acceleration",
          howToMeasure: "Time the first 20 yards of the 40-yard dash",
          higherIsBetter: false,
        },
      ],
    },
    {
      category: "Explosiveness",
      icon: "🚀",
      metrics: [
        {
          key: "vertical_jump",
          label: "Vertical Jump",
          shortLabel: "VERT",
          unit: "inches",
          type: "number",
          description: "Standing vertical leap - measures lower body power",
          howToMeasure: "Stand flat-footed, jump as high as possible, measure peak height minus standing reach",
          higherIsBetter: true,
          benchmarks: {
            youth: { poor: 14, average: 18, good: 24, elite: 30 },
            highSchool: { poor: 22, average: 28, good: 34, elite: 40 },
          },
        },
        {
          key: "broad_jump",
          label: "Broad Jump",
          shortLabel: "BROAD",
          unit: "inches",
          type: "distance",
          description: "Standing long jump - measures explosive leg power",
          howToMeasure: "Jump forward from line, measure from start to back of heels",
          higherIsBetter: true,
          benchmarks: {
            youth: { poor: 65, average: 78, good: 90, elite: 102 },
            highSchool: { poor: 90, average: 102, good: 114, elite: 126 },
          },
        },
      ],
    },
    {
      category: "Agility",
      icon: "🔄",
      metrics: [
        {
          key: "three_cone_drill",
          label: "3-Cone Drill (L-Drill)",
          shortLabel: "3CONE",
          unit: "seconds",
          type: "time",
          description: "Agility test in L-shape pattern - measures change of direction",
          howToMeasure: "Sprint 5 yards, touch line, return, go around cone, weave through in L pattern",
          higherIsBetter: false,
          benchmarks: {
            youth: { poor: 9.0, average: 8.0, good: 7.2, elite: 6.8 },
            highSchool: { poor: 8.0, average: 7.2, good: 6.8, elite: 6.4 },
          },
        },
        {
          key: "shuttle_5_10_5",
          label: "5-10-5 Shuttle",
          shortLabel: "SHUTTLE",
          unit: "seconds",
          type: "time",
          description: "Pro agility shuttle - measures lateral quickness and change of direction",
          howToMeasure: "Start in middle, run 5 yards one way, 10 yards back, 5 yards to finish",
          higherIsBetter: false,
          benchmarks: {
            youth: { poor: 5.5, average: 5.0, good: 4.6, elite: 4.3 },
            highSchool: { poor: 4.8, average: 4.5, good: 4.2, elite: 4.0 },
          },
        },
      ],
    },
    {
      category: "Strength",
      icon: "💪",
      metrics: [
        {
          key: "bench_press_max",
          label: "Bench Press Max",
          shortLabel: "BENCH",
          unit: "lbs",
          type: "number",
          description: "One-rep max bench press (for older athletes)",
          howToMeasure: "Maximum weight lifted one time with proper form",
          higherIsBetter: true,
        },
        {
          key: "squat_max",
          label: "Squat Max",
          shortLabel: "SQUAT",
          unit: "lbs",
          type: "number",
          description: "One-rep max squat (for older athletes)",
          howToMeasure: "Maximum weight squatted to parallel with proper form",
          higherIsBetter: true,
        },
        {
          key: "hand_size",
          label: "Hand Size",
          shortLabel: "HAND",
          unit: "inches",
          type: "number",
          description: "Hand span from thumb to pinky (important for QBs, WRs)",
          howToMeasure: "Spread hand fully, measure from thumb tip to pinky tip",
          higherIsBetter: true,
        },
      ],
    },
  ],
};

// ============================================================
// TENNIS PHYSICAL METRICS
// ============================================================
export const tennisPhysicalConfig: SportPhysicalConfig = {
  sportId: "tennis",
  categories: [
    universalMetrics,
    {
      category: "Power",
      icon: "💥",
      metrics: [
        {
          key: "serve_speed",
          label: "Serve Speed",
          shortLabel: "SERVE",
          unit: "mph",
          type: "number",
          description: "Maximum first serve velocity",
          howToMeasure: "Use a radar gun to measure serve speed. Record fastest serve.",
          higherIsBetter: true,
          benchmarks: {
            youth: { poor: 50, average: 65, good: 80, elite: 95 },
            highSchool: { poor: 75, average: 90, good: 105, elite: 120 },
          },
        },
        {
          key: "forehand_speed",
          label: "Forehand Speed",
          shortLabel: "FH-SPD",
          unit: "mph",
          type: "number",
          description: "Maximum forehand groundstroke speed",
          howToMeasure: "Use radar gun to measure forehand speed on flat shots",
          higherIsBetter: true,
        },
        {
          key: "med_ball_throw",
          label: "Medicine Ball Throw",
          shortLabel: "MED-BALL",
          unit: "feet",
          type: "distance",
          description: "Rotational power test - seated medicine ball throw",
          howToMeasure: "Sit with legs extended, rotate and throw 4kg medicine ball, measure distance",
          higherIsBetter: true,
        },
      ],
    },
    {
      category: "Speed & Agility",
      icon: "⚡",
      metrics: [
        {
          key: "sprint_5m",
          label: "5m Sprint",
          shortLabel: "5M",
          unit: "seconds",
          type: "time",
          description: "First step quickness - critical for tennis",
          howToMeasure: "Sprint 5 meters from standing start",
          higherIsBetter: false,
        },
        {
          key: "sprint_10m",
          label: "10m Sprint",
          shortLabel: "10M",
          unit: "seconds",
          type: "time",
          description: "Short acceleration test",
          howToMeasure: "Sprint 10 meters from standing start",
          higherIsBetter: false,
        },
        {
          key: "spider_test",
          label: "Spider Test",
          shortLabel: "SPIDER",
          unit: "seconds",
          type: "time",
          description: "Tennis-specific agility test collecting balls from around the court",
          howToMeasure: "From center mark, run to collect 5 balls placed around court in specific pattern",
          higherIsBetter: false,
          benchmarks: {
            youth: { poor: 22, average: 19, good: 17, elite: 15 },
            highSchool: { poor: 19, average: 17, good: 15, elite: 13 },
          },
        },
        {
          key: "hexagon_test",
          label: "Hexagon Test",
          shortLabel: "HEX",
          unit: "seconds",
          type: "time",
          description: "Agility and footwork test jumping in/out of hexagon",
          howToMeasure: "Jump in and out of hexagon pattern 3 times clockwise",
          higherIsBetter: false,
        },
      ],
    },
    {
      category: "Strength & Flexibility",
      icon: "💪",
      metrics: [
        {
          key: "grip_strength",
          label: "Grip Strength",
          shortLabel: "GRIP",
          unit: "lbs",
          type: "number",
          description: "Hand grip strength - critical for racquet control",
          howToMeasure: "Use hand dynamometer, squeeze maximum force",
          higherIsBetter: true,
        },
        {
          key: "shoulder_rotation",
          label: "Shoulder Rotation",
          shortLabel: "SHLD-ROT",
          unit: "degrees",
          type: "number",
          description: "Internal/external shoulder rotation range",
          howToMeasure: "Measure shoulder rotation range with goniometer",
          higherIsBetter: true,
        },
      ],
    },
    {
      category: "Explosiveness",
      icon: "🚀",
      metrics: [
        {
          key: "vertical_jump",
          label: "Vertical Jump",
          shortLabel: "VERT",
          unit: "inches",
          type: "number",
          description: "Standing vertical leap",
          howToMeasure: "Jump from standing position, measure peak height",
          higherIsBetter: true,
        },
      ],
    },
  ],
};

// ============================================================
// VOLLEYBALL PHYSICAL METRICS
// ============================================================
export const volleyballPhysicalConfig: SportPhysicalConfig = {
  sportId: "volleyball",
  categories: [
    universalMetrics,
    {
      category: "Reach & Height",
      icon: "📏",
      metrics: [
        {
          key: "standing_reach",
          label: "Standing Reach",
          shortLabel: "ST-REACH",
          unit: "inches",
          type: "number",
          description: "Height of fingertips when standing with arm extended overhead",
          howToMeasure: "Stand flat-footed, reach one arm up, measure to fingertips",
          higherIsBetter: true,
        },
        {
          key: "block_touch",
          label: "Block Touch",
          shortLabel: "BLK-TCH",
          unit: "inches",
          type: "number",
          description: "Highest point touched while blocking (standing jump with both arms)",
          howToMeasure: "From standing position, jump straight up with arms raised, measure highest touch",
          higherIsBetter: true,
          benchmarks: {
            youth: { poor: 84, average: 96, good: 108, elite: 120 },
            highSchool: { poor: 96, average: 108, good: 120, elite: 132 },
          },
        },
        {
          key: "approach_touch",
          label: "Approach Touch",
          shortLabel: "APP-TCH",
          unit: "inches",
          type: "number",
          description: "Highest point touched with a spike approach",
          howToMeasure: "Use full approach, jump and touch highest point with one arm",
          higherIsBetter: true,
          benchmarks: {
            youth: { poor: 90, average: 102, good: 114, elite: 126 },
            highSchool: { poor: 108, average: 120, good: 132, elite: 144 },
          },
        },
      ],
    },
    {
      category: "Explosiveness",
      icon: "🚀",
      metrics: [
        {
          key: "vertical_jump",
          label: "Vertical Jump (Standing)",
          shortLabel: "VERT",
          unit: "inches",
          type: "number",
          description: "Vertical leap from standing position",
          howToMeasure: "Block touch minus standing reach",
          higherIsBetter: true,
          benchmarks: {
            youth: { poor: 12, average: 18, good: 24, elite: 30 },
            highSchool: { poor: 18, average: 24, good: 30, elite: 36 },
          },
        },
        {
          key: "approach_vertical",
          label: "Approach Vertical",
          shortLabel: "APP-VERT",
          unit: "inches",
          type: "number",
          description: "Vertical leap with approach",
          howToMeasure: "Approach touch minus standing reach",
          higherIsBetter: true,
          benchmarks: {
            youth: { poor: 14, average: 22, good: 28, elite: 34 },
            highSchool: { poor: 22, average: 28, good: 36, elite: 42 },
          },
        },
        {
          key: "broad_jump",
          label: "Broad Jump",
          shortLabel: "BROAD",
          unit: "inches",
          type: "distance",
          description: "Standing long jump - measures leg power",
          howToMeasure: "Jump forward from line, measure to back of heels",
          higherIsBetter: true,
        },
      ],
    },
    {
      category: "Speed & Agility",
      icon: "⚡",
      metrics: [
        {
          key: "lane_agility",
          label: "Lane Agility",
          shortLabel: "LANE",
          unit: "seconds",
          type: "time",
          description: "Court movement agility test",
          howToMeasure: "Move in specific pattern around volleyball court",
          higherIsBetter: false,
        },
        {
          key: "sprint_10m",
          label: "10m Sprint",
          shortLabel: "10M",
          unit: "seconds",
          type: "time",
          description: "Short burst speed for court movement",
          howToMeasure: "Sprint 10 meters from standing start",
          higherIsBetter: false,
        },
        {
          key: "t_test",
          label: "T-Test",
          shortLabel: "T-TEST",
          unit: "seconds",
          type: "time",
          description: "Multi-directional agility test",
          howToMeasure: "Sprint forward, shuffle left, shuffle right, backpedal",
          higherIsBetter: false,
        },
      ],
    },
    {
      category: "Power",
      icon: "💥",
      metrics: [
        {
          key: "serve_speed",
          label: "Serve Speed",
          shortLabel: "SERVE",
          unit: "mph",
          type: "number",
          description: "Maximum serve velocity",
          howToMeasure: "Use radar gun to measure fastest jump serve",
          higherIsBetter: true,
        },
        {
          key: "spike_speed",
          label: "Spike Speed",
          shortLabel: "SPIKE",
          unit: "mph",
          type: "number",
          description: "Maximum attack/spike velocity",
          howToMeasure: "Use radar gun to measure spike speed",
          higherIsBetter: true,
        },
      ],
    },
  ],
};

// ============================================================
// CONFIG MAP & HELPERS
// ============================================================
export const PHYSICAL_CONFIGS: Record<SportId, SportPhysicalConfig> = {
  basketball: basketballPhysicalConfig,
  baseball: baseballPhysicalConfig,
  soccer: soccerPhysicalConfig,
  football: footballPhysicalConfig,
  tennis: tennisPhysicalConfig,
  volleyball: volleyballPhysicalConfig,
};

export function getPhysicalConfig(sportId: SportId): SportPhysicalConfig {
  return PHYSICAL_CONFIGS[sportId];
}

export function getAllPhysicalMetrics(sportId: SportId): PhysicalMetricDef[] {
  const config = getPhysicalConfig(sportId);
  return config.categories.flatMap(cat => cat.metrics);
}

export function getMetricByKey(sportId: SportId, key: string): PhysicalMetricDef | undefined {
  const allMetrics = getAllPhysicalMetrics(sportId);
  return allMetrics.find(m => m.key === key);
}
