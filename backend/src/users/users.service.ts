import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) { }

    async create(createUserDto: any): Promise<User> {
        const createdUser = new this.userModel(createUserDto);
        return createdUser.save();
    }

    async findOneByEmail(email: string): Promise<User | null> {
        return this.userModel.findOne({ email }).exec();
    }

    async findById(id: string): Promise<User | null> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid User ID format');
        }
        return this.userModel.findById(id).exec();
    }

    async findAll(): Promise<User[]> {
        return this.userModel.find().exec();
    }

    async update(id: string, updateUserDto: any): Promise<User | null> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid User ID format');
        }
        return this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true }).exec();
    }

    async remove(id: string): Promise<User | null> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid User ID format');
        }
        return this.userModel.findByIdAndDelete(id).exec();
    }
}
