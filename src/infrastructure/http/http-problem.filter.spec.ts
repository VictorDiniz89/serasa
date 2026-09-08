import { ArgumentsHost, BadRequestException } from '@nestjs/common';
import { DomainError } from '../../domain/errors/domain-error';
import { HttpProblemFilter } from './http-problem.filter';

function mockHost(requestId = 'req-1') {
  const json = jest.fn();
  const type = jest.fn().mockReturnValue({ json });
  const status = jest.fn().mockReturnValue({ type, json });

  const host = {
    switchToHttp: () => ({
      getResponse: () => ({ status, type, json }),
      getRequest: () => ({ headers: { 'x-request-id': requestId } }),
    }),
  } as unknown as ArgumentsHost;

  return { host, status, type, json };
}

describe('HttpProblemFilter', () => {
  const filter = new HttpProblemFilter();

  it('mapeia VALIDATION para 422 problem+json', () => {
    const { host, status, type, json } = mockHost();

    filter.catch(DomainError.validation('CPF inválido'), host);

    expect(status).toHaveBeenCalledWith(422);
    expect(type).toHaveBeenCalledWith('application/problem+json');
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 422,
        title: 'Erro de validação',
        detail: 'CPF inválido',
        requestId: 'req-1',
      }),
    );
  });

  it('mapeia NOT_FOUND para 404', () => {
    const { host, status } = mockHost();
    filter.catch(DomainError.notFound('Produtor não encontrado'), host);
    expect(status).toHaveBeenCalledWith(404);
  });

  it('mapeia CONFLICT para 409', () => {
    const { host, status } = mockHost();
    filter.catch(DomainError.conflict('Documento já cadastrado'), host);
    expect(status).toHaveBeenCalledWith(409);
  });

  it('mapeia BadRequestException para 400', () => {
    const { host, status } = mockHost();
    filter.catch(new BadRequestException('UF inexistente'), host);
    expect(status).toHaveBeenCalledWith(400);
  });
});