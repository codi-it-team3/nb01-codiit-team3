class ProductNotFoundError extends Error {
  constructor(modelName: string, id: number | string) {
    super(`${modelName} with id ${id} not found`);
    this.name = 'NotFoundError';
  }
}

export default ProductNotFoundError;
