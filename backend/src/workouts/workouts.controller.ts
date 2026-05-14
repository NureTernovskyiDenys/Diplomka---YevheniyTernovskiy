import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { WorkoutsService } from './workouts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('workouts')
@UseGuards(JwtAuthGuard)
export class WorkoutsController {
  constructor(private readonly workoutsService: WorkoutsService) { }

  @Post()
  create(@Request() req: any, @Body() createWorkoutDto: any) {
    return this.workoutsService.create(req.user._id, createWorkoutDto);
  }

  @Get()
  findAll(
    @Request() req: any,
    @Query('search') search?: string,
    @Query('author') author?: string,
  ) {
    // Evaluate if this is a global fetch
    if (search || author) {
      return this.workoutsService.findAllPublic(search, author);
    }
    // If no filter, return the user's personal list
    return this.workoutsService.findAllForUser(req.user._id);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.workoutsService.findOne(req.user._id, id);
  }

  @Get(':id/recommendation')
  getRecommendation(@Request() req: any, @Param('id') id: string) {
    return this.workoutsService.getAiRecommendation(req.user._id, id);
  }

  @Put(':id')
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateWorkoutDto: any,
  ) {
    return this.workoutsService.update(req.user._id, id, updateWorkoutDto);
  }

  @Post(':id/exercises')
  addExercise(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { exerciseId: string },
  ) {
    return this.workoutsService.addExerciseToWorkout(
      req.user._id,
      id,
      body.exerciseId,
    );
  }

  @Put(':id/exercises/:exerciseObjId')
  updateExercise(
    @Request() req: any,
    @Param('id') id: string,
    @Param('exerciseObjId') exerciseObjId: string,
    @Body() body: { sets?: number; reps?: number; weight?: number },
  ) {
    return this.workoutsService.updateExerciseInWorkout(
      req.user._id,
      id,
      exerciseObjId,
      body,
    );
  }
  @Delete(':id/exercises/:exerciseObjId')
  removeExercise(
    @Request() req: any,
    @Param('id') id: string,
    @Param('exerciseObjId') exerciseObjId: string,
  ) {
    return this.workoutsService.removeExerciseFromWorkout(
      req.user._id,
      id,
      exerciseObjId,
    );
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.workoutsService.remove(req.user._id, id);
  }
}