import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ExercisesService } from './exercises.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('exercises')
@UseGuards(JwtAuthGuard)
export class ExercisesController {
    constructor(private readonly exercisesService: ExercisesService) { }

    @Get('target/:target')
    async getByTarget(@Param('target') target: string) {
        return this.exercisesService.getExercisesByTarget(target);
    }

    @Get('equipment/:equipment')
    async getByEquipment(@Param('equipment') equipment: string) {
        return this.exercisesService.getExercisesByEquipment(equipment);
    }
}
