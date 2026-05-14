// Static demo data used by the in-app mock server. Edit freely — this is just
// a fixture, not production data.

export interface FixtureExercise {
    exerciseId: string;
    name: string;
    targetMuscles: string[];
    secondaryMuscles: string[];
    bodyParts: string[];
    equipments: string[];
    gifUrl?: string;
    instructions: string[];
}

export const EXERCISE_FIXTURES: FixtureExercise[] = [
    {
        exerciseId: 'ex-001', name: 'Barbell Bench Press',
        targetMuscles: ['pectorals'], secondaryMuscles: ['triceps', 'delts'],
        bodyParts: ['chest'], equipments: ['barbell'],
        instructions: [
            'Lie flat on a bench with feet planted on the floor.',
            'Grip the bar slightly wider than shoulder width.',
            'Lower the bar to mid-chest with a controlled tempo.',
            'Press up explosively until elbows are fully extended.',
        ],
    },
    {
        exerciseId: 'ex-002', name: 'Back Squat',
        targetMuscles: ['quads', 'glutes'], secondaryMuscles: ['hamstrings', 'spine'],
        bodyParts: ['upper legs'], equipments: ['barbell'],
        instructions: [
            'Position the bar across your upper traps and brace your core.',
            'Initiate the descent by sending hips back and bending the knees.',
            'Descend until your hip crease is below the top of the knee.',
            'Drive through midfoot to stand back up.',
        ],
    },
    {
        exerciseId: 'ex-003', name: 'Conventional Deadlift',
        targetMuscles: ['hamstrings', 'glutes'], secondaryMuscles: ['spine', 'traps', 'forearms'],
        bodyParts: ['back', 'upper legs'], equipments: ['barbell'],
        instructions: [
            'Set the bar over the middle of the foot.',
            'Hinge at the hips, keep a flat back, grab the bar.',
            'Drive the floor away while keeping the bar in contact with your shins.',
            'Stand fully tall, lock out hips and knees together.',
        ],
    },
    {
        exerciseId: 'ex-004', name: 'Overhead Press',
        targetMuscles: ['delts'], secondaryMuscles: ['triceps', 'pectorals'],
        bodyParts: ['shoulders'], equipments: ['barbell'],
        instructions: [
            'Set up with the bar at the top of your chest.',
            'Press the bar straight up overhead.',
            'Lock out arms while moving your head forward to neutral.',
            'Lower the bar back down with control.',
        ],
    },
    {
        exerciseId: 'ex-005', name: 'Pull-Up',
        targetMuscles: ['lats'], secondaryMuscles: ['biceps', 'forearms', 'traps'],
        bodyParts: ['back'], equipments: ['body weight'],
        instructions: [
            'Hang from a bar with hands slightly wider than shoulders.',
            'Pull yourself up by driving your elbows down.',
            'Bring your chin above the bar.',
            'Lower with control until arms are fully extended.',
        ],
    },
    {
        exerciseId: 'ex-006', name: 'Romanian Deadlift',
        targetMuscles: ['hamstrings'], secondaryMuscles: ['glutes', 'spine'],
        bodyParts: ['upper legs'], equipments: ['barbell'],
        instructions: [
            'Hold the bar at hip level.',
            'Push hips back while keeping knees soft.',
            'Lower the bar along your shins to mid-shin.',
            'Drive hips forward to return to standing.',
        ],
    },
    {
        exerciseId: 'ex-007', name: 'Incline Dumbbell Press',
        targetMuscles: ['pectorals'], secondaryMuscles: ['delts', 'triceps'],
        bodyParts: ['chest'], equipments: ['dumbbell'],
        instructions: [
            'Set the bench to 30-45 degrees.',
            'Hold dumbbells over your chest with elbows under wrists.',
            'Lower the dumbbells to the sides of your chest.',
            'Press up and slightly together at the top.',
        ],
    },
    {
        exerciseId: 'ex-008', name: 'Bent-Over Row',
        targetMuscles: ['lats', 'upper back'], secondaryMuscles: ['biceps', 'spine'],
        bodyParts: ['back'], equipments: ['barbell'],
        instructions: [
            'Hinge forward to about 45 degrees with a flat back.',
            'Hold the bar at arms length below your hips.',
            'Pull the bar to your lower ribs while keeping elbows tucked.',
            'Lower with control to the start.',
        ],
    },
    {
        exerciseId: 'ex-009', name: 'Bicep Curl',
        targetMuscles: ['biceps'], secondaryMuscles: ['forearms'],
        bodyParts: ['upper arms'], equipments: ['dumbbell'],
        instructions: [
            'Stand with dumbbells at your sides, palms forward.',
            'Curl the dumbbells up by flexing the elbows.',
            'Squeeze the biceps at the top.',
            'Lower with a slow eccentric to full extension.',
        ],
    },
    {
        exerciseId: 'ex-010', name: 'Tricep Rope Pushdown',
        targetMuscles: ['triceps'], secondaryMuscles: [],
        bodyParts: ['upper arms'], equipments: ['cable'],
        instructions: [
            'Grip a rope attached to a high pulley.',
            'Tuck your elbows to your sides.',
            'Press down by extending the elbows and split the rope.',
            'Return slowly to the start position.',
        ],
    },
    {
        exerciseId: 'ex-011', name: 'Bulgarian Split Squat',
        targetMuscles: ['quads', 'glutes'], secondaryMuscles: ['hamstrings'],
        bodyParts: ['upper legs'], equipments: ['dumbbell'],
        instructions: [
            'Place rear foot on a bench, front foot 2-3 feet ahead.',
            'Descend straight down with a vertical torso.',
            'Front knee tracks over toes; back knee hovers above the floor.',
            'Drive through the front midfoot to stand.',
        ],
    },
    {
        exerciseId: 'ex-012', name: 'Hanging Leg Raise',
        targetMuscles: ['abs'], secondaryMuscles: ['hip flexors'],
        bodyParts: ['waist'], equipments: ['body weight'],
        instructions: [
            'Hang from a pull-up bar with extended arms.',
            'Brace your core and posteriorly tilt your pelvis.',
            'Raise your legs until they pass parallel to the floor.',
            'Lower with control without swinging.',
        ],
    },
    {
        exerciseId: 'ex-013', name: 'Lat Pulldown',
        targetMuscles: ['lats'], secondaryMuscles: ['biceps', 'upper back'],
        bodyParts: ['back'], equipments: ['cable'],
        instructions: [
            'Sit and grip a wide bar overhead.',
            'Pull your shoulder blades down and back.',
            'Drive the bar down to your upper chest.',
            'Slowly let the bar return overhead.',
        ],
    },
    {
        exerciseId: 'ex-014', name: 'Standing Calf Raise',
        targetMuscles: ['calves'], secondaryMuscles: [],
        bodyParts: ['lower legs'], equipments: ['machine'],
        instructions: [
            'Place balls of feet on the platform.',
            'Lower your heels below the platform.',
            'Press up onto your toes as high as you can.',
            'Hold the contraction for a count.',
        ],
    },
    {
        exerciseId: 'ex-015', name: 'Plank',
        targetMuscles: ['abs'], secondaryMuscles: ['delts', 'glutes'],
        bodyParts: ['waist'], equipments: ['body weight'],
        instructions: [
            'Set up on forearms with elbows under shoulders.',
            'Brace abs, glutes, and quads in a straight line.',
            'Hold without sagging hips or hiking them up.',
            'Breathe steadily for the prescribed time.',
        ],
    },
    {
        exerciseId: 'ex-016', name: 'Face Pull',
        targetMuscles: ['delts', 'upper back'], secondaryMuscles: ['traps'],
        bodyParts: ['shoulders'], equipments: ['cable'],
        instructions: [
            'Set a rope at face height on a cable machine.',
            'Pull the rope toward your face, splitting your hands.',
            'Externally rotate at the shoulder at the top.',
            'Return with control to a deep stretch.',
        ],
    },
];

