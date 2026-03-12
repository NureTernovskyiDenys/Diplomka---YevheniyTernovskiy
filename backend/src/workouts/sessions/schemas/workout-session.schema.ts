import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class SessionSet {
    @Prop({ required: true })
    reps: number;

    @Prop({ required: true })
    weight: number;

    @Prop({ required: true })
    duration: number; // Duration of the set in seconds
}
export const SessionSetSchema = SchemaFactory.createForClass(SessionSet);

@Schema()
export class SessionExercise {
    @Prop({ required: true })
    exerciseId: string; // From ExerciseDB

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    target: string; // Muscle group

    @Prop({ type: [SessionSetSchema], default: [] })
    sets: SessionSet[];
}
export const SessionExerciseSchema = SchemaFactory.createForClass(SessionExercise);

@Schema({ timestamps: true })
export class WorkoutSession extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Workout', required: true })
    workout: Types.ObjectId;

    @Prop({ required: true })
    startTime: Date;

    @Prop()
    endTime?: Date;

    @Prop({ default: 0 })
    totalDuration: number; // Total seconds from start to finish

    @Prop({ default: 0 })
    totalVolume: number; // Weight * Reps accumulated

    @Prop({ type: [SessionExerciseSchema], default: [] })
    exercises: SessionExercise[];

    @Prop({ default: 'in_progress' })
    status: 'in_progress' | 'completed' | 'abandoned';
}

export const WorkoutSessionSchema = SchemaFactory.createForClass(WorkoutSession);
