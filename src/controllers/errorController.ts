import { Request, Response, NextFunction } from 'express';
import { StructError } from 'superstruct';
import BadRequestError from '../lib/errors/BadRequestError';
import NotFoundError from '../lib/errors/NotFoundError';
import ProductNotFoundError from '../lib/errors/ProductNotFoundError';
import UnauthorizedError from '../lib/errors/UnauthorizedError';
import ForbiddenError from '../lib/errors/ForbiddenError';
import ConflictError from '../lib/errors/ConflictError';

export function defaultNotFoundHandler(req: Request, res: Response, next: NextFunction) {
  res.status(404).send({ message: 'Not found' });
}

export function globalErrorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  /** From superstruct or application error */
  if (err instanceof StructError || err instanceof BadRequestError) {
    res.status(400).send({ message: err.message });
    return;
  }

  /** From express.json middleware */
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).send({ message: 'Invalid JSON' });
    return;
  }

  /** Prisma error codes */
  if ('code' in err) {
    console.error(err);
    res.status(500).send({ message: 'Failed to process data' });
    return;
  }

  /** Application errors */
  if (err instanceof NotFoundError) {
    res.status(404).send({
      message: err.message,
      statusCode: 404,
      error: 'Not Found',
    });
    return;
  }

  if (err instanceof ProductNotFoundError) {
    res.status(404).send({
      message: err.message,
      statusCode: 404,
      error: 'Not Found',
    });
    return;
  }

  if (err instanceof UnauthorizedError) {
    res.status(401).send({ message: err.message });
    return;
  }

  if (err instanceof ForbiddenError) {
    res.status(403).send({ message: err.message });
    return;
  }

  if (err instanceof ConflictError) {
    res.status(409).send({
      message: err.message,
      statusCode: err.statusCode,
      error: err.error,
    });
    return;
  }

  console.error(err);
  res.status(500).send({ message: 'Internal server error' });
}
