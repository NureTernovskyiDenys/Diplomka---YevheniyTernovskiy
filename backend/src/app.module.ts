import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ExercisesModule } from './exercises/exercises.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { WorkoutsModule } from './workouts/workouts.module';
import { AdminModule } from './admin/admin.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        if (process.env.VERCEL) {
          console.warn('⚠️ Running in Vercel Edge. Bypassing Redis connection to prevent timeout crashes.');
          return {};
        }
        try {
          const store = await redisStore({
            url: configService.get<string>('REDIS_URI'),
            socket: {
              connectTimeout: 5000,
              reconnectStrategy: false // Don't block lambda retrying endlessly
            }
          });
          return { store: () => store };
        } catch (error) {
          console.warn('⚠️ Redis Connection Failed on Vercel Startup! Falling back to in-memory cache.', error.message);
          return {}; // Fallback to default in-memory behavior if Redis is unreachable
        }
      },
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    ExercisesModule,
    SubscriptionsModule,
    WorkoutsModule,
    AdminModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
