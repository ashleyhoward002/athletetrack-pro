"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

// Tab configuration
const tabs = [
  { id: "start", label: "Getting Started", icon: "🚀" },
  { id: "stats", label: "Stats", icon: "📊" },
  { id: "drills", label: "Drills", icon: "🏋️" },
  { id: "skills", label: "Skills", icon: "🎯" },
  { id: "form", label: "Form Analysis", icon: "📹" },
  { id: "scout", label: "Scout", icon: "🔍" },
];

const validTabs = tabs.map(t => t.id);

export default function GuidePage() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState("start");

  // Set active tab from URL parameter
  useEffect(() => {
    if (tabParam && validTabs.includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  return (
    <main className="min-h-screen p-4 md:p-8 pb-24">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold">Help & Guide</h1>
          <p className="text-base-content/70 mt-1">
            Learn how to use every feature to help your athlete reach their full potential.
          </p>
        </div>

        {/* Tabs */}
        <div className="tabs tabs-boxed bg-base-200 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? "tab-active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === "start" && <GettingStartedSection />}
          {activeTab === "stats" && <StatsSection />}
          {activeTab === "drills" && <DrillsSection />}
          {activeTab === "skills" && <SkillsSection />}
          {activeTab === "form" && <FormAnalysisSection />}
          {activeTab === "scout" && <ScoutSection />}
        </div>
      </div>
    </main>
  );
}

// ============ GETTING STARTED SECTION ============
function GettingStartedSection() {
  return (
    <div className="space-y-6">
      <div className="card bg-primary/10 border border-primary/20">
        <div className="card-body">
          <h2 className="card-title text-2xl">Welcome to AthleteTrack Pro!</h2>
          <p className="text-base-content/80">
            This app helps parents, coaches, and athletes track performance, build skills,
            and improve through data-driven training. Here's everything you can do:
          </p>
        </div>
      </div>

      {/* Feature Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FeatureCard
          icon="📊"
          title="Track Stats"
          description="Log game performances and see averages, trends, and season highs across all sports."
          link="/dashboard/stats"
        />
        <FeatureCard
          icon="🏋️"
          title="Drill Library"
          description="Access training exercises organized by sport, difficulty, and skill category."
          link="/dashboard/drills"
        />
        <FeatureCard
          icon="🎯"
          title="Skill Trees"
          description="Progress through skills like a video game - unlock new abilities as you master the basics."
          link="/dashboard/skills"
        />
        <FeatureCard
          icon="📹"
          title="Form Analysis"
          description="Upload videos and get AI-powered feedback on technique and form."
          link="/dashboard/form-analysis"
        />
        <FeatureCard
          icon="🔍"
          title="AI Scout"
          description="Research opponents and get scouting reports on rival athletes and teams."
          link="/dashboard/scout"
        />
        <FeatureCard
          icon="🏆"
          title="Achievements"
          description="Earn badges, complete challenges, and track streaks to stay motivated."
          link="/dashboard/achievements"
        />
      </div>

      {/* First Week Checklist */}
      <div className="card bg-base-200">
        <div className="card-body">
          <h3 className="card-title">Your First Week Checklist</h3>
          <ul className="steps steps-vertical">
            <li className="step">
              <div className="text-left">
                <span className="font-semibold">Add your athlete</span>
                <p className="text-sm text-base-content/60">Go to Athletes and create a profile</p>
              </div>
            </li>
            <li className="step">
              <div className="text-left">
                <span className="font-semibold">Log your first game</span>
                <p className="text-sm text-base-content/60">Record stats from a recent game</p>
              </div>
            </li>
            <li className="step">
              <div className="text-left">
                <span className="font-semibold">Try a drill</span>
                <p className="text-sm text-base-content/60">Pick a Rookie drill and complete it</p>
              </div>
            </li>
            <li className="step">
              <div className="text-left">
                <span className="font-semibold">Check your skill tree</span>
                <p className="text-sm text-base-content/60">See what skills you can unlock</p>
              </div>
            </li>
            <li className="step">
              <div className="text-left">
                <span className="font-semibold">Upload a form video</span>
                <p className="text-sm text-base-content/60">Get AI feedback on your technique</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// ============ STATS SECTION ============
function StatsSection() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Understanding Your Stats"
        description="Track game performance and see how your athlete improves over time."
      />

      {/* Stat Abbreviations */}
      <div className="card bg-base-200">
        <div className="card-body">
          <h3 className="card-title">Common Stat Abbreviations</h3>
          <p className="text-sm text-base-content/70 mb-4">
            Don't know what PPG or FG% mean? Here's a quick reference:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TermCard term="PPG" definition="Points Per Game - Average points scored each game" />
            <TermCard term="RPG" definition="Rebounds Per Game - Average rebounds grabbed each game" />
            <TermCard term="APG" definition="Assists Per Game - Average assists (passes leading to scores)" />
            <TermCard term="FG%" definition="Field Goal Percentage - Shots made divided by shots attempted" />
            <TermCard term="3PT%" definition="Three-Point Percentage - 3-pointers made divided by attempted" />
            <TermCard term="FT%" definition="Free Throw Percentage - Free throws made divided by attempted" />
            <TermCard term="STL" definition="Steals - Times you took the ball from the opponent" />
            <TermCard term="BLK" definition="Blocks - Times you blocked an opponent's shot" />
            <TermCard term="TO" definition="Turnovers - Times you lost the ball to the opponent" />
            <TermCard term="MIN" definition="Minutes - Time played in the game" />
          </div>
        </div>
      </div>

      {/* Dashboard Sections Explained */}
      <div className="card bg-base-200">
        <div className="card-body">
          <h3 className="card-title">Reading Your Stats Dashboard</h3>

          <div className="space-y-4 mt-2">
            <InfoBlock
              title="Season Averages"
              description="These cards show your average performance across all games this season. Higher numbers generally mean better performance (except for turnovers - lower is better!)."
            />
            <InfoBlock
              title="Season Highs"
              description="Your best single-game performances. These are the maximum values you've achieved in any one game - great for seeing your potential!"
            />
            <InfoBlock
              title="Performance Trend Chart"
              description="The line graph shows how a stat changes game-by-game. An upward trend means improvement. Look for consistency (less zigzag) and growth over time."
            />
            <InfoBlock
              title="Game Log Table"
              description="A detailed record of every game. You can sort by any column (click the header) and filter to find specific games."
            />
          </div>
        </div>
      </div>

      <ProTip>
        Log games consistently right after they happen. The more data you have,
        the better you can spot trends and areas for improvement!
      </ProTip>
    </div>
  );
}

// ============ DRILLS SECTION ============
function DrillsSection() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Using the Drill Library"
        description="Training exercises organized by sport, difficulty, and skill category."
      />

      {/* Difficulty Levels */}
      <div className="card bg-base-200">
        <div className="card-body">
          <h3 className="card-title">Difficulty Levels Explained</h3>
          <p className="text-sm text-base-content/70 mb-4">
            Drills are organized into three difficulty levels. Start with Rookie and work your way up!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card bg-success/10 border border-success/30">
              <div className="card-body p-4">
                <div className="badge badge-success mb-2">Rookie</div>
                <p className="font-semibold">Fundamentals</p>
                <p className="text-sm text-base-content/70">
                  Basic skills every athlete needs. Perfect for beginners or warming up.
                </p>
              </div>
            </div>
            <div className="card bg-warning/10 border border-warning/30">
              <div className="card-body p-4">
                <div className="badge badge-warning mb-2">Pro</div>
                <p className="font-semibold">Intermediate</p>
                <p className="text-sm text-base-content/70">
                  More complex techniques. Move here once you've mastered the basics.
                </p>
              </div>
            </div>
            <div className="card bg-error/10 border border-error/30">
              <div className="card-body p-4">
                <div className="badge badge-error mb-2">All-Star</div>
                <p className="font-semibold">Advanced</p>
                <p className="text-sm text-base-content/70">
                  Elite-level drills for serious athletes ready for a challenge.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Drill Parameters */}
      <div className="card bg-base-200">
        <div className="card-body">
          <h3 className="card-title">Understanding Drill Parameters</h3>

          <div className="space-y-4 mt-2">
            <InfoBlock
              title="Sets"
              description="How many rounds of the exercise to complete. For example, '3 sets' means do the exercise 3 times with rest in between."
            />
            <InfoBlock
              title="Reps"
              description="Repetitions - how many times to do the movement in each set. '10 reps' means perform the action 10 times before resting."
            />
            <InfoBlock
              title="Duration"
              description="How long the drill takes in minutes. Use this to plan your practice sessions."
            />
            <InfoBlock
              title="XP Reward"
              description="Experience points earned for completing the drill. XP helps you level up and unlock new skills in the Skill Tree!"
            />
          </div>
        </div>
      </div>

      {/* How to Use */}
      <div className="card bg-base-200">
        <div className="card-body">
          <h3 className="card-title">How to Use the Drill Library</h3>

          <ol className="list-decimal list-inside space-y-3 mt-2">
            <li className="text-base-content/80">
              <span className="font-semibold">Browse by category</span> - Filter drills by skill type (Shooting, Defense, etc.)
            </li>
            <li className="text-base-content/80">
              <span className="font-semibold">Watch the video</span> - Click the video link to see proper technique
            </li>
            <li className="text-base-content/80">
              <span className="font-semibold">Follow the instructions</span> - Read the description for step-by-step guidance
            </li>
            <li className="text-base-content/80">
              <span className="font-semibold">Complete the drill</span> - Do all sets and reps as prescribed
            </li>
            <li className="text-base-content/80">
              <span className="font-semibold">Mark it done</span> - Log your completion to earn XP
            </li>
          </ol>
        </div>
      </div>

      <ProTip>
        Create a Training Program to organize multiple drills into a weekly schedule.
        This helps build consistency and ensures balanced skill development!
      </ProTip>
    </div>
  );
}

