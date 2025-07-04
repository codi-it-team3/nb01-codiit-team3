class BadRequestError extends Error {
  statusCode: number;
  error: string;

  constructor(message: string) {
    super(message);
    this.name = 'BadRequestError';
    this.statusCode = 400;
    this.error = 'BadRequest';
  }
}

export default BadRequestError;
