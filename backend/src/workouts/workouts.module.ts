import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkoutsService } from './workouts.service';
import { WorkoutsController } from './workouts.controller';
import { Workout, WorkoutSchema } from './schemas/workout.schema';
import { User, UserSchema } from '../users/schemas/user.schema';

import { ExercisesModule } from '../exercises/exercises.module';
import { SessionsModule } from './sessions/sessions.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Workout.name, schema: WorkoutSchema },
            { name: User.name, schema: UserSchema }
        ]),
        ExercisesModule,
        SessionsModule
    ],
    controllers: [WorkoutsController],
    providers: [WorkoutsService],
    exports: [WorkoutsService]
})
export class WorkoutsModule { }
