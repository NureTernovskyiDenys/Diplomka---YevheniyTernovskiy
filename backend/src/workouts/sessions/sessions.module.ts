import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { WorkoutSession, WorkoutSessionSchema } from './schemas/workout-session.schema';
import { Workout, WorkoutSchema } from '../schemas/workout.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WorkoutSession.name, schema: WorkoutSessionSchema },
      { name: Workout.name, schema: WorkoutSchema }
    ])
  ],
  providers: [SessionsService],
  controllers: [SessionsController]
})
export class SessionsModule { }
