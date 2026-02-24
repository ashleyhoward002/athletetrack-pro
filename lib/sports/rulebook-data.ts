import { SportId } from "./config";

// ============================================================
// Rulebook Data Module
// ============================================================
// Static rules content for all 6 supported sports.
// Used by the /dashboard/rulebook page.
// ============================================================

export interface RulebookEntry {
  content: string[];
}

export interface RulebookSection {
  id: string;
  title: string;
  icon: string;
  entries: RulebookEntry[];
}

export interface SportRulebook {
  sportId: SportId;
  sportName: string;
  sportIcon: string;
  officialBody: string;
  sections: RulebookSection[];
}

export const RULEBOOK_SECTIONS = [
  { id: "basic-rules", title: "Basic Rules", icon: "📋" },
  { id: "scoring", title: "Scoring", icon: "🎯" },
  { id: "positions", title: "Positions & Roles", icon: "👥" },
  { id: "dimensions", title: "Field / Court Dimensions", icon: "📐" },
  { id: "penalties", title: "Common Penalties & Violations", icon: "🚫" },
  { id: "glossary", title: "Key Terms / Glossary", icon: "📖" },
] as const;

export type RulebookSectionId = (typeof RULEBOOK_SECTIONS)[number]["id"];

// ============================================================
// BASKETBALL
// ============================================================
const basketballRulebook: SportRulebook = {
  sportId: "basketball",
  sportName: "Basketball",
  sportIcon: "🏀",
  officialBody: "NBA / FIBA / NFHS",
  sections: [
    {
      id: "basic-rules",
      title: "Basic Rules",
      icon: "📋",
      entries: [
        {
          content: [
            "A game is played between two teams of 5 players each on the court.",
            "The objective is to score by shooting the ball through the opponent's basket (hoop).",
            "The ball may be advanced by passing or dribbling (bouncing while moving).",
            "A player who stops dribbling must pass or shoot — picking up the dribble and dribbling again is a double-dribble violation.",
            "Moving without dribbling is a traveling violation.",
            "Youth games are typically 4 quarters of 6–8 minutes; high school uses 8-minute quarters; NBA uses 12-minute quarters.",
            "Each team gets a set number of timeouts per half (varies by level).",
            "The game starts with a jump ball at center court.",
            "After a made basket, the opposing team inbounds the ball from the baseline.",
            "If the score is tied at the end of regulation, overtime periods (usually 5 minutes) are played.",
          ],
        },
      ],
    },
    {
      id: "scoring",
      title: "Scoring",
      icon: "🎯",
      entries: [
        {
          content: [
            "Field goal inside the 3-point arc — 2 points.",
            "Field goal beyond the 3-point arc — 3 points.",
            "Free throw (awarded after a foul) — 1 point each.",
            "A player fouled while shooting receives 2 or 3 free throws depending on where the shot was taken.",
            "If the shot goes in despite the foul (\"and-one\"), the basket counts plus 1 free throw.",
            "Technical fouls award the opposing team 1 or 2 free throws plus possession.",
          ],
        },
      ],
    },
    {
      id: "positions",
      title: "Positions & Roles",
      icon: "👥",
      entries: [
        {
          content: [
            "Point Guard (PG) — Primary ball-handler and floor general. Runs the offense, calls plays, and distributes the ball.",
            "Shooting Guard (SG) — Perimeter scorer and secondary ball-handler. Focuses on outside shooting and driving to the basket.",
            "Small Forward (SF) — Versatile wing player. Scores from mid-range and the perimeter, defends multiple positions.",
            "Power Forward (PF) — Interior player who rebounds, posts up, and increasingly shoots from outside.",
            "Center (C) — Tallest player, anchors the defense. Protects the rim, rebounds, and scores close to the basket.",
          ],
        },
      ],
    },
    {
      id: "dimensions",
      title: "Field / Court Dimensions",
      icon: "📐",
      entries: [
        {
          content: [
            "NBA court: 94 feet long × 50 feet wide.",
            "High school court: 84 feet long × 50 feet wide.",
            "Basket height: 10 feet from the floor (all levels).",
            "Free-throw line: 15 feet from the backboard.",
            "3-point line: 23 ft 9 in (NBA), 22 ft 1.75 in (college), 19 ft 9 in (high school).",
            "The key (paint/lane): 16 feet wide (NBA) or 12 feet wide (high school/college).",
            "Center circle: 12 feet in diameter.",
          ],
        },
      ],
    },
    {
      id: "penalties",
      title: "Common Penalties & Violations",
      icon: "🚫",
      entries: [
        {
          content: [
            "Personal foul — Illegal physical contact (pushing, holding, hitting). Player fouls out after 5 (college/HS) or 6 (NBA).",
            "Shooting foul — Fouling a player in the act of shooting awards free throws.",
            "Technical foul — Unsportsmanlike conduct, delay of game, or illegal defense. Awards free throws + possession.",
            "Flagrant foul — Excessive or violent contact. Awards free throws + possession; may result in ejection.",
            "Traveling — Moving without dribbling. Turnover to the other team.",
            "Double dribble — Dribbling, stopping, then dribbling again. Turnover.",
            "Backcourt violation — Bringing the ball back across half court after advancing it. Turnover.",
            "Shot clock violation — Failing to attempt a shot before the shot clock expires (24s NBA, 30s college).",
            "3-second violation — An offensive player standing in the lane for more than 3 consecutive seconds.",
            "Goaltending — Blocking a shot on its downward arc or while it's on/above the rim. Basket counts.",
          ],
        },
      ],
    },
    {
      id: "glossary",
      title: "Key Terms / Glossary",
      icon: "📖",
      entries: [
        {
          content: [
            "Assist — A pass that directly leads to a made basket.",
            "Rebound — Recovering the ball after a missed shot (offensive or defensive).",
            "Steal — Taking the ball from the opposing team through a deflection or interception.",
            "Block — Deflecting an opponent's shot attempt.",
            "Turnover — Losing possession of the ball to the opposing team.",
            "Fast break — A quick transition from defense to offense, pushing the ball up the court before the defense sets up.",
            "Pick and roll — A screen set by one player followed by a roll toward the basket.",
            "Box out — Using your body to position between an opponent and the basket to secure a rebound.",
            "FG% — Field goal percentage: made shots divided by attempted shots.",
            "FT% — Free throw percentage: made free throws divided by attempts.",
            "Triple-double — Recording double digits in three statistical categories in one game.",
          ],
        },
      ],
    },
  ],
};

