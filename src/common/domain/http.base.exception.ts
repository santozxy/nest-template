export class HttpBaseException extends Error {
  public readonly status: number;
  public readonly error: string;

  constructor(message: string, status = 400, error = 'Bad Request') {
    super(message);
    this.status = status;
    this.error = error;
  }
}
