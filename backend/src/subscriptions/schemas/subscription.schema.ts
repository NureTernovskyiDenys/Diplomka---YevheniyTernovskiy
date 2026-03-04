import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Subscription extends Document {
    @Prop({ required: true, unique: true })
    name: string; // e.g., 'Basic', 'Premium'

    @Prop({ required: true })
    price: number;

    @Prop({ type: [String], required: true })
    features: string[];

    @Prop({ required: true })
    durationInDays: number;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
