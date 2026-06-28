import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { extractPrismaErrorMessage } from './helpers';
import { HttpBaseException } from '../domain/http.base.exception';

interface ErrorResponse {
  code: number;
  status: 'error';
  message: string;
}

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalHttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse();

    let payload: ErrorResponse;
    let statusCode = 500;

    if (exception instanceof HttpBaseException) {
      statusCode = exception.status;
      payload = {
        code: exception.status,
        status: 'error',
        message: exception.message,
      };
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const response = exception.getResponse() as
        string | { message: string | string[] };

      const message =
        typeof response === 'string'
          ? response
          : Array.isArray(response.message)
            ? response.message.join(', ')
            : (response.message ?? 'Erro inesperado');

      payload = {
        code: statusCode,
        status: 'error',
        message,
      };
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      statusCode = 400;
      payload = {
        code: 400,
        status: 'error',
        message: extractPrismaErrorMessage(exception.message),
      };
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      statusCode = 400;
      payload = {
        code: 400,
        status: 'error',
        message: extractPrismaErrorMessage(exception.message),
      };
    } else {
      this.logger.error('Erro inesperado', (exception as any)?.stack);
      statusCode = 500;
      payload = {
        code: 500,
        status: 'error',
        message: 'Ocorreu um erro inesperado',
      };
    }
    reply.status(statusCode).send(payload);
  }
}
