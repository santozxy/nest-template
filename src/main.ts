import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalHttpExceptionFilter } from './common/exceptions/http.exceptions';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { Env } from './infrastructure/env/env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new GlobalHttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor(new Reflector()));
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: ['*'],
    methods: ['*'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  const configService = app.get<ConfigService<Env, true>>(ConfigService);
  const port = configService.get('PORT', { infer: true });
  const env = configService.get('NODE_ENV', { infer: true });

  await app.listen(port);
  console.info(
    `Server ready at http://localhost:${port}/api (${env ?? 'development'})`,
  );
}

bootstrap();
