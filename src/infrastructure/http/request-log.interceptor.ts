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

function expressRoutePath(route: unknown): string | undefined {
  if (typeof route !== 'object' || route === null) {
    return undefined;
  }
  const path = (route as { path?: unknown }).path;
  return typeof path === 'string' ? path : undefined;
}

function stringParams(
  params: Request['params'] | undefined,
): Record<string, string> {
  const out: Record<string, string> = {};
  if (!params) {
    return out;
  }
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string') {
      out[key] = value;
    }
  }
  return out;
}

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
      const routePath = expressRoutePath(req.route);
      const ids = resourceIdsFromRequest({
        params: stringParams(req.params),
        route: routePath ? { path: routePath } : undefined,
      });
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
