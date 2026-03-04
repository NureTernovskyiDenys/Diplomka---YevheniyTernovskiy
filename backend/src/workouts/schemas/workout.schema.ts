import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class ExerciseItem {
    @Prop({ required: true })
    exerciseId: string; // Refers to ID from ExerciseDB

    @Prop({ required: true })
    sets: number;

    @Prop({ required: true })
    reps: number;

    @Prop({ required: true })
    weight: number;
}
export const ExerciseItemSchema = SchemaFactory.createForClass(ExerciseItem);

@Schema({ timestamps: true })
export class Workout extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user: Types.ObjectId;

    @Prop({ required: true })
    name: string;

    @Prop({ type: [ExerciseItemSchema], default: [] })
    exercises: ExerciseItem[];
}
export const WorkoutSchema = SchemaFactory.createForClass(Workout);