// ============================================================
// BASEBALL
// ============================================================
const baseballRulebook: SportRulebook = {
  sportId: "baseball",
  sportName: "Baseball",
  sportIcon: "⚾",
  officialBody: "MLB / Little League / NFHS",
  sections: [
    {
      id: "basic-rules",
      title: "Basic Rules",
      icon: "📋",
      entries: [
        {
          content: [
            "A game consists of 9 innings (7 for high school, 6 for Little League). Each inning has a top and bottom half.",
            "The visiting team bats in the top half; the home team bats in the bottom half.",
            "Each half-inning continues until 3 outs are recorded.",
            "A batter gets up to 3 strikes before striking out, and 4 balls earn a walk (free base).",
            "A fair ball hit over the outfield fence is a home run — the batter and all runners score.",
            "Runners must touch each base in order: first, second, third, home.",
            "A runner is out if tagged with the ball while off a base, or if a fielder with the ball touches the base before the runner on a force play.",
            "The batting order is set before the game and must be followed throughout.",
            "If the score is tied after regulation innings, extra innings are played until one team leads at the end of a complete inning.",
          ],
        },
      ],
    },
    {
      id: "scoring",
      title: "Scoring",
      icon: "🎯",
      entries: [
        {
          content: [
            "A run is scored each time a runner legally crosses home plate.",
            "Home run — Batter hits the ball over the outfield fence in fair territory. All runners on base also score.",
            "Grand slam — A home run hit with all 3 bases loaded, scoring 4 runs.",
            "RBI (Run Batted In) — Credited to the batter when their action causes a runner to score.",
            "Earned run — A run that scores without the aid of a defensive error.",
            "Unearned run — A run that scores due to a defensive error or passed ball.",
            "Sacrifice fly — A fly ball out that allows a runner on 3rd to tag up and score.",
          ],
        },
      ],
    },
    {
      id: "positions",
      title: "Positions & Roles",
      icon: "👥",
      entries: [
        {
          content: [
            "Pitcher (P / 1) — Throws the ball to the batter from the mound. Controls the pace and strategy of the game.",
            "Catcher (C / 2) — Receives pitches behind home plate. Calls pitches, frames strikes, and controls the running game.",
            "First Baseman (1B / 3) — Covers first base. Receives throws from infielders for putouts.",
            "Second Baseman (2B / 4) — Covers the area between first and second base. Turns double plays.",
            "Third Baseman (3B / 5) — Covers third base. Needs quick reflexes for hard-hit balls (\"hot corner\").",
            "Shortstop (SS / 6) — Covers the area between second and third base. Often the most athletic infielder.",
            "Left Fielder (LF / 7) — Covers the left portion of the outfield.",
            "Center Fielder (CF / 8) — Covers the center outfield. Usually the fastest outfielder with the most range.",
            "Right Fielder (RF / 9) — Covers the right outfield. Typically has the strongest throwing arm among outfielders.",
            "Designated Hitter (DH) — Bats in place of the pitcher (used in some leagues). Does not play a defensive position.",
          ],
        },
      ],
    },
    {
      id: "dimensions",
      title: "Field / Court Dimensions",
      icon: "📐",
      entries: [
        {
          content: [
            "Base paths: 90 feet between bases (MLB); 60–70 feet for youth leagues.",
            "Pitching distance: 60 feet 6 inches (MLB); 46 feet (Little League).",
            "Home plate to backstop: 60 feet (recommended).",
            "Outfield fence distance: 325–400+ feet (varies by ballpark); 200 feet (Little League).",
            "The infield is a diamond shape (square rotated 45 degrees) with bases at each corner.",
            "The pitcher's mound is raised 10 inches above the playing field (MLB).",
            "Foul lines extend from home plate past first and third base to the outfield fence.",
          ],
        },
      ],
    },
    {
      id: "penalties",
      title: "Common Penalties & Violations",
      icon: "🚫",
      entries: [
        {
          content: [
            "Balk — An illegal motion by the pitcher with runners on base. All runners advance one base.",
            "Interference — A fielder obstructs a runner, or a batter/runner obstructs a fielder. Offending player or runner is called out or awarded a base.",
            "Infield fly rule — With runners on 1st and 2nd (or bases loaded) and less than 2 outs, a fair fly ball in the infield that can be caught with ordinary effort is automatically an out (prevents intentional drops for double plays).",
            "Illegal pitch — A pitch delivered when the pitcher is not in legal pitching position. Called a ball.",
            "Catcher's interference — The catcher's glove makes contact with the bat during a swing. Batter is awarded first base.",
            "Dropped third strike — If the catcher fails to catch the third strike cleanly, the batter may run to first base (if first base is unoccupied or there are 2 outs).",
          ],
        },
      ],
    },
    {
      id: "glossary",
      title: "Key Terms / Glossary",
      icon: "📖",
      entries: [
        {
          content: [
            "ERA (Earned Run Average) — Average earned runs a pitcher allows per 9 innings. Lower is better.",
            "RBI (Run Batted In) — A run scored as a result of the batter's at-bat action.",
            "OBP (On-Base Percentage) — How often a batter reaches base (hits + walks + hit by pitch).",
            "SLG (Slugging Percentage) — Total bases divided by at-bats. Measures power hitting.",
            "OPS (On-base Plus Slugging) — OBP + SLG combined. A comprehensive offensive stat.",
            "Batting average (AVG) — Hits divided by at-bats.",
            "WHIP — Walks + Hits per Inning Pitched. Measures how many baserunners a pitcher allows.",
            "Fly out — A batted ball caught in the air for an out.",
            "Ground out — A batted ball fielded on the ground and thrown to a base for an out.",
            "Double play — Two outs recorded on a single play.",
            "Tag up — A runner must return to their base after a fly ball is caught before advancing.",
          ],
        },
      ],
    },
  ],
};

