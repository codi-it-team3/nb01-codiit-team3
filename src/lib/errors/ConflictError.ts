export default class ConflictError extends Error {
  statusCode: number;
  error: string;

  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
    this.statusCode = 409;
    this.error = 'Conflict';
  }
}
