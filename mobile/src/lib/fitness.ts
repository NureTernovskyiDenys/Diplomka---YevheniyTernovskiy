import { Gender } from '../models/User';

export type ActivityLevel = 'Sedentary' | 'Lightly Active' | 'Moderately Active' | 'Very Active' | 'Extra Active';
export type Goal = 'Cut' | 'Maintain' | 'Bulk';

const ACTIVITY_MULTIPLIER: Record<ActivityLevel, number> = {
    'Sedentary': 1.2,
    'Lightly Active': 1.375,
    'Moderately Active': 1.55,
    'Very Active': 1.725,
    'Extra Active': 1.9,
};

export interface CalorieResult {
    bmr: number;
    tdee: number;
    targetCalories: number;
    macros: { protein: number; carbs: number; fat: number };
}

/**
 * Mifflin-St Jeor BMR + TDEE + macro split. Pure function — easy to test.
 */
export class CalorieCalculator {
    static compute(
        weightKg: number,
        heightCm: number,
        ageYears: number,
        gender: Gender,
        activity: ActivityLevel,
        goal: Goal,
    ): CalorieResult {
        const bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * ageYears) + (gender === 'Male' ? 5 : -161);
        const tdee = Math.round(bmr * ACTIVITY_MULTIPLIER[activity]);
        let target = tdee;
        if (goal === 'Cut') target -= 500;
        if (goal === 'Bulk') target += 300;

        const proteinG = Math.round(weightKg * 2.2);
        const fatG = Math.round(weightKg * 1);
        const proteinCal = proteinG * 4;
        const fatCal = fatG * 9;
        const carbCal = Math.max(0, target - proteinCal - fatCal);
        const carbsG = Math.round(carbCal / 4);

        return {
            bmr: Math.round(bmr),
            tdee,
            targetCalories: target,
            macros: { protein: proteinG, carbs: carbsG, fat: fatG },
        };
    }
}

export interface OneRepMaxResult {
    epley: number;
    brzycki: number;
    average: number;
}

export class OneRepMaxCalculator {
    static compute(weight: number, reps: number): OneRepMaxResult | null {
        if (!weight || !reps || weight <= 0 || reps <= 0) return null;
        if (reps === 1) return { epley: weight, brzycki: weight, average: weight };
        const epley = weight * (1 + 0.0333 * reps);
        const brzycki = weight * (36 / (37 - reps));
        const average = reps < 10 ? (epley + brzycki) / 2 : epley;
        return {
            epley: Math.round(epley * 10) / 10,
            brzycki: Math.round(brzycki * 10) / 10,
            average: Math.round(average * 10) / 10,
        };
    }

    static zones(max: number): { pct: number; reps: number; label: string; weight: number }[] {
        const tiers = [
            { pct: 100, reps: 1, label: 'Absolute Max' },
            { pct: 95, reps: 2, label: 'Heavy Double' },
            { pct: 90, reps: 4, label: 'Strength' },
            { pct: 85, reps: 6, label: 'Power/Hypertrophy' },
            { pct: 80, reps: 8, label: 'Hypertrophy' },
            { pct: 75, reps: 10, label: 'Volume' },
            { pct: 70, reps: 12, label: 'Endurance' },
        ];
        return tiers.map((t) => ({ ...t, weight: Math.round((max * t.pct / 100) * 10) / 10 }));
    }
}

export interface MacroPreset {
    name: string;
    description: string;
    carbs: number;
    protein: number;
    fat: number;
}

export const MACRO_PRESETS: MacroPreset[] = [
    { name: 'Balanced', description: 'Standard healthy split', carbs: 50, protein: 20, fat: 30 },
    { name: 'Bodybuilder', description: 'High protein for growth', carbs: 40, protein: 40, fat: 20 },
    { name: 'Keto', description: 'Fat-adapted state', carbs: 5, protein: 25, fat: 70 },
    { name: 'Zone Diet', description: 'Steady hormone levels', carbs: 40, protein: 30, fat: 30 },
    { name: 'Low Fat', description: 'Volume-eating friendly', carbs: 55, protein: 25, fat: 20 },
];

export class MacroSplitter {
    static gramsFor(targetCalories: number, preset: MacroPreset) {
        return {
            protein: Math.round((targetCalories * preset.protein / 100) / 4),
            carbs: Math.round((targetCalories * preset.carbs / 100) / 4),
            fat: Math.round((targetCalories * preset.fat / 100) / 9),
        };
    }
}