// ============ SKILLS SECTION ============
function SkillsSection() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Mastering Skill Trees"
        description="Progress through skills like a video game - unlock new abilities as you master the basics."
      />

      {/* What are Skill Trees */}
      <div className="card bg-base-200">
        <div className="card-body">
          <h3 className="card-title">What Are Skill Trees?</h3>
          <p className="text-base-content/80 mt-2">
            Skill Trees organize athletic abilities into a progression system. Think of it like
            leveling up in a video game - you start with basic skills and unlock more advanced
            techniques as you improve.
          </p>
          <p className="text-base-content/80 mt-2">
            Each sport has multiple trees (like Ball Handling, Shooting, Defense) containing
            individual skills to master.
          </p>
        </div>
      </div>

      {/* Skill States */}
      <div className="card bg-base-200">
        <div className="card-body">
          <h3 className="card-title">Understanding Skill States</h3>
          <p className="text-sm text-base-content/70 mb-4">
            Each skill in the tree has a status showing your progress:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-base-300/50 rounded-lg opacity-50">
              <span className="text-2xl">🔒</span>
              <div>
                <p className="font-semibold">Locked</p>
                <p className="text-sm text-base-content/60">Complete prerequisite skills first</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg ring-2 ring-primary">
              <span className="text-2xl">🎯</span>
              <div>
                <p className="font-semibold">Available</p>
                <p className="text-sm text-base-content/60">Ready to start! Look for the pulsing glow</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-warning/10 rounded-lg ring-2 ring-warning">
              <span className="text-2xl">📈</span>
              <div>
                <p className="font-semibold">In Progress</p>
                <p className="text-sm text-base-content/60">You're working on it - keep going!</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-success/10 rounded-lg ring-2 ring-success">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-semibold">Completed</p>
                <p className="text-sm text-base-content/60">Mastered! This unlocks the next skills</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* XP Explained */}
      <div className="card bg-base-200">
        <div className="card-body">
          <h3 className="card-title">How XP Works</h3>

          <div className="space-y-4 mt-2">
            <InfoBlock
              title="Earning XP"
              description="Complete drills to earn Experience Points (XP). Each drill awards XP based on its difficulty and duration."
            />
            <InfoBlock
              title="Skill Progress"
              description="XP from related drills counts toward skill completion. For example, doing shooting drills earns XP for shooting skills."
            />
            <InfoBlock
              title="Prerequisites"
              description="Some skills require you to master earlier skills first. This ensures you build a strong foundation before advancing."
            />
            <InfoBlock
              title="Level System"
              description="Your overall level is calculated from total XP earned. Higher levels show dedication and skill mastery!"
            />
          </div>
        </div>
      </div>

      <ProTip>
        Focus on one skill tree at a time. Completing all Rookie skills before moving
        to Pro level builds a stronger foundation than jumping around!
      </ProTip>
    </div>
  );
}

