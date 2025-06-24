class NotFoundError extends Error {
  statusCode: number;
  constructor(modelName: string, id: string) {
    super(`${modelName}`);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

export default NotFoundError;
