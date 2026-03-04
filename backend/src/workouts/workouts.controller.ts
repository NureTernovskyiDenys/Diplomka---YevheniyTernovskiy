import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Request } from '@nestjs/common';
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
    findAll(@Request() req: any) {
        return this.workoutsService.findAllForUser(req.user._id);
    }

    @Get(':id')
    findOne(@Request() req: any, @Param('id') id: string) {
        return this.workoutsService.findOne(req.user._id, id);
    }

    @Put(':id')
    update(@Request() req: any, @Param('id') id: string, @Body() updateWorkoutDto: any) {
        return this.workoutsService.update(req.user._id, id, updateWorkoutDto);
    }

    @Delete(':id')
    remove(@Request() req: any, @Param('id') id: string) {
        return this.workoutsService.remove(req.user._id, id);
    }
}
