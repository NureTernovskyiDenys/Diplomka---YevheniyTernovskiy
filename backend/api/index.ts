import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const server = express();
let cachedApp: any;

async function bootstrap() {
    if (!cachedApp) {
        const app = await NestFactory.create(
            AppModule,
            new ExpressAdapter(server),
        );

        app.enableCors();

        console.log('ENV CHECK:', {
            MONGODB: !!process.env.MONGODB_URI,
            REDIS: !!process.env.REDIS_URI
        });

        app.setGlobalPrefix('api/nest');

        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                transform: true,
                forbidNonWhitelisted: true,
            }),
        );

        cachedApp = await app.init();
    }
    return cachedApp;
}

export default async function handler(req: any, res: any) {
    await bootstrap();
    server(req, res);
}
