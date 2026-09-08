import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DomainError, DomainErrorType } from '../../domain/errors/domain-error';

const STATUS_BY_CODE: Record<DomainErrorType, number> = {
  VALIDATION: HttpStatus.UNPROCESSABLE_ENTITY,
  NOT_FOUND: HttpStatus.NOT_FOUND,
  CONFLICT: HttpStatus.CONFLICT,
};

const TITLE_BY_CODE: Record<DomainErrorType, string> = {
  VALIDATION: 'Erro de validação',
  NOT_FOUND: 'Recurso não encontrado',
  CONFLICT: 'Conflito',
};

@Catch()
export class HttpProblemFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = String(request.headers['x-request-id'] ?? '');

    if (exception instanceof DomainError) {
      const status = STATUS_BY_CODE[exception.code];
      response.status(status).type('application/problem+json').json({
        type: `about:blank`,
        title: TITLE_BY_CODE[exception.code],
        status,
        detail: exception.message,
        requestId,
      });
      return;
    }

    if (exception instanceof BadRequestException) {
      const body = exception.getResponse();
      let detail = exception.message;
      if (typeof body === 'string') {
        detail = body;
      } else {
        const message = (body as { message?: unknown }).message;
        if (Array.isArray(message)) {
          detail = message.map(String).join('; ');
        } else if (typeof message === 'string') {
          detail = message;
        }
      }

      response
        .status(HttpStatus.BAD_REQUEST)
        .type('application/problem+json')
        .json({
          type: 'about:blank',
          title: 'Requisição inválida',
          status: HttpStatus.BAD_REQUEST,
          detail,
          requestId,
        });
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      response
        .status(status)
        .type('application/problem+json')
        .json({
          type: 'about:blank',
          title: status === 404 ? 'Recurso não encontrado' : 'Erro HTTP',
          status,
          detail: exception.message,
          requestId,
        });
      return;
    }

    response
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .type('application/problem+json')
      .json({
        type: 'about:blank',
        title: 'Erro interno',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        detail:
          exception instanceof Error ? exception.message : 'Erro inesperado',
        requestId,
      });
  }
}
