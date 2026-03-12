import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Workout } from './schemas/workout.schema';
import { User } from '../users/schemas/user.schema';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { ExercisesService } from '../exercises/exercises.service';

@Injectable()
export class WorkoutsService {
    private genAI: GoogleGenerativeAI;

    constructor(
        @InjectModel(Workout.name) private workoutModel: Model<Workout>,
        @InjectModel(User.name) private userModel: Model<User>,
        private exercisesService: ExercisesService
    ) {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyB2zSX1K7rLNZmtbUt2JXMuWJKqI2T5imM");
    }

    async create(userId: string, createWorkoutDto: any): Promise<Workout> {
        const createdWorkout = new this.workoutModel({
            ...createWorkoutDto,
            user: userId,
        });
        return createdWorkout.save();
    }

    async findAllForUser(userId: string): Promise<Workout[]> {
        return this.workoutModel.find({ user: userId }).exec();
    }

    async findAllPublic(searchQuery?: string, authorId?: string): Promise<Workout[]> {
        const query: any = {};

        if (authorId) {
            query.user = authorId;
        }

        if (searchQuery) {
            query.name = { $regex: searchQuery, $options: 'i' };
        }

        return this.workoutModel
            .find(query)
            .populate('user', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .exec();
    }

    async findOne(userId: string, id: string): Promise<Workout> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid Workout ID format');
        }
        const workout = await this.workoutModel.findOne({ _id: id, user: userId }).exec();
        if (!workout) {
            throw new NotFoundException(`Workout #${id} not found`);
        }
        return workout;
    }

    async update(userId: string, id: string, updateWorkoutDto: any): Promise<Workout> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid Workout ID format');
        }
        const existingWorkout = await this.workoutModel.findOneAndUpdate(
            { _id: id, user: userId },
            updateWorkoutDto,
            { new: true }
        ).exec();
        if (!existingWorkout) {
            throw new NotFoundException(`Workout #${id} not found`);
        }
        return existingWorkout;
    }

    async addExerciseToWorkout(userId: string, workoutId: string, exerciseId: string): Promise<Workout> {
        if (!Types.ObjectId.isValid(workoutId)) {
            throw new BadRequestException('Invalid Workout ID format');
        }

        const newExerciseItem = {
            exerciseId,
            sets: 3,
            reps: 10,
            weight: 0
        };

        const updatedWorkout = await this.workoutModel.findOneAndUpdate(
            { _id: workoutId, user: userId },
            { $push: { exercises: newExerciseItem } },
            { new: true }
        ).exec();

        if (!updatedWorkout) {
            throw new NotFoundException(`Workout #${workoutId} not found or you do not have permission to modify it`);
        }

        return updatedWorkout;
    }

    async updateExerciseInWorkout(userId: string, workoutId: string, exerciseObjId: string, updateData: { sets?: number; reps?: number; weight?: number; }): Promise<Workout> {
        if (!Types.ObjectId.isValid(workoutId) || !Types.ObjectId.isValid(exerciseObjId)) {
            throw new BadRequestException('Invalid ID format');
        }

        const updateFields: any = {};
        if (updateData.sets !== undefined) updateFields['exercises.$.sets'] = updateData.sets;
        if (updateData.reps !== undefined) updateFields['exercises.$.reps'] = updateData.reps;
        if (updateData.weight !== undefined) updateFields['exercises.$.weight'] = updateData.weight;

        const updatedWorkout = await this.workoutModel.findOneAndUpdate(
            { _id: workoutId, user: userId, 'exercises._id': exerciseObjId },
            { $set: updateFields },
            { new: true }
        ).exec();

        if (!updatedWorkout) {
            throw new NotFoundException(`Workout #${workoutId} or specific exercise not found, or you lack permission to modify it`);
        }

        return updatedWorkout;
    }

    async remove(userId: string, id: string): Promise<Workout> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid Workout ID format');
        }
        const workout = await this.workoutModel.findOneAndDelete({ _id: id, user: userId }).exec();
        if (!workout) {
            throw new NotFoundException(`Workout #${id} not found`);
        }
        return workout;
    }

    async getAiRecommendation(userId: string, workoutId: string) {
        if (!Types.ObjectId.isValid(workoutId)) {
            throw new BadRequestException('Invalid Workout ID format');
        }

        const user = await this.userModel.findById(userId).exec();
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const workout = await this.workoutModel.findOne({ _id: workoutId, user: userId }).exec();
        if (!workout) {
            throw new NotFoundException(`Workout #${workoutId} not found`);
        }

        // Prepare context strings
        const profile = user.profile || {};
        const weightStr = profile.weight ? `${profile.weight} kg` : 'unknown';
        const heightStr = profile.height ? `${profile.height} cm` : 'unknown';
        const illnessStr = profile.illnesses || 'None reported';
        const goalsStr = profile.fitnessGoals || 'General fitness';

        const exercisePromises = workout.exercises.map(async (ex) => {
            try {
                const exDetails = await this.exercisesService.getExerciseById(ex.exerciseId as string);
                const name = exDetails?.name || 'Unknown Exercise';
                return `- ${ex.exerciseId} | ${name}: ${ex.sets} sets x ${ex.reps} reps @ ${ex.weight}kg`;
            } catch (err) {
                return `- ${ex.exerciseId} | Unknown Exercise: ${ex.sets} sets x ${ex.reps} reps @ ${ex.weight}kg`;
            }
        });

        const resolvedExercises = await Promise.all(exercisePromises);
        const exerciseListStr = resolvedExercises.join('\n');

        const prompt = `
            Act as an expert physiotherapist and personal trainer. Evaluate the safety and effectiveness of the following workout plan against the user's specific health profile.
            
            USER PROFILE:
            - Weight: ${weightStr}
            - Height: ${heightStr}
            - Illnesses/Injuries: ${illnessStr}
            - Primary Goals: ${goalsStr}

            WORKOUT ("${workout.name}"):
            ${exerciseListStr || 'No exercises added yet.'}

            Analyze this and provide a strict JSON response outlining whether the overall routine is safe, any warnings, positive feedback, general advice, AND a specific safety status for EACH exercise ID provided. If they mentioned injuries, aggressively warn them if exercises aggravate that injury (e.g. deadlifts for lower back pain, heavy squats for bad knees).
        `;

        try {
            const model = this.genAI.getGenerativeModel({
                model: "gemini-2.5-flash",
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: SchemaType.OBJECT,
                        properties: {
                            isSafe: { type: SchemaType.BOOLEAN, description: "True if generally safe, False if heavily contraindicated by their illnesses" },
                            warnings: {
                                type: SchemaType.ARRAY,
                                items: { type: SchemaType.STRING },
                                description: "Specific warnings about exercise selection correlated to their illnesses or goals"
                            },
                            positiveFeedback: {
                                type: SchemaType.ARRAY,
                                items: { type: SchemaType.STRING },
                                description: "What they are doing right with this workout"
                            },
                            generalAdvice: { type: SchemaType.STRING, description: "A highly personalized 2-sentence summary/recommendation." },
                            exerciseAssessments: {
                                type: SchemaType.ARRAY,
                                items: {
                                    type: SchemaType.OBJECT,
                                    properties: {
                                        exerciseId: { type: SchemaType.STRING, description: "The exact ID string of the exercise from the prompt" },
                                        status: { type: SchemaType.STRING, description: "Must be exactly one of: 'Recommended', 'Not Recommended', 'Consult Doctor', 'Neutral'" },
                                        reason: { type: SchemaType.STRING, description: "Brief 1-sentence reason for this specific recommendation based on their profile" }
                                    },
                                    required: ["exerciseId", "status", "reason"]
                                },
                                description: "An assessment array containing an evaluation for EVERY SINGLE exercise ID provided in the WORKOUT list."
                            }
                        },
                        required: ["isSafe", "warnings", "positiveFeedback", "generalAdvice", "exerciseAssessments"]
                    }
                }
            });

            const result = await model.generateContent(prompt);
            const rawJsonStr = result.response.text();
            console.log("=== GEMINI RAW JSON OUTPUT ===");
            console.log(rawJsonStr);
            console.log("==============================");
            return JSON.parse(rawJsonStr);
        } catch (error) {
            console.error("Gemini AI Workout Recommendation Error:", error);

            // Graceful fallback for API limits
            if (error?.status === 429 || error?.message?.includes('429')) {
                return {
                    isSafe: true,
                    warnings: ["We are currently experiencing high demand and our AI coach is taking a breather. Please try again in about 30 seconds."],
                    positiveFeedback: ["Your workout is saved and ready!"],
                    generalAdvice: "Gemini AI is currently handling too many requests. Please wait a moment and refresh for your full safety analysis.",
                    exerciseAssessments: []
                };
            }

            throw new InternalServerErrorException('Failed to generate AI workout analysis.');
        }
    }
}
