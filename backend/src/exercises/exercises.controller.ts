import { Controller, Get, Param, Query } from '@nestjs/common';
import { ExercisesService } from './exercises.service';

@Controller('exercises')
export class ExercisesController {
    constructor(private readonly exercisesService: ExercisesService) { }

    @Get('filter')
    async getFiltered(
        @Query('muscles') muscles?: string,
        @Query('equipment') equipment?: string,
    ) {
        return this.exercisesService.getExercisesByFilter(muscles, equipment);
    }

    @Get('search')
    async searchExercises(
        @Query('q') q: string,
        @Query('offset') offset?: number,
        @Query('limit') limit?: number,
    ) {
        return this.exercisesService.searchExercises(q, offset, limit);
    }

    @Get('muscles')
    async getMuscles() {
        return this.exercisesService.getMuscles();
    }

    @Get('bodyparts')
    async getBodyParts() {
        return this.exercisesService.getBodyParts();
    }

    @Get('equipments')
    async getEquipments() {
        return this.exercisesService.getEquipments();
    }

    @Get()
    async getAllExercises(
        @Query('offset') offset?: number,
        @Query('limit') limit?: number,
    ) {
        return this.exercisesService.getAllExercises(offset, limit);
    }

    @Get('target/:target')
    async getByTarget(@Param('target') target: string) {
        return this.exercisesService.getExercisesByTarget(target);
    }

    @Get('equipment/:equipment')
    async getByEquipment(@Param('equipment') equipment: string) {
        return this.exercisesService.getExercisesByEquipment(equipment);
    }

    @Get(':id')
    async getExerciseById(@Param('id') id: string) {
        return this.exercisesService.getExerciseById(id);
    }
}
