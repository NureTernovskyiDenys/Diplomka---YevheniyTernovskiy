import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ExercisesService {
    private readonly baseUrl = 'https://exercisedb-api.vercel.app/api/v1/exercises';

    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private httpService: HttpService,
    ) {
    }

    async getExercisesByTarget(target: string): Promise<any> {
        const cacheKey = `exercises:target:${target}`;
        const cachedData = await this.cacheManager.get(cacheKey);

        if (cachedData) {
            return cachedData;
        }

        const { data } = await firstValueFrom(
            this.httpService.get(`${this.baseUrl}`, { params: { target } }).pipe(
                catchError((error) => {
                    throw new HttpException(error.response?.data || 'ExerciseDB API Error', error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR);
                }),
            ),
        );

        // Cache for 1 hour
        await this.cacheManager.set(cacheKey, data, 3600000);
        return data;
    }

    async getExercisesByEquipment(equipment: string): Promise<any> {
        const cacheKey = `exercises:equipment:${equipment}`;
        const cachedData = await this.cacheManager.get(cacheKey);

        if (cachedData) {
            return cachedData;
        }

        const { data } = await firstValueFrom(
            this.httpService.get(`${this.baseUrl}`, { params: { equipment } }).pipe(
                catchError((error) => {
                    throw new HttpException(error.response?.data || 'ExerciseDB API Error', error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR);
                }),
            ),
        );

        await this.cacheManager.set(cacheKey, data, 3600000);
        return data;
    }
}
