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

  @Prop({
    type: {
      weight: { type: Number }, // in kg or lbs
      height: { type: Number }, // in cm or inches
      age: { type: Number },
      gender: { type: String, enum: ['Male', 'Female'] },
      illnesses: { type: String }, // e.g., "Asthma, lower back pain"
      fitnessGoals: { type: String }, // e.g., "Lose weight, build muscle"
      tdee: { type: Number },
      targetCalories: { type: Number },
      targetProtein: { type: Number },
      targetCarbs: { type: Number },
      targetFat: { type: Number },
      macroDietName: { type: String }, // e.g. "Keto", "Balanced"
      activityLevel: { type: String },
      weeklyWorkoutDays: { type: Number },
      sessionDuration: { type: String },
      goalsList: [{ type: String }],
      experienceLevel: { type: String },
      onboardingComplete: { type: Boolean, default: false },
    },
    default: {},
  })
  profile: {
    weight?: number;
    height?: number;
    age?: number;
    gender?: 'Male' | 'Female';
    illnesses?: string;
    fitnessGoals?: string;
    tdee?: number;
    targetCalories?: number;
    targetProtein?: number;
    targetCarbs?: number;
    targetFat?: number;
    macroDietName?: string;
    activityLevel?: string;
    weeklyWorkoutDays?: number;
    sessionDuration?: string;
    goalsList?: string[];
    experienceLevel?: string;
    onboardingComplete?: boolean;
  };
}

export const UserSchema = SchemaFactory.createForClass(User);
