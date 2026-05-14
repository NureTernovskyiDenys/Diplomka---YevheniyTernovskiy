export interface WorkoutExerciseData {
    _id?: string;
    exerciseId: string;
    sets: number;
    reps: number;
    weight: number;
}

export interface WorkoutAuthorRef {
    _id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
}

export interface WorkoutData {
    _id: string;
    name: string;
    user: string | WorkoutAuthorRef;
    exercises: WorkoutExerciseData[];
    createdAt?: string;
    updatedAt?: string;
}

export class WorkoutExercise {
    constructor(public data: WorkoutExerciseData) { }

    get id(): string | undefined {
        return this.data._id;
    }
    get exerciseId(): string {
        return this.data.exerciseId;
    }
    get sets(): number {
        return this.data.sets;
    }
    get reps(): number {
        return this.data.reps;
    }
    get weight(): number {
        return this.data.weight;
    }
    get totalVolume(): number {
        return this.sets * this.reps * this.weight;
    }
}

export class Workout {
    public readonly id: string;
    public name: string;
    public exercises: WorkoutExercise[];
    public readonly userRef: string | WorkoutAuthorRef;
    public readonly createdAt?: Date;

    constructor(data: WorkoutData) {
        this.id = data._id;
        this.name = data.name;
        this.exercises = (data.exercises ?? []).map((e) => new WorkoutExercise(e));
        this.userRef = data.user;
        this.createdAt = data.createdAt ? new Date(data.createdAt) : undefined;
    }

    get exerciseCount(): number {
        return this.exercises.length;
    }

    get authorName(): string {
        const ref = this.userRef as WorkoutAuthorRef;
        if (typeof this.userRef === 'string' || !ref) return 'You';
        const first = ref.firstName ?? '';
        const last = ref.lastName ?? '';
        return `${first} ${last}`.trim() || ref.email || 'Anonymous';
    }

    get authorId(): string | undefined {
        if (typeof this.userRef === 'string') return this.userRef;
        return (this.userRef as WorkoutAuthorRef)?._id;
    }

    get totalVolume(): number {
        return this.exercises.reduce((sum, e) => sum + e.totalVolume, 0);
    }

    isOwnedBy(userId: string | undefined | null): boolean {
        if (!userId) return false;
        return this.authorId === userId;
    }

    static fromJson(json: any): Workout {
        return new Workout(json as WorkoutData);
    }

    static fromArray(json: any[]): Workout[] {
        return (json ?? []).map((j) => Workout.fromJson(j));
    }
}
