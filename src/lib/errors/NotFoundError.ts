class NotFoundError extends Error {
  constructor(modelName: string, id: number | string) {
    super(`${modelName}`);
    this.name = 'NotFoundError';
  }
}

export default NotFoundError;