export interface FixtureBlog {
    id: string;
    title: string;
    excerpt: string;
    content_paragraphs: string[];
    author: string;
    date: string;
    readTime: string;
    tags: string[];
}

export const BLOG_FIXTURES: FixtureBlog[] = [
    {
        id: 'the-science-of-hypertrophy',
        title: 'The Science of Hypertrophy',
        excerpt: 'Mechanical tension is the master driver of muscle growth. Here is what the latest research says about the dose-response curve.',
        content_paragraphs: [
            'Mechanical tension — the force your muscle generates while it lengthens or shortens under load — is the primary stimulus for growth. Recent meta-analyses converge on the idea that the highest-tension sets, performed within roughly five reps of failure, contribute the bulk of hypertrophic signaling.',
            'Volume still matters. Studies looking at sets-per-week consistently show a dose-response up to about 12-20 hard sets per muscle group per week, with diminishing returns afterward and sometimes regression past 30 sets.',
            'Load itself matters less than people think. Hypertrophy is comparable across 30% and 80% of 1RM as long as effort is matched. The take-home: pick a load you can grind out 5-30 reps with, get close to failure, and recover hard.',
        ],
        author: 'Mira Chen',
        date: 'March 5, 2026',
        readTime: '6 min read',
        tags: ['Hypertrophy', 'Training Science', 'Muscle'],
    },
    {
        id: 'minimal-effective-dose',
        title: 'Minimal Effective Dose: Train Less, Grow More',
        excerpt: 'You probably do not need 25 sets a week to make progress. Here is the case for the smallest dose that works.',
        content_paragraphs: [
            'For lifters with limited time, the minimum effective dose is closer to 4-8 hard sets per muscle group per week. That is enough to maintain strength and squeeze out modest hypertrophy.',
            'The trick is intensity. Each of those sets needs to be within one or two reps of failure. Half-effort sets at low volume produce zero adaptation.',
            'A 30-minute session built around two compound lifts, taken close to failure, beats a 90-minute aimless workout most weeks of the year. Treat extra volume as a drug — only escalate it when results stop coming.',
        ],
        author: 'Jules Park',
        date: 'February 21, 2026',
        readTime: '4 min read',
        tags: ['Programming', 'Recovery'],
    },
    {
        id: 'sleep-and-recovery',
        title: 'Sleep Is Your Cheapest Performance Drug',
        excerpt: 'Two extra hours per night might do more for your bench press than another supplement.',
        content_paragraphs: [
            'Acute sleep restriction (5 hours per night for 5 nights) drops total testosterone roughly 10-15% in healthy young men. The effect on training quality is even larger because reaction time and motor pattern execution degrade quickly.',
            'Aim for a sleep window — same bedtime, same wake time, every day, including weekends. Light exposure in the first hour after waking and dim light in the last hour before bed dramatically improves sleep onset latency.',
            'If you can only fix one variable in your program, fix sleep first. It moves recovery, mood, hunger regulation, and force output simultaneously.',
        ],
        author: 'Dr. Anna Volkova',
        date: 'February 10, 2026',
        readTime: '5 min read',
        tags: ['Recovery', 'Sleep', 'Health'],
    },
    {
        id: 'protein-distribution',
        title: 'Why You Should Spread Your Protein Across the Day',
        excerpt: 'Hitting your daily protein target is not enough. Distribution matters more than most lifters realize.',
        content_paragraphs: [
            'Muscle protein synthesis (MPS) responds in pulses. Each meal of 30-40g protein triggers a roughly 3-hour MPS spike before returning to baseline.',
            'Lifters who hit their daily target in 1-2 large meals leave a lot of MPS opportunity on the table. Spreading the same amount across 4-5 meals can yield 25% more cumulative MPS over 24 hours.',
            'A practical rule of thumb: 0.4g protein per kg bodyweight per meal, four times a day. Use lean meat, dairy, eggs, or whey to hit it cheaply.',
        ],
        author: 'Mira Chen',
        date: 'January 28, 2026',
        readTime: '5 min read',
        tags: ['Nutrition', 'Protein'],
    },
    {
        id: 'mobility-isnt-stretching',
        title: 'Mobility Is Not Stretching',
        excerpt: 'Static stretching builds passive range. To actually use it under load, you need active mobility work.',
        content_paragraphs: [
            'Sitting in a deep splits position for 60 seconds builds passive flexibility. It does very little for the active range you can express under a barbell.',
            'Tempo work, isometric end-range holds, and weighted stretches are the meat-and-potatoes of mobility for lifters. They train your nervous system to recruit muscle in the new range.',
            'Spend ten minutes warming up the joints you are going to stress that day, focusing on slow controlled movements rather than ballistic stretches.',
        ],
        author: 'Eli Rodriguez',
        date: 'January 14, 2026',
        readTime: '4 min read',
        tags: ['Mobility', 'Warm-up'],
    },
    {
        id: 'rpe-vs-percentage',
        title: 'RPE vs Percentage Programming',
        excerpt: 'Your 1RM today might be ten kilos different from yesterday. Auto-regulation is how you keep training honest.',
        content_paragraphs: [
            'Percentage-based programming assumes a stable 1RM. In reality, that number swings 5-15% based on sleep, stress, hydration, and the previous week of training.',
            'RPE (Rating of Perceived Exertion) lets you scale load to today is readiness. Hitting "RPE 8 for 5 reps" means you finish the set with 2 reps in reserve, no matter what the scale says.',
            'A hybrid approach works for most lifters: percentage for the warm-up ramp, RPE-capped top sets, and back-off sets at fixed RPE for volume.',
        ],
        author: 'Jules Park',
        date: 'December 30, 2025',
        readTime: '6 min read',
        tags: ['Programming', 'Strength'],
    },
];

export interface FixturePlan {
    _id: string;
    name: string;
    price: number;
    features: string[];
    durationInDays: number;
}

export const PLAN_FIXTURES: FixturePlan[] = [
    {
        _id: 'plan-free',
        name: 'Free Tier',
        price: 0,
        durationInDays: 36500,
        features: [
            'Unlimited workouts',
            'Exercise library access',
            'Calorie & macro calculators',
            'Daily AI blog feed',
        ],
    },
    {
        _id: 'plan-premium',
        name: 'Premium',
        price: 9.99,
        durationInDays: 30,
        features: [
            'AI Coach safety analysis',
            'Per-exercise personalized warnings',
            'Body-map muscle volume planogram',
            'Priority Gemini analysis queue',
            'Cancel anytime',
        ],
    },
];
