// interceptors/response.interceptor.ts
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  status: string;
  data: T;
  message: string;
  pagination?: Pagination | null;
}

export interface Pagination {
  total: number;
  page: number;
  lastPage: number;
  limit: number;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const customMessage =
      this.reflector.get<string>('customMessage', context.getHandler()) ||
      'Operação concluída com sucesso';

    return next.handle().pipe(
      map((response: { data: T; pagination?: Pagination }) => {
        if (response?.data && response?.pagination) {
          return {
            status: 'success',
            data: response.data,
            pagination: response.pagination,
            message: customMessage,
          };
        }
        return {
          status: 'success',
          data: response as T,
          message: customMessage,
        };
      }),
    );
  }
}
