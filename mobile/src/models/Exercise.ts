export interface ExerciseData {
    exerciseId?: string;
    id?: string;
    name: string;
    target?: string;
    targetMuscles?: string[];
    secondaryMuscles?: string[];
    bodyPart?: string;
    bodyParts?: string[];
    equipment?: string;
    equipments?: string[];
    gifUrl?: string;
    instructions?: string[];
}

export class Exercise {
    public readonly id: string;
    public readonly name: string;
    public readonly targetMuscles: string[];
    public readonly secondaryMuscles: string[];
    public readonly bodyParts: string[];
    public readonly equipments: string[];
    public readonly gifUrl?: string;
    public readonly instructions: string[];

    constructor(data: ExerciseData) {
        this.id = (data.exerciseId ?? data.id ?? '').toString();
        this.name = data.name ?? 'Untitled exercise';
        this.targetMuscles = data.targetMuscles ?? (data.target ? [data.target] : []);
        this.secondaryMuscles = data.secondaryMuscles ?? [];
        this.bodyParts = data.bodyParts ?? (data.bodyPart ? [data.bodyPart] : []);
        this.equipments = data.equipments ?? (data.equipment ? [data.equipment] : []);
        this.gifUrl = data.gifUrl;
        this.instructions = (data.instructions ?? []).map((step) => Exercise.cleanStep(step));
    }

    private static cleanStep(text: string): string {
        return text.replace(/^Step:\s*\d+\s*/i, '').trim();
    }

    get primaryTarget(): string {
        return this.targetMuscles[0] ?? this.bodyParts[0] ?? 'Full body';
    }

    get equipmentLabel(): string {
        return this.equipments[0] ?? 'Bodyweight';
    }

    static fromJson(json: any): Exercise {
        return new Exercise(json as ExerciseData);
    }

    static fromArray(json: any[]): Exercise[] {
        const seen = new Set<string>();
        const result: Exercise[] = [];
        for (const j of json ?? []) {
            const ex = Exercise.fromJson(j);
            if (!ex.id || seen.has(ex.id)) continue;
            seen.add(ex.id);
            result.push(ex);
        }
        return result;
    }
}
