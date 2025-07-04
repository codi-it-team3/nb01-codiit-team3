class ForbiddenError extends Error {
  statusCode: number;
  error: string;

  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenError';
    this.statusCode = 403;
    this.error = 'Forbidden';
  }
}

export default ForbiddenError;
