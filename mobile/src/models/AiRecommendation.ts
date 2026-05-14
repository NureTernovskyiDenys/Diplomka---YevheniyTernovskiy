export type ExerciseStatus = 'Recommended' | 'Not Recommended' | 'Consult Doctor' | 'Neutral';

export interface ExerciseAssessmentData {
    exerciseId: string;
    status: ExerciseStatus;
    reason: string;
}

export interface AiRecommendationData {
    isSafe: boolean;
    warnings: string[];
    positiveFeedback: string[];
    generalAdvice: string;
    exerciseAssessments: ExerciseAssessmentData[];
}

export class AiRecommendation {
    public readonly isSafe: boolean;
    public readonly warnings: string[];
    public readonly positives: string[];
    public readonly generalAdvice: string;
    public readonly exerciseAssessments: ExerciseAssessmentData[];

    constructor(data: AiRecommendationData) {
        this.isSafe = data.isSafe;
        this.warnings = data.warnings ?? [];
        this.positives = data.positiveFeedback ?? [];
        this.generalAdvice = data.generalAdvice ?? '';
        this.exerciseAssessments = data.exerciseAssessments ?? [];
    }

    statusFor(exerciseId: string): ExerciseStatus | null {
        return this.exerciseAssessments.find((a) => a.exerciseId === exerciseId)?.status ?? null;
    }

    static fromJson(json: any): AiRecommendation {
        return new AiRecommendation(json as AiRecommendationData);
    }
}
