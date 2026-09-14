import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { problemDetail } from './problem';

test('lê detail do problem+json', () => {
  const error = {
    status: 409,
    data: {
      type: 'about:blank',
      title: 'Conflito',
      status: 409,
      detail: 'Não é possível excluir produtor com fazendas cadastradas',
      requestId: 'x',
    },
  } as FetchBaseQueryError;
  expect(problemDetail(error)).toBe(
    'Não é possível excluir produtor com fazendas cadastradas',
  );
});

test('rede cai em mensagem genérica', () => {
  expect(problemDetail({ status: 'FETCH_ERROR', error: 'TypeError' })).toBe(
    'Não foi possível falar com a API',
  );
});
