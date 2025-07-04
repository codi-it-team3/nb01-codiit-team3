class UnauthorizedError extends Error {
  statusCode: number;
  error: string;

  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
    this.statusCode = 401;
    this.error = 'Unauthorized';
  }
}

export default UnauthorizedError;
