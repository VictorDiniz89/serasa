import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
  } from '@nestjs/common';
  import { Request, Response } from 'express';
  import pino from 'pino';
  import { Observable } from 'rxjs';
  
  const logger = pino({ name: 'http' });
  
  export function resourceIdsFromRequest(req: {
    params?: Record<string, string>;
    route?: { path?: string };
  }): { producerId?: string; farmId?: string } {
    const params = req.params ?? {};
    const path = req.route?.path ?? '';
    const ids: { producerId?: string; farmId?: string } = {};
  
    if (params.producerId) {
      ids.producerId = params.producerId;
    }
    if (params.farmId) {
      ids.farmId = params.farmId;
    }
    if (params.id) {
      if (path.includes('producers/:id') && !path.includes('farms')) {
        ids.producerId = params.id;
      }
      if (path.includes('farms/:id')) {
        ids.farmId = params.id;
      }
    }
  
    return ids;
  }
  
  @Injectable()
  export class RequestLogInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
      const http = context.switchToHttp();
      const req = http.getRequest<Request>();
      const res = http.getResponse<Response>();
      const started = Date.now();
  
      res.on('finish', () => {
        const ids = resourceIdsFromRequest(req as any);
        logger.info({
          requestId: String(req.headers['x-request-id'] ?? ''),
          method: req.method,
          route: (req.originalUrl ?? req.url).split('?')[0],
          status: res.statusCode,
          durationMs: Date.now() - started,
          ...(ids.producerId ? { producerId: ids.producerId } : {}),
          ...(ids.farmId ? { farmId: ids.farmId } : {}),
        });
      });
  
      return next.handle();
    }
  }