// ============ FORM ANALYSIS SECTION ============
function FormAnalysisSection() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="AI Form Analysis"
        description="Upload videos and get instant AI-powered feedback on your technique."
      />

      {/* What it Does */}
      <div className="card bg-base-200">
        <div className="card-body">
          <h3 className="card-title">What Form Analysis Does</h3>
          <p className="text-base-content/80 mt-2">
            Our AI watches your video like a coach would, analyzing your technique and
            providing detailed feedback on what you're doing well and what to improve.
          </p>
          <ul className="list-disc list-inside mt-3 space-y-1 text-base-content/80">
            <li>Scores your form from 0-100</li>
            <li>Identifies your technical strengths</li>
            <li>Points out specific areas to improve</li>
            <li>Recommends drills to address weaknesses</li>
          </ul>
        </div>
      </div>

      {/* Recording Tips */}
      <div className="card bg-base-200">
        <div className="card-body">
          <h3 className="card-title">Tips for Recording Good Videos</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📷</span>
              <div>
                <p className="font-semibold">Camera Angle</p>
                <p className="text-sm text-base-content/60">
                  Position the camera at waist height, 10-15 feet away. Side angle works best for most movements.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <p className="font-semibold">Good Lighting</p>
                <p className="text-sm text-base-content/60">
                  Make sure you're well-lit from the front. Avoid backlighting (bright windows behind you).
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📱</span>
              <div>
                <p className="font-semibold">Keep it Short</p>
                <p className="text-sm text-base-content/60">
                  5-15 seconds is ideal. Focus on one movement or technique per video.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📁</span>
              <div>
                <p className="font-semibold">File Size</p>
                <p className="text-sm text-base-content/60">
                  Videos must be under 20MB. Shorter clips upload faster and analyze better.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Understanding Results */}
      <div className="card bg-base-200">
        <div className="card-body">
          <h3 className="card-title">Understanding Your Results</h3>

          <div className="space-y-4 mt-2">
            <InfoBlock
              title="Overall Score (0-100)"
              description="A quick snapshot of your form quality. 80+ is excellent, 60-79 is good with room to improve, below 60 needs focused practice."
            />
            <InfoBlock
              title="Strengths"
              description="What you're doing well! These are aspects of your technique to maintain and build upon."
            />
            <InfoBlock
              title="Areas to Improve"
              description="Specific feedback on what to work on. Focus on one improvement at a time for best results."
            />
            <InfoBlock
              title="Drill Recommendations"
              description="Suggested exercises from your Drill Library that target your weak points."
            />
          </div>
        </div>
      </div>

      {/* Live Coaching */}
      <div className="card bg-primary/10 border border-primary/20">
        <div className="card-body">
          <h3 className="card-title">Live Coaching Mode</h3>
          <p className="text-base-content/80 mt-2">
            Want real-time feedback? Use Live Coaching to get instant audio cues while you practice:
          </p>
          <ol className="list-decimal list-inside mt-3 space-y-2 text-base-content/80">
            <li>Click "Start Live Session" on the Form Analysis page</li>
            <li>Allow camera access and position yourself in frame</li>
            <li>Start your movement - the AI will give voice feedback</li>
            <li>Adjust your form based on the coaching cues</li>
            <li>Save the session to review later</li>
          </ol>
        </div>
      </div>

      <ProTip>
        Record multiple videos over time and use the Compare feature to see
        your improvement side-by-side!
      </ProTip>
    </div>
  );
}

