process.env.TZ = 'America/Sao_Paulo';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { GlobalHttpExceptionFilter } from './common/exceptions/http.exceptions';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: {
        transport: {
          target: 'pino-pretty',
          options: {
            ignore: 'pid,hostname',
            colorize: true,
            translateTime: 'HH:MM:ss',
            singleLine: true,
          },
        },
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        serializers: {
          req(req: { method: string; url: string; ip: string }) {
            return { method: req.method, url: req.url, ip: req.ip };
          },
          res(res: { statusCode: number }) {
            return { statusCode: res.statusCode };
          },
        },
      },
      bodyLimit: 100 * 1024 * 1024, // 50 MB
    }),
  );

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      validateCustomDecorators: true,
      transformOptions: { enableImplicitConversion: true },
      stopAtFirstError: true,
    }),
  );

  app.useGlobalFilters(new GlobalHttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor(new Reflector()));

  const port = process.env.PORT ?? 3333;

  app.enableCors({
    origin: ['*'],
    methods: ['*'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  await app.listen(port, '0.0.0.0');
  console.info(
    `🚀 Server ready at http://localhost:${port}/api (${process.env.NODE_ENV ?? 'dev'})`,
  );
}

void bootstrap();
