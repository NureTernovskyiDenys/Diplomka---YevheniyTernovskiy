import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum Role {
    USER = 'user',
    ADMIN = 'admin',
}

@Schema({ timestamps: true })
export class User extends Document {
    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    passwordHash: string;

    @Prop({ required: true })
    firstName: string;

    @Prop({ required: true })
    lastName: string;

    @Prop({ type: String, enum: Role, default: Role.USER })
    role: Role;

    @Prop({
        type: {
            planId: { type: String, ref: 'Subscription' },
            active: { type: Boolean, default: false },
            expiresAt: { type: Date },
        },
        default: null,
    })
    subscription: {
        planId: string;
        active: boolean;
        expiresAt: Date;
    };
}

export const UserSchema = SchemaFactory.createForClass(User);
