import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Workout } from './schemas/workout.schema';

@Injectable()
export class WorkoutsService {
    constructor(@InjectModel(Workout.name) private workoutModel: Model<Workout>) { }

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
}
