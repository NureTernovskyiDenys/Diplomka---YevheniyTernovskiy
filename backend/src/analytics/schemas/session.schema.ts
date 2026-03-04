import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Session extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Workout', required: true })
    workout: Types.ObjectId;

    @Prop({ required: true })
    durationInMinutes: number;

    @Prop({ required: true })
    caloriesBurned: number;

    @Prop({ required: true })
    totalVolume: number; // calculated roughly as (sets * reps * weight)
}

export const SessionSchema = SchemaFactory.createForClass(Session);
