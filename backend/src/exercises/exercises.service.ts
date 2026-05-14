import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ExercisesService {
  private readonly baseUrl =
    'https://edb-with-videos-and-images-by-ascendapi.p.rapidapi.com/api/v1';

  private readonly rapidApiHost =
    'edb-with-videos-and-images-by-ascendapi.p.rapidapi.com';

  private readonly validBodyParts = [
    'neck',
    'lower arms',
    'shoulders',
    'cardio',
    'upper arms',
    'chest',
    'lower legs',
    'back',
    'upper legs',
    'waist',
  ];

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private httpService: HttpService,
    private configService: ConfigService,
  ) { }

  private get rapidApiHeaders() {
    return {
      'x-rapidapi-key': this.configService.get<string>('RAPIDAPI_KEY') ?? '',
      'x-rapidapi-host': this.rapidApiHost,
      'Content-Type': 'application/json',
    };
  }

  private mapTarget(term: string): Record<string, string> {
    const lowerTerm = term.toLowerCase().trim();
    if (this.validBodyParts.includes(lowerTerm)) {
      return { bodyParts: lowerTerm };
    }
    return { muscles: lowerTerm };
  }

  async getExercisesByTarget(target: string): Promise<any> {
    const cacheKey = `exercises:target:${target}`;
    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) return cachedData;

    const params: any = { limit: 50, ...this.mapTarget(target) };

    const { data } = await firstValueFrom(
      this.httpService
        .get(`${this.baseUrl}/exercises/filter`, {
          params,
          headers: this.rapidApiHeaders,
        })
        .pipe(
          catchError((error) => {
            throw new HttpException(
              error.response?.data || 'ExerciseDB API Error',
              error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        ),
    );

    const result = data.data || [];
    await this.cacheManager.set(cacheKey, result, 3600000);
    return result;
  }

  async getExercisesByEquipment(equipment: string): Promise<any> {
    const cacheKey = `exercises:equipment:${equipment}`;
    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) return cachedData;

    const { data } = await firstValueFrom(
      this.httpService
        .get(
          `${this.baseUrl}/equipments/${encodeURIComponent(equipment)}/exercises`,
          {
            params: { limit: 50 },
            headers: this.rapidApiHeaders,
          },
        )
        .pipe(
          catchError((error) => {
            throw new HttpException(
              error.response?.data || 'ExerciseDB API Error',
              error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        ),
    );

    const result = data.data || [];
    await this.cacheManager.set(cacheKey, result, 3600000);
    return result;
  }

  async getExercisesByFilter(
    muscles?: string,
    equipment?: string,
  ): Promise<any> {
    const cacheKey = `exercises:filter:${muscles || 'any'}:${equipment || 'any'}`;
    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) return cachedData;

    const params: any = { limit: 50 };
    if (equipment) params.equipment = equipment;
    if (muscles) Object.assign(params, this.mapTarget(muscles));

    const { data } = await firstValueFrom(
      this.httpService
        .get(`${this.baseUrl}/exercises/filter`, {
          params,
          headers: this.rapidApiHeaders,
        })
        .pipe(
          catchError((error) => {
            throw new HttpException(
              error.response?.data || 'ExerciseDB API Error',
              error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        ),
    );

    const result = data.data || [];
    await this.cacheManager.set(cacheKey, result, 3600000);
    return result;
  }

  async searchExercises(q: string, offset = 0, limit = 50): Promise<any> {
    const cacheKey = `exercises:search:${q}:${offset}:${limit}`;
    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) return cachedData;

    const { data } = await firstValueFrom(
      this.httpService
        .get(`${this.baseUrl}/exercises/search`, {
          params: { q, offset, limit },
          headers: this.rapidApiHeaders,
        })
        .pipe(
          catchError((error) => {
            throw new HttpException(
              error.response?.data || 'ExerciseDB API Error',
              error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        ),
    );

    const result = data.data || [];
    await this.cacheManager.set(cacheKey, result, 3600000);
    return result;
  }

  async getAllExercises(offset = 0, limit = 50): Promise<any> {
    const cacheKey = `exercises:all:${offset}:${limit}`;
    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) return cachedData;

    const { data } = await firstValueFrom(
      this.httpService
        .get(`${this.baseUrl}/exercises`, {
          params: { offset, limit },
          headers: this.rapidApiHeaders,
        })
        .pipe(
          catchError((error) => {
            throw new HttpException(
              error.response?.data || 'ExerciseDB API Error',
              error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        ),
    );

    const result = data.data || [];
    await this.cacheManager.set(cacheKey, result, 3600000);
    return result;
  }

  async getExerciseById(id: string): Promise<any> {
    const cacheKey = `exercises:id:${id}`;
    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) return cachedData;

    const { data } = await firstValueFrom(
      this.httpService
        .get(`${this.baseUrl}/exercises/${encodeURIComponent(id)}`, {
          headers: this.rapidApiHeaders,
        })
        .pipe(
          catchError((error) => {
            throw new HttpException(
              error.response?.data || 'ExerciseDB API Error',
              error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        ),
    );

    const result = data.data;
    await this.cacheManager.set(cacheKey, result, 3600000);
    return result;
  }

  async getMuscles(): Promise<any> {
    const cacheKey = `exercises:muscles`;
    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) return cachedData;

    const { data } = await firstValueFrom(
      this.httpService
        .get(`${this.baseUrl}/muscles`, { headers: this.rapidApiHeaders })
        .pipe(
          catchError((error) => {
            throw new HttpException(
              error.response?.data || 'ExerciseDB Error',
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        ),
    );

    const result = data.data || [];
    await this.cacheManager.set(cacheKey, result, 86400000);
    return result;
  }

  async getEquipments(): Promise<any> {
    const cacheKey = `exercises:equipments`;
    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) return cachedData;

    const { data } = await firstValueFrom(
      this.httpService
        .get(`${this.baseUrl}/equipments`, { headers: this.rapidApiHeaders })
        .pipe(
          catchError((error) => {
            throw new HttpException(
              error.response?.data || 'ExerciseDB Error',
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        ),
    );

    const result = data.data || [];
    await this.cacheManager.set(cacheKey, result, 86400000);
    return result;
  }

  async getBodyParts(): Promise<any> {
    const cacheKey = `exercises:bodyparts`;
    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) return cachedData;

    const { data } = await firstValueFrom(
      this.httpService
        .get(`${this.baseUrl}/bodyparts`, { headers: this.rapidApiHeaders })
        .pipe(
          catchError((error) => {
            throw new HttpException(
              error.response?.data || 'ExerciseDB Error',
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        ),
    );

    const result = data.data || [];
    await this.cacheManager.set(cacheKey, result, 86400000);
    return result;
  }
}