// ============ SCOUT SECTION ============
function ScoutSection() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="AI Scout Agent"
        description="Research opponents and get scouting reports on rival athletes and teams."
      />

      {/* What Scout Does */}
      <div className="card bg-base-200">
        <div className="card-body">
          <h3 className="card-title">What the Scout Does</h3>
          <p className="text-base-content/80 mt-2">
            The AI Scout searches publicly available information about athletes and teams,
            then compiles a detailed scouting report to help you prepare for competition.
          </p>
          <ul className="list-disc list-inside mt-3 space-y-1 text-base-content/80">
            <li>Gathers performance statistics</li>
            <li>Identifies playing tendencies and patterns</li>
            <li>Spots potential weaknesses to exploit</li>
            <li>Provides strategic notes for game planning</li>
          </ul>
        </div>
      </div>

      {/* How to Use */}
      <div className="card bg-base-200">
        <div className="card-body">
          <h3 className="card-title">Running a Scout Report</h3>

          <ol className="list-decimal list-inside space-y-3 mt-2">
            <li className="text-base-content/80">
              <span className="font-semibold">Enter the target</span> - Type an athlete name or team name
            </li>
            <li className="text-base-content/80">
              <span className="font-semibold">Click "Run Analysis"</span> - The AI will search public sources
            </li>
            <li className="text-base-content/80">
              <span className="font-semibold">Wait for results</span> - Analysis takes a few moments
            </li>
            <li className="text-base-content/80">
              <span className="font-semibold">Review the report</span> - Read through stats, tendencies, and notes
            </li>
          </ol>
        </div>
      </div>

      {/* Reading the Report */}
      <div className="card bg-base-200">
        <div className="card-body">
          <h3 className="card-title">Understanding Scout Reports</h3>

          <div className="space-y-4 mt-2">
            <InfoBlock
              title="Stats Overview"
              description="Key performance numbers like points per game, shooting percentages, and other relevant statistics."
            />
            <InfoBlock
              title="Weakness"
              description="Areas where the opponent struggles. Use these insights to develop your game plan."
            />
            <InfoBlock
              title="Tendency"
              description="Patterns in how they play - like favorite moves, preferred spots on the court, or predictable habits."
            />
            <InfoBlock
              title="Strategic Notes"
              description="Additional observations and recommendations for how to approach the matchup."
            />
          </div>
        </div>
      </div>

      {/* Use Cases */}
      <div className="card bg-base-200">
        <div className="card-body">
          <h3 className="card-title">When to Use Scout</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🏀</span>
              <div>
                <p className="font-semibold">Pre-Game Prep</p>
                <p className="text-sm text-base-content/60">
                  Scout your next opponent a few days before the game to adjust your strategy.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🏆</span>
              <div>
                <p className="font-semibold">Tournament Planning</p>
                <p className="text-sm text-base-content/60">
                  Research multiple potential opponents when brackets are released.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📋</span>
              <div>
                <p className="font-semibold">Recruiting Research</p>
                <p className="text-sm text-base-content/60">
                  Coaches can research potential recruits or transfer targets.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <p className="font-semibold">Self-Analysis</p>
                <p className="text-sm text-base-content/60">
                  See what public info exists about your own athlete to understand your reputation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProTip>
        Scout reports work best with specific names. Include the school or team
        name if the athlete has a common name to get more accurate results.
      </ProTip>
    </div>
  );
}

