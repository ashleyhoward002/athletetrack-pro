export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

// Sample knowledge base content organized by sport
const KNOWLEDGE_BASE: Record<string, { filename: string; content: string }> = {
    basketball: {
        filename: "basketball-fundamentals.txt",
        content: `Basketball Fundamentals Training Guide

SHOOTING MECHANICS
The BEEF Method for Perfect Shooting Form:
- Balance: Feet shoulder-width apart, knees slightly bent, weight on balls of feet
- Eyes: Focus on the back of the rim throughout the entire shot motion
- Elbow: Keep shooting elbow directly under the ball, forming an "L" shape
- Follow-through: Snap wrist down like reaching into a cookie jar, fingers pointing at rim

Arc and Release Point:
- Aim for a 45-52 degree arc on your shot
- Release the ball at the top of your jump for maximum power
- Keep your guide hand still - it should not influence the shot

Common Shooting Mistakes:
1. Thumb flicking from guide hand - causes side spin
2. Shooting on the way down - reduces power and consistency
3. Flat arc - makes the target smaller
4. Not squaring shoulders to basket - affects accuracy

BALL HANDLING
Basic Dribbling Fundamentals:
- Keep eyes up, not on the ball
- Dribble with fingertips, not palm
- Keep the ball below waist level
- Protect the ball with your body

Essential Dribble Moves:
1. Crossover: Quick, low bounce from one hand to the other
2. Between the legs: Protect the ball while changing direction
3. Behind the back: Advanced protection when defender reaches
4. Hesitation: Change of pace to freeze defender

DEFENSIVE STANCE
- Feet wider than shoulder width
- Knees bent, butt down
- Hands active and ready
- Weight on balls of feet
- Eyes on opponent's midsection

PRACTICE DRILLS
Form Shooting: Start 3 feet from basket, make 10 in a row before moving back.
Mikan Drill: Continuous layups alternating sides, 50 makes total.
Ball Handling: 10 minutes daily - pound dribbles, crossovers, between legs.`
    },

    baseball: {
        filename: "baseball-fundamentals.txt",
        content: `Baseball Fundamentals Training Guide

HITTING MECHANICS
Stance and Setup:
- Feet shoulder-width apart, weight balanced
- Knees slightly bent, athletic position
- Hands back near rear shoulder
- Eyes level, both eyes on pitcher
- Relaxed grip - don't squeeze the bat

Swing Mechanics:
- Load: Small weight shift back
- Stride: Short, soft step toward pitcher
- Hip rotation leads the swing
- Hands stay inside the ball
- Level swing through the zone
- Full extension at contact
- Complete follow-through

Common Hitting Mistakes:
1. Stepping out (bailing) - keep front foot closed
2. Dropping hands - maintain hand position
3. Casting (long swing) - stay short to the ball
4. Head pulling off - keep eyes on contact point

PITCHING FUNDAMENTALS
Basic Mechanics:
- Start with good balance on rubber
- Controlled leg lift, knee to chest
- Hip leads rotation toward plate
- Arm action: down, back, up
- Release out front
- Complete follow-through

Pitch Types for Youth:
1. Fastball - focus on location and movement
2. Changeup - same arm speed, different grip
Note: Curveballs not recommended until age 14+

FIELDING BASICS
Ground Ball Technique:
- Get in front of the ball
- Stay low, butt down
- Field with two hands
- Watch ball into glove
- Quick transfer to throwing hand

Throwing Mechanics:
- Grip across seams (4-seam)
- Step toward target
- Elbow above shoulder
- Full arm extension
- Follow through to opposite hip

BASERUNNING
- Always run hard out of the box
- Touch inside of each base
- Look for coach's signs approaching bases
- Round bases when ball is in outfield
- Slide feet-first when in doubt`
    },

    soccer: {
        filename: "soccer-skills.txt",
        content: `Soccer Skills Development Guide

BALL CONTROL FUNDAMENTALS
First Touch Principles:
- Cushion the ball on contact to absorb momentum
- Use the inside of your foot for most receptions
- Keep your eyes on the ball until contact
- Direct your first touch toward open space

Receiving Techniques:
1. Inside foot trap - Most common, provides good control
2. Outside foot - For balls coming across your body
3. Sole of foot - Stop the ball dead when needed
4. Thigh trap - For balls dropping from height
5. Chest control - For aerial balls

PASSING ACCURACY
Short Passing:
- Plant foot next to the ball, pointing at target
- Strike with inside of foot through center of ball
- Follow through toward your target
- Keep ankle locked and firm

Long Passing / Crossing:
- Approach at 45-degree angle
- Plant foot 6 inches from ball
- Strike low on ball with laces for height
- Follow through high for distance

DRIBBLING SKILLS
Close Control:
- Keep ball within 1-2 feet
- Use both feet equally
- Shield ball with body when pressured
- Keep head up to see field

1v1 Moves:
1. Step over - Fake one direction, go the other
2. Scissors - Multiple step overs in sequence
3. Cruyff turn - Drag ball behind standing leg
4. La Croqueta - Quick touch between feet

SHOOTING TECHNIQUE
Power Shots:
- Approach at angle
- Plant foot pointing at target
- Strike through center with laces
- Keep knee over ball

Finesse Shots:
- Use inside of foot for curve
- Aim for far corner
- Less power, more placement

DEFENSIVE POSITIONING
- Stay goal-side of attacker
- Force to weaker foot
- Don't dive in - stay on feet
- Delay until help arrives`
    },

    football: {
        filename: "football-fundamentals.txt",
        content: `Football Fundamentals Training Guide

QUARTERBACK MECHANICS
Grip and Stance:
- Fingers on laces, thumb underneath
- Ball held chest-high before drop
- Feet shoulder-width, knees bent
- Weight on balls of feet

Throwing Motion:
- Step toward target
- Rotate hips, then shoulders
- Elbow leads the throw
- Release at ear level
- Follow through to target
- Spiral comes from wrist snap

Drop Back Types:
- 3-step: Quick slants, hitches
- 5-step: Medium routes
- 7-step: Deep routes

RECEIVING SKILLS
Route Running:
- Explode off the line
- Sell your route with head/shoulder fakes
- Break at full speed
- Create separation at the top

Catching Fundamentals:
- Eyes on the ball all the way in
- Hands away from body
- Catch with hands, not body
- Diamond hands for high balls
- Basket catch for low balls
- Tuck immediately after catch

RUNNING BACK BASICS
Ball Security:
- High and tight - 5 points of contact
- Cover with both arms in traffic
- Switch hands on sweeps

Vision and Cuts:
- Read blocks, find the hole
- One cut and go
- Press the hole before cutting
- Keep feet moving through contact

BLOCKING FUNDAMENTALS
Stance:
- Three-point or two-point
- Weight forward
- Eyes up, back flat

Drive Block:
- Explode on snap
- Strike with hands inside
- Drive legs, move feet
- Sustain block through whistle

TACKLING TECHNIQUE
- Break down in athletic stance
- Eyes on hips (they don't lie)
- Drive through the target
- Wrap arms and squeeze
- Roll hips, drive legs
- Head across the body (never lead with crown)`
    },

    tennis: {
        filename: "tennis-fundamentals.txt",
        content: `Tennis Fundamentals Training Guide

GRIP FUNDAMENTALS
Eastern Forehand Grip:
- Shake hands with the racket
- Base knuckle on bevel 3
- Good for beginners, flat shots

Semi-Western Grip:
- Base knuckle on bevel 4
- More topspin potential
- Modern baseline game

Continental Grip:
- Used for serves, volleys, slices
- Base knuckle on bevel 2
- Essential for all players

FOREHAND TECHNIQUE
Ready Position:
- Knees bent, weight forward
- Racket in front, both hands
- Stay on balls of feet

Swing Path:
- Unit turn with shoulders
- Racket drop below ball
- Low to high swing
- Contact in front of body
- Full extension
- Follow through over shoulder

BACKHAND TECHNIQUE
Two-Handed:
- Both hands on racket
- Non-dominant hand controls
- Rotate shoulders fully
- Swing through the ball

One-Handed:
- Stronger grip required
- Reach and extension
- Slice or topspin options
- Classic technique

SERVE MECHANICS
Stance:
- Sideways to baseline
- Front foot at 45 degrees
- Back foot parallel to baseline

Motion:
- Ball toss in front and right (for righties)
- Trophy position at top
- Racket drop behind back
- Explode upward
- Pronation at contact
- Full follow through

VOLLEYS
- Continental grip
- Short backswing
- Punch through the ball
- Keep wrist firm
- Move through the shot
- Stay low for low volleys

MOVEMENT
Split Step:
- Small hop as opponent contacts
- Land on balls of feet
- Ready to move any direction

Recovery:
- Return to center after shots
- Use shuffle steps
- Maintain balance`
    },

    volleyball: {
        filename: "volleyball-fundamentals.txt",
        content: `Volleyball Fundamentals Training Guide

PASSING (BUMP)
Platform Position:
- Arms straight, together
- Thumbs side by side
- Create flat surface
- Shoulders over knees

Technique:
- Move feet to ball first
- Angle platform to target
- Use legs, not arms
- Contact on forearms
- Follow through to target

SETTING
Hand Position:
- Hands above forehead
- Form triangle with fingers
- Spread fingers wide
- Wrists back, elbows out

Technique:
- Get under the ball
- Contact on fingertips
- Extend arms and legs together
- Follow through high

ATTACKING (HITTING)
Approach:
- 3 or 4 step approach
- Left-right-left (for righties)
- Plant on last two steps
- Arms back, then up

Swing:
- Jump off both feet
- Bow and arrow arm position
- Contact at highest point
- Snap wrist over the ball
- Follow through down

SERVING
Underhand:
- Good for beginners
- Hold ball in non-hitting hand
- Step and swing in one motion
- Contact below waist

Overhand Float:
- Toss in front of hitting shoulder
- Contact center of ball
- No spin for movement
- Short follow through

Overhand Topspin:
- Higher toss
- Full arm swing
- Snap wrist over ball
- Ball drops quickly

BLOCKING
Ready Position:
- Hands up, at net height
- Eyes on setter, then hitter
- Feet shoulder width

Technique:
- Move along net with shuffle
- Jump when hitter jumps
- Press hands over net
- Seal the net (no gap)
- Penetrate into opponent's space

DIGGING
- Low athletic stance
- Weight forward
- Read hitter's arm
- React and pursue
- Get platform under ball
- Keep ball on your side`
    },

    conditioning: {
        filename: "strength-conditioning.txt",
        content: `Strength & Conditioning Guide for Athletes

WARM-UP PROTOCOLS
Dynamic Warm-Up (10-15 minutes):
1. Light jog - 2 minutes
2. High knees - 30 seconds
3. Butt kicks - 30 seconds
4. Leg swings (front/back, side/side) - 10 each
5. Walking lunges with twist - 10 each leg
6. Arm circles - 20 each direction
7. Torso twists - 20 reps

CORE STRENGTH
Foundation Exercises:
1. Plank - 30-60 seconds, 3 sets
2. Side plank - 30 seconds each side, 3 sets
3. Dead bug - 10 reps each side, 3 sets
4. Bird dog - 10 reps each side, 3 sets
5. Hollow body hold - 20-30 seconds, 3 sets

LOWER BODY STRENGTH
Essential Exercises:
1. Squats - 3 sets of 8-12 reps
2. Romanian deadlifts - 3 sets of 10 reps
3. Bulgarian split squats - 3 sets of 8 each leg
4. Hip thrusts - 3 sets of 12 reps
5. Calf raises - 3 sets of 15 reps

Plyometrics for Power:
1. Box jumps - 3 sets of 5 reps
2. Broad jumps - 3 sets of 5 reps
3. Single leg hops - 3 sets of 8 each leg
4. Lateral bounds - 3 sets of 6 each direction

UPPER BODY STRENGTH
Push Exercises:
1. Push-ups - 3 sets of 15-20 reps
2. Dumbbell bench press - 3 sets of 10 reps
3. Overhead press - 3 sets of 8 reps

Pull Exercises:
1. Pull-ups - 3 sets of 6-10 reps
2. Bent over rows - 3 sets of 10 reps
3. Face pulls - 3 sets of 15 reps

RECOVERY
Post-Workout:
- Cool-down walk - 5 minutes
- Static stretching - 10 minutes
- Foam rolling - 5-10 minutes
- Hydration - 16-24 oz water
- Protein within 30 minutes

Sleep for Athletes:
- Aim for 8-10 hours per night
- Consistent sleep schedule
- Room cool and dark
- No screens 1 hour before bed`
    }
};

