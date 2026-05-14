import { IsMongoId, IsOptional } from 'class-validator';

export class ListSessionsQueryDto {
  @IsOptional()
  @IsMongoId()
  workoutId?: string;
}
