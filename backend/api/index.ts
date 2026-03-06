import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const server = express();

export const createNestServer = async (expressInstance: express.Express) => {
    const app = await NestFactory.create(
        AppModule,
        new ExpressAdapter(expressInstance),
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

    return app.init();
};

createNestServer(server)
    .then(() => console.log('Nest Ready'))
    .catch(err => console.error('Nest Error', err));

export default server;
