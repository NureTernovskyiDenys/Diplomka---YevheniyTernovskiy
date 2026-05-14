import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class SetLogDto {
  @IsNumber()
  weight: number;

  @IsInt()
  @Min(0)
  reps: number;

  @IsDateString()
  completedAt: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  rpe?: number;
}

export class ExerciseLogDto {
  @IsString()
  exerciseId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SetLogDto)
  sets: SetLogDto[];
}

export class CreateSessionDto {
  @IsMongoId()
  workoutId: string;

  @IsDateString()
  startedAt: string;

  @IsOptional()
  @IsDateString()
  finishedAt?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  durationSec?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExerciseLogDto)
  exercises: ExerciseLogDto[];
}