// ============================================================
// SOCCER
// ============================================================
const soccerRulebook: SportRulebook = {
  sportId: "soccer",
  sportName: "Soccer",
  sportIcon: "⚽",
  officialBody: "FIFA / IFAB / US Soccer",
  sections: [
    {
      id: "basic-rules",
      title: "Basic Rules",
      icon: "📋",
      entries: [
        {
          content: [
            "A match is played between two teams of 11 players each (including the goalkeeper).",
            "The game consists of two 45-minute halves with a 15-minute halftime break. Youth games have shorter halves.",
            "Only the goalkeeper may use their hands/arms, and only within their own penalty area.",
            "The ball is out of play when it completely crosses the goal line or touchline.",
            "A goal is scored when the entire ball crosses the goal line between the posts and under the crossbar.",
            "The game starts and restarts (after goals) with a kickoff from the center spot.",
            "Throw-ins are awarded when the ball crosses the touchline; the opposing team throws the ball in with both hands over their head.",
            "Goal kicks are taken when the attacking team plays the ball over the defending team's goal line.",
            "Corner kicks are awarded when the defending team plays the ball over their own goal line.",
            "The offside rule: A player is offside if they are nearer to the opponent's goal line than both the ball and the second-to-last defender when the ball is played to them.",
          ],
        },
      ],
    },
    {
      id: "scoring",
      title: "Scoring",
      icon: "🎯",
      entries: [
        {
          content: [
            "Each goal counts as 1 point. The team with the most goals at the end of the match wins.",
            "If the match is tied, the result may stand as a draw, or extra time / penalty kicks may be used (depends on the competition).",
            "Extra time consists of two 15-minute periods.",
            "Penalty shootout — Each team takes 5 penalty kicks; if still tied, it continues to sudden death.",
            "Penalty kick — Taken from the penalty spot (12 yards from goal) after a foul in the penalty area.",
            "Own goal — When a player accidentally puts the ball into their own team's net. The goal is credited to the opposing team.",
          ],
        },
      ],
    },
    {
      id: "positions",
      title: "Positions & Roles",
      icon: "👥",
      entries: [
        {
          content: [
            "Goalkeeper (GK) — The last line of defense. Only player allowed to use hands in the penalty area. Organizes the defense.",
            "Center Back (CB) — Central defenders who mark opposing strikers and clear the ball from danger.",
            "Left Back (LB) / Right Back (RB) — Wide defenders who defend the flanks and support the attack by overlapping.",
            "Center Defensive Midfielder (CDM) — Sits in front of the defense, breaks up opposition attacks and distributes the ball.",
            "Center Midfielder (CM) — Links defense and attack. Responsible for ball circulation, tackling, and supporting both ends.",
            "Center Attacking Midfielder (CAM) — Plays behind the strikers. Creates goal-scoring chances with passing and dribbling.",
            "Left Midfielder (LM) / Right Midfielder (RM) — Wide midfielders who provide width, crosses, and track back on defense.",
            "Left Wing (LW) / Right Wing (RW) — Attacking wide players who beat defenders and deliver crosses or cut inside to shoot.",
            "Striker (ST) — The primary goal scorer. Holds up play, makes runs behind the defense, and finishes chances.",
          ],
        },
      ],
    },
    {
      id: "dimensions",
      title: "Field / Court Dimensions",
      icon: "📐",
      entries: [
        {
          content: [
            "Field length: 100–110 meters (110–120 yards) for international matches.",
            "Field width: 64–75 meters (70–80 yards) for international matches.",
            "Goal size: 8 feet high × 24 feet wide (2.44m × 7.32m).",
            "Penalty area (18-yard box): 44 yards wide × 18 yards deep.",
            "Goal area (6-yard box): 20 yards wide × 6 yards deep.",
            "Penalty spot: 12 yards (11 meters) from the goal line.",
            "Center circle: 10-yard (9.15m) radius.",
            "Corner arc: 1-yard radius at each corner flag.",
          ],
        },
      ],
    },
    {
      id: "penalties",
      title: "Common Penalties & Violations",
      icon: "🚫",
      entries: [
        {
          content: [
            "Yellow card (caution) — Issued for reckless fouls, dissent, time-wasting, or unsporting behavior. Two yellows in one match equal a red card.",
            "Red card (ejection) — Issued for serious foul play, violent conduct, or denying an obvious goal-scoring opportunity. Player is sent off and cannot be replaced.",
            "Direct free kick — Awarded for contact fouls (tripping, pushing, holding, handball). Can be shot directly at goal.",
            "Indirect free kick — Awarded for non-contact offenses (offside, dangerous play, obstruction). Must touch another player before a goal can be scored.",
            "Penalty kick — Awarded when a foul is committed inside the penalty area by the defending team.",
            "Handball — Deliberately touching the ball with the hand or arm (except the goalkeeper in their own penalty area).",
            "Offside — Being in an offside position when the ball is played forward by a teammate.",
          ],
        },
      ],
    },
    {
      id: "glossary",
      title: "Key Terms / Glossary",
      icon: "📖",
      entries: [
        {
          content: [
            "Clean sheet — A game in which the goalkeeper and defense concede zero goals.",
            "Assist — The final pass or cross that leads directly to a goal.",
            "Cap — An appearance in an international match.",
            "Stoppage time — Additional time added at the end of each half for delays (injuries, substitutions).",
            "Offside trap — A defensive tactic where the back line pushes forward to catch attackers offside.",
            "Set piece — Any restart: free kick, corner kick, throw-in, or penalty kick.",
            "Dribble — Running with the ball under close control past defenders.",
            "Volley — Kicking the ball before it bounces on the ground.",
            "Header — Playing the ball with the head, often to score or clear the ball.",
            "Nutmeg — Passing the ball between an opponent's legs.",
            "Hat trick — Scoring 3 goals in a single match.",
          ],
        },
      ],
    },
  ],
};