async function generateEmbedding(text: string, accessToken: string): Promise<number[]> {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-embeddings`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ text }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate embedding");
    }

    const data = await response.json();
    return data.embedding;
}

export async function POST(req: NextRequest) {
    try {
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);

        // Auth check
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get selected sports from request body
        const body = await req.json().catch(() => ({}));
        const selectedSports: string[] = body.sports || Object.keys(KNOWLEDGE_BASE);

        const accessToken = session.access_token;
        let documentsAdded = 0;

        // Process each selected sport
        for (const sport of selectedSports) {
            const doc = KNOWLEDGE_BASE[sport];
            if (!doc) continue;

            // Split into chunks
            const chunkSize = 1000;
            const chunks = [];
            for (let i = 0; i < doc.content.length; i += chunkSize) {
                chunks.push(doc.content.slice(i, i + chunkSize));
            }

            // Generate embeddings and store each chunk
            for (const chunk of chunks) {
                try {
                    const embedding = await generateEmbedding(chunk, accessToken);

                    const { error } = await supabase.from("documents").insert({
                        user_id: session.user.id,
                        content: chunk,
                        embedding: embedding,
                        metadata: {
                            filename: doc.filename,
                            type: "text/plain",
                            source: "system_seed",
                            sport: sport
                        }
                    });

                    if (error) {
                        console.error("Insert error:", error);
                    } else {
                        documentsAdded++;
                    }
                } catch (embeddingError) {
                    console.error("Embedding error for chunk:", embeddingError);
                }
            }
        }

        return NextResponse.json({
            success: true,
            documentsAdded,
            sports: selectedSports,
            message: `Added ${documentsAdded} document chunks for ${selectedSports.join(", ")}`
        });

    } catch (error) {
        console.error("Seed error:", error);
        return NextResponse.json(
            { error: "Failed to seed knowledge base" },
            { status: 500 }
        );
    }
}
