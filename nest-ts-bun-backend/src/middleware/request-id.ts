import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import type { RequestContextLocals } from '../types/context';

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const incomingRequestId = req.header('x-request-id');
  const requestId = incomingRequestId ?? randomUUID();
  const context = res.locals as RequestContextLocals;

  context.requestId = requestId;
  res.setHeader('x-request-id', requestId);
  next();
}