// ============================================================
// FOOTBALL
// ============================================================
const footballRulebook: SportRulebook = {
  sportId: "football",
  sportName: "Football",
  sportIcon: "🏈",
  officialBody: "NFL / NCAA / NFHS",
  sections: [
    {
      id: "basic-rules",
      title: "Basic Rules",
      icon: "📋",
      entries: [
        {
          content: [
            "A game is played between two teams of 11 players each on the field.",
            "The game consists of 4 quarters: 15 minutes (NFL), 12 minutes (college/HS).",
            "The offense has 4 downs (attempts) to advance the ball 10 yards. Gaining 10 yards earns a new set of 4 downs.",
            "If the offense fails to gain 10 yards in 4 downs, possession goes to the other team at the spot of the ball.",
            "The ball can be advanced by running (rushing) or throwing (passing).",
            "A forward pass may only be thrown from behind the line of scrimmage, and only one forward pass per play.",
            "A play ends when the ball carrier is tackled, steps out of bounds, scores, or an incomplete pass is thrown.",
            "The game starts and restarts with a kickoff. After scoring, the scoring team kicks off to the opponent.",
            "Each team gets 3 timeouts per half.",
            "If the game is tied after regulation, overtime rules apply (varies by level).",
          ],
        },
      ],
    },
    {
      id: "scoring",
      title: "Scoring",
      icon: "🎯",
      entries: [
        {
          content: [
            "Touchdown (TD) — 6 points. Carrying or catching the ball into the opposing team's end zone.",
            "Extra point (PAT) — 1 point. A kick through the uprights after a touchdown, snapped from the 15-yard line (NFL) or 3-yard line (HS).",
            "Two-point conversion — 2 points. Running or passing the ball into the end zone from the 2-yard line after a touchdown, instead of kicking.",
            "Field goal (FG) — 3 points. Kicking the ball through the uprights during a play from scrimmage.",
            "Safety — 2 points. Awarded to the defense when the ball carrier is tackled in their own end zone.",
          ],
        },
      ],
    },
    {
      id: "positions",
      title: "Positions & Roles",
      icon: "👥",
      entries: [
        {
          content: [
            "Quarterback (QB) — Leader of the offense. Takes the snap, throws passes, and hands off the ball.",
            "Running Back (RB) — Runs with the ball, catches short passes, and blocks for the quarterback.",
            "Wide Receiver (WR) — Runs routes and catches passes downfield.",
            "Tight End (TE) — Hybrid lineman/receiver. Blocks on run plays and catches passes.",
            "Offensive Linemen (OL) — Center (snaps the ball), Guards, and Tackles. Protect the QB and open running lanes.",
            "Defensive Linemen (DL) — Defensive Ends and Tackles. Rush the passer and stop the run at the line.",
            "Linebacker (LB) — Versatile defenders behind the line. Tackle runners, cover receivers, and blitz the quarterback.",
            "Cornerback (CB) — Covers wide receivers in pass defense. Plays on the outside of the defense.",
            "Safety (S) — Last line of defense. Free Safety reads the play; Strong Safety supports near the line.",
            "Kicker (K) — Kicks field goals and extra points.",
            "Punter (P) — Punts the ball on 4th down to push the opposing team back.",
          ],
        },
      ],
    },
    {
      id: "dimensions",
      title: "Field / Court Dimensions",
      icon: "📐",
      entries: [
        {
          content: [
            "Field length: 100 yards (plus two 10-yard end zones = 120 yards total).",
            "Field width: 53 1/3 yards (160 feet).",
            "Yard lines are marked every 5 yards, with numbers at every 10 yards.",
            "Hash marks: Divide the field into thirds. The ball is placed on or between the hashes before each play.",
            "Goal posts: Located at the back of each end zone. Crossbar is 10 feet high; uprights are 18.5 feet apart (NFL).",
            "End zone: 10 yards deep at each end of the field.",
          ],
        },
      ],
    },
    {
      id: "penalties",
      title: "Common Penalties & Violations",
      icon: "🚫",
      entries: [
        {
          content: [
            "Offsides — A defensive player crosses the line of scrimmage before the snap. 5-yard penalty.",
            "False start — An offensive player moves before the snap. 5-yard penalty.",
            "Holding (offensive) — Illegally grabbing a defender to prevent them from reaching the ball carrier. 10-yard penalty.",
            "Holding (defensive) — Grabbing a receiver to prevent them from running a route. 5 yards + automatic first down.",
            "Pass interference (offensive) — Pushing off or obstructing a defender while the ball is in the air. 10-yard penalty.",
            "Pass interference (defensive) — Preventing a receiver from catching the ball through contact. Ball placed at the spot of the foul (NFL) or 15-yard penalty (college).",
            "Delay of game — Failing to snap the ball before the play clock expires. 5-yard penalty.",
            "Facemask — Grabbing an opponent's facemask. 15-yard penalty.",
            "Roughing the passer — Hitting the quarterback after they have released the ball. 15 yards + automatic first down.",
            "Unnecessary roughness — Excessive force or hitting a defenseless player. 15-yard penalty.",
          ],
        },
      ],
    },
    {
      id: "glossary",
      title: "Key Terms / Glossary",
      icon: "📖",
      entries: [
        {
          content: [
            "Snap — The center handing or hiking the ball to the quarterback to start a play.",
            "Sack — Tackling the quarterback behind the line of scrimmage.",
            "Interception — A defensive player catching a pass intended for an offensive player.",
            "Fumble — Dropping the ball while in play. Either team can recover it.",
            "Blitz — A defensive play where extra players rush the quarterback.",
            "Audible — When the quarterback changes the play at the line of scrimmage by calling out signals.",
            "Line of scrimmage — The imaginary line where the ball is placed before each play.",
            "Down — One play or attempt. The offense gets 4 downs to advance 10 yards.",
            "Red zone — The area inside the opponent's 20-yard line, close to scoring.",
            "Pocket — The protective area formed by offensive linemen around the quarterback.",
            "Play action — A fake handoff to a running back before the quarterback throws a pass.",
          ],
        },
      ],
    },
  ],
};

// ============================================================
// TENNIS
// ============================================================
const tennisRulebook: SportRulebook = {
  sportId: "tennis",
  sportName: "Tennis",
  sportIcon: "🎾",
  officialBody: "ITF / ATP / WTA / USTA",
  sections: [
    {
      id: "basic-rules",
      title: "Basic Rules",
      icon: "📋",
      entries: [
        {
          content: [
            "Tennis is played as singles (1 vs 1) or doubles (2 vs 2).",
            "Players stand on opposite sides of a net and hit the ball back and forth using a racket.",
            "The ball must bounce once before being hit (except volleys at the net).",
            "A player wins a point when the opponent fails to return the ball within the court boundaries.",
            "The server alternates sides (deuce court and ad court) after each point. The serve switches to the other player after each game.",
            "The server gets two attempts to serve into the correct service box. A missed first serve is a fault; two faults is a double fault (point lost).",
            "A let occurs when a serve hits the net and lands in the correct box — the serve is replayed.",
            "Players switch ends of the court after every odd-numbered game.",
            "In doubles, teammates take turns serving and receiving on alternating games.",
          ],
        },
      ],
    },
    {
      id: "scoring",
      title: "Scoring",
      icon: "🎯",
      entries: [
        {
          content: [
            "Points within a game: 0 (Love), 15, 30, 40, Game.",
            "A player must win by 2 points. If the score reaches 40-40, it is called Deuce.",
            "After Deuce, the next point is Advantage (Ad). If the player with advantage wins the next point, they win the game. If they lose it, the score returns to Deuce.",
            "A set is won by the first player to win 6 games with at least a 2-game lead.",
            "If a set reaches 6-6, a tiebreak is played. The tiebreak is won by the first to 7 points with a 2-point lead.",
            "A match is typically best of 3 sets (women's and most men's events) or best of 5 sets (men's Grand Slams).",
            "A \"bagel\" is winning a set 6-0. A \"breadstick\" is winning a set 6-1.",
          ],
        },
      ],
    },
    {
      id: "positions",
      title: "Positions & Roles",
      icon: "👥",
      entries: [
        {
          content: [
            "Server — The player who starts the point by serving from behind the baseline.",
            "Returner — The player receiving the serve, positioned diagonally across the court.",
            "Baseline player — A player who primarily stays near the baseline and hits groundstrokes.",
            "Net player (Doubles) — In doubles, the partner not serving/returning often stands near the net to volley and intercept.",
            "Serve-and-volleyer — A style of play where the server rushes to the net after serving.",
            "All-court player — A player comfortable playing from the baseline and the net.",
          ],
        },
      ],
    },
    {
      id: "dimensions",
      title: "Field / Court Dimensions",
      icon: "📐",
      entries: [
        {
          content: [
            "Court length: 78 feet (23.77 meters).",
            "Singles court width: 27 feet (8.23 meters).",
            "Doubles court width: 36 feet (10.97 meters). The extra width is called the \"tramlines\" or \"alleys.\"",
            "Net height: 3 feet (0.914m) at the center, 3.5 feet (1.07m) at the posts.",
            "Service boxes: 21 feet deep × 13.5 feet wide on each side of the net.",
            "Baseline: The line at each end of the court, 39 feet from the net.",
            "Court surfaces include hard court, clay, grass, and carpet — each affects ball speed and bounce.",
          ],
        },
      ],
    },
    {
      id: "penalties",
      title: "Common Penalties & Violations",
      icon: "🚫",
      entries: [
        {
          content: [
            "Foot fault — The server's foot touches or crosses the baseline or center mark before making contact with the ball. Counts as a fault.",
            "Double fault — Two consecutive service faults. The opponent wins the point.",
            "Time violation — Taking too long between points (typically 25 seconds). First offense is a warning; subsequent offenses cost a point.",
            "Hindrance — Intentionally distracting the opponent during a point. May result in loss of point.",
            "Code violation — Racket abuse, verbal abuse, ball abuse, coaching (when not allowed), or unsportsmanlike conduct. Escalating penalties: warning, point penalty, game penalty, default.",
            "Not up / Double bounce — Hitting the ball after it has bounced twice. Loss of point.",
            "Net touch — Touching the net with any part of the body or racket during a point. Loss of point.",
          ],
        },
      ],
    },
    {
      id: "glossary",
      title: "Key Terms / Glossary",
      icon: "📖",
      entries: [
        {
          content: [
            "Ace — A serve that the returner fails to touch. An immediate point for the server.",
            "Break — Winning a game in which the opponent is serving.",
            "Love — A score of zero (e.g., 30-Love means 30-0).",
            "Deuce — A score of 40-40 in a game.",
            "Rally — A sequence of shots hit back and forth between players during a point.",
            "Volley — Hitting the ball before it bounces, usually near the net.",
            "Groundstroke — A forehand or backhand shot hit after the ball bounces.",
            "Lob — A high, arcing shot hit over the opponent's head, usually when they are at the net.",
            "Drop shot — A soft shot that just clears the net and lands short in the opponent's court.",
            "Match point — A point that, if won by the leading player, wins the match.",
            "Unforced error — A missed shot that was not caused by the opponent's good play.",
          ],
        },
      ],
    },
  ],
};

