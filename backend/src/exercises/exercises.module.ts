import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ExercisesService } from './exercises.service';
import { ExercisesController } from './exercises.controller';

@Module({
    imports: [HttpModule],
    controllers: [ExercisesController],
    providers: [ExercisesService],
})
export class ExercisesModule { }
