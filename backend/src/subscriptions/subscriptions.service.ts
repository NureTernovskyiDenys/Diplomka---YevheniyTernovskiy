import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Subscription } from './schemas/subscription.schema';
import { UsersService } from '../users/users.service';

@Injectable()
export class SubscriptionsService {
    constructor(
        @InjectModel(Subscription.name) private subscriptionModel: Model<Subscription>,
        private usersService: UsersService,
    ) { }

    async create(createSubscriptionDto: any): Promise<Subscription> {
        const createdSubscription = new this.subscriptionModel(createSubscriptionDto);
        return createdSubscription.save();
    }

    async findAll(): Promise<Subscription[]> {
        return this.subscriptionModel.find().exec();
    }

    async findOne(id: string): Promise<Subscription> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid Subscription ID format');
        }
        const subscription = await this.subscriptionModel.findById(id).exec();
        if (!subscription) {
            throw new NotFoundException(`Subscription #${id} not found`);
        }
        return subscription;
    }

    async update(id: string, updateSubscriptionDto: any): Promise<Subscription> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid Subscription ID format');
        }
        const existingSubscription = await this.subscriptionModel.findByIdAndUpdate(id, updateSubscriptionDto, { new: true }).exec();
        if (!existingSubscription) {
            throw new NotFoundException(`Subscription #${id} not found`);
        }
        return existingSubscription;
    }

    async remove(id: string): Promise<Subscription> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid Subscription ID format');
        }
        const subscription = await this.subscriptionModel.findByIdAndDelete(id).exec();
        if (!subscription) {
            throw new NotFoundException(`Subscription #${id} not found`);
        }
        return subscription;
    }

    async subscribeUserToPlan(userId: string, planId: string): Promise<any> {
        const plan = await this.findOne(planId);

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + plan.durationInDays);

        const updatedUser = await this.usersService.update(userId, {
            subscription: {
                planId: plan._id,
                active: true,
                expiresAt: expiresAt,
            }
        });

        return {
            message: `Successfully subscribed to ${plan.name}`,
            user: updatedUser
        };
    }
}