// ============================================================
// VOLLEYBALL
// ============================================================
const volleyballRulebook: SportRulebook = {
  sportId: "volleyball",
  sportName: "Volleyball",
  sportIcon: "🏐",
  officialBody: "FIVB / USA Volleyball / NFHS",
  sections: [
    {
      id: "basic-rules",
      title: "Basic Rules",
      icon: "📋",
      entries: [
        {
          content: [
            "A match is played between two teams of 6 players each on the court.",
            "Rally scoring is used — a point is awarded on every rally, regardless of which team served.",
            "A team may touch the ball a maximum of 3 times before sending it over the net (a block does not count as a touch).",
            "The ball must not be caught, held, or thrown — it must be hit cleanly.",
            "Players rotate clockwise one position each time their team wins the serve back (side-out).",
            "The server serves from behind the end line on the right side of the court.",
            "The ball may touch the net on a serve or during play and remain in play as long as it goes over.",
            "A match is typically best of 5 sets.",
            "The libero is a defensive specialist who wears a different color jersey and can replace any back-row player without counting as a substitution.",
            "The libero cannot serve, attack the ball above net height from anywhere on the court, or set an attacker from the front zone using an overhead set.",
          ],
        },
      ],
    },
    {
      id: "scoring",
      title: "Scoring",
      icon: "🎯",
      entries: [
        {
          content: [
            "Sets 1–4 are played to 25 points. A team must win by at least 2 points.",
            "The 5th set (if needed) is played to 15 points, also requiring a 2-point lead.",
            "A match is won by the team that wins 3 out of 5 sets.",
            "A point is scored when the ball hits the floor on the opponent's side, the opponent commits a fault, or the opponent receives a penalty.",
            "Side-out — When the receiving team wins the rally, they earn a point and gain the serve.",
          ],
        },
      ],
    },
    {
      id: "positions",
      title: "Positions & Roles",
      icon: "👥",
      entries: [
        {
          content: [
            "Setter (S) — The playmaker. Runs the offense by setting the ball to hitters. Like a quarterback in football.",
            "Outside Hitter (OH) — Attacks from the left side. Often the primary offensive weapon and receives the most sets.",
            "Middle Blocker (MB) — Plays in the center of the net. Responsible for blocking and quick attacks in the middle.",
            "Opposite Hitter (OPP) — Attacks from the right side, opposite the setter. Often a strong hitter and back-row attacker.",
            "Libero (L) — Defensive specialist in a different jersey. Plays only in the back row, specializes in passing and digging.",
            "Defensive Specialist (DS) — A back-row substitution player who excels at passing and defense. Similar to the libero but follows normal substitution rules.",
          ],
        },
      ],
    },
    {
      id: "dimensions",
      title: "Field / Court Dimensions",
      icon: "📐",
      entries: [
        {
          content: [
            "Court size: 18 meters long × 9 meters wide (59 ft × 29.5 ft).",
            "The net divides the court into two equal 9m × 9m halves.",
            "Net height: 2.43 meters (7 ft 11 5/8 in) for men; 2.24 meters (7 ft 4 1/8 in) for women.",
            "Attack line (3-meter line / 10-foot line): Located 3 meters from the center line. Back-row players must jump from behind this line to attack.",
            "Service area: Behind the end line, extending the full width of the court.",
            "Free zone: At least 3 meters of clearance around the court for player movement.",
            "Antenna: Vertical rods placed on the net above the sidelines. The ball must pass between the antennae to be in play.",
          ],
        },
      ],
    },
    {
      id: "penalties",
      title: "Common Penalties & Violations",
      icon: "🚫",
      entries: [
        {
          content: [
            "Double hit — A player contacts the ball twice in succession (exception: the first contact of a team may be a double if it is a hard-driven ball).",
            "Lift / Carry — The ball comes to rest momentarily during contact. Must be a clean hit.",
            "Net violation — A player touches the net while the ball is in play (if it interferes with play).",
            "Foot fault — The server steps on or over the end line before making contact with the ball on a serve.",
            "Rotation fault — Players are not in the correct rotational order at the time of the serve.",
            "Back-row attack — A back-row player attacks the ball above net height from in front of the attack line.",
            "Four hits — A team contacts the ball more than 3 times before sending it over the net.",
            "Center line violation — A player's foot completely crosses the center line under the net.",
          ],
        },
      ],
    },
    {
      id: "glossary",
      title: "Key Terms / Glossary",
      icon: "📖",
      entries: [
        {
          content: [
            "Kill — An attack that directly results in a point.",
            "Dig — Passing a hard-driven ball, usually an attack, keeping it in play.",
            "Ace — A serve that results directly in a point (untouched or unreturnable).",
            "Block — Deflecting the ball at the net back into the opponent's court.",
            "Assist — A set that leads directly to a kill.",
            "Side out — When the receiving team wins the rally and earns the serve.",
            "Rotation — The clockwise movement of players after winning the serve back.",
            "Setter dump — When the setter attacks the ball on the second contact instead of setting a hitter.",
            "Pancake — A one-handed defensive move where a player slides their hand flat on the floor, allowing the ball to bounce off the back of their hand.",
            "Free ball — An easy ball sent over the net (not attacked), giving the receiving team an easy pass.",
            "Joust — When two opposing players simultaneously contact the ball above the net.",
          ],
        },
      ],
    },
  ],
};

// ============================================================
// EXPORT
// ============================================================
export const RULEBOOK_DATA: Record<SportId, SportRulebook> = {
  basketball: basketballRulebook,
  baseball: baseballRulebook,
  soccer: soccerRulebook,
  football: footballRulebook,
  tennis: tennisRulebook,
  volleyball: volleyballRulebook,
};
