import { HttpBaseException } from './http.base.exception';

export class BadRequestException extends HttpBaseException {
  constructor(message = 'Bad Request') {
    super(message, 400);
  }
}

export class ConflictException extends HttpBaseException {
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}

export class UnauthorizedException extends HttpBaseException {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenException extends HttpBaseException {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

export class NotFoundException extends HttpBaseException {
  constructor(message = 'Not Found') {
    super(message, 404);
  }
}