// ============ REUSABLE COMPONENTS ============

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="card bg-primary/10 border border-primary/20">
      <div className="card-body py-4">
        <h2 className="card-title text-xl">{title}</h2>
        <p className="text-base-content/70">{description}</p>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description, link }: { icon: string; title: string; description: string; link: string }) {
  return (
    <Link href={link} className="card bg-base-200 hover:bg-base-300 transition-colors cursor-pointer">
      <div className="card-body p-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{icon}</span>
          <div>
            <h3 className="font-bold">{title}</h3>
            <p className="text-sm text-base-content/60">{description}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

function TermCard({ term, definition }: { term: string; definition: string }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-base-300/50 rounded-lg">
      <span className="badge badge-primary badge-lg font-mono">{term}</span>
      <p className="text-sm text-base-content/80">{definition}</p>
    </div>
  );
}

function InfoBlock({ title, description }: { title: string; description: string }) {
  return (
    <div className="border-l-4 border-primary pl-4">
      <p className="font-semibold">{title}</p>
      <p className="text-sm text-base-content/70">{description}</p>
    </div>
  );
}

function ProTip({ children }: { children: React.ReactNode }) {
  return (
    <div className="card bg-success/10 border border-success/20">
      <div className="card-body py-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <p className="font-semibold text-success">Pro Tip</p>
            <p className="text-base-content/80">{children}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
