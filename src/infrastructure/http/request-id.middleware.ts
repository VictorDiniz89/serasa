import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';

export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const requestId = String(req.headers['x-request-id'] ?? randomUUID());
  req.headers['x-request-id'] = requestId;
  res.setHeader('x-request-id', requestId);
  next();
}
