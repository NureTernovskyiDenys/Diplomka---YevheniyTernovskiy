export interface SetLog {
    weight: number;
    reps: number;
    completedAt?: string;
    rpe?: number;
}

export interface ExerciseLog {
    exerciseId: string;
    sets: SetLog[];
}

export interface WorkoutSessionData {
    _id: string;
    // Backend uses different naming (workout/user/startTime/endTime/totalDuration).
    // We map both during fromJson to keep callers happy.
    workoutId: string;
    userId: string;
    startedAt: string;
    finishedAt?: string;
    durationSec?: number;
    exercises: ExerciseLog[];
}

export class WorkoutSession {
    constructor(public data: WorkoutSessionData) { }

    get id() { return this.data._id; }
    get workoutId() { return this.data.workoutId; }
    get exercises() { return this.data.exercises; }
    get totalVolume(): number {
        return this.data.exercises.reduce((sum, ex) =>
            sum + ex.sets.reduce((s, set) => s + set.weight * set.reps, 0), 0);
    }

    static fromJson(j: any): WorkoutSession {
        // Normalize backend response shape → mobile shape.
        const normalized: WorkoutSessionData = {
            _id: j._id ?? j.id,
            workoutId: typeof j.workout === 'string' ? j.workout : (j.workout?._id ?? j.workoutId),
            userId: typeof j.user === 'string' ? j.user : (j.user?._id ?? j.userId),
            startedAt: j.startTime ?? j.startedAt,
            finishedAt: j.endTime ?? j.finishedAt,
            durationSec: j.totalDuration ?? j.durationSec,
            exercises: (j.exercises ?? []).map((ex: any) => ({
                exerciseId: ex.exerciseId,
                sets: (ex.sets ?? []).map((s: any) => ({
                    weight: s.weight,
                    reps: s.reps,
                    completedAt: s.completedAt,
                    rpe: s.rpe,
                })),
            })),
        };
        return new WorkoutSession(normalized);
    }

    static fromArray(arr: any[]): WorkoutSession[] { return (arr ?? []).map(WorkoutSession.fromJson); }
}