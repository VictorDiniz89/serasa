import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { renderWithProviders } from '../test/render';
import { server } from '../test/server';
import { ProducersPage } from './ProducersPage';

test('mostra erro de API quando GET /api/v1/producers falha na rede', async () => {
  server.use(http.get('/api/v1/producers', () => HttpResponse.error()));
  renderWithProviders(<ProducersPage />, { route: '/producers' });
  expect(
    await screen.findByText('Não foi possível falar com a API'),
  ).toBeInTheDocument();
  expect(screen.queryByRole('columnheader', { name: /nome/i })).not.toBeInTheDocument();
});

test('lista produtores do GET mockado', async () => {
  server.use(
    http.get('/api/v1/producers', () =>
      HttpResponse.json({
        data: [
          {
            id: 'p1',
            name: 'Ana Lima',
            document: '39053344705',
            documentType: 'CPF',
          },
        ],
        meta: { page: 1, limit: 20, total: 1 },
      }),
    ),
  );
  renderWithProviders(<ProducersPage />, { route: '/producers' });
  expect(await screen.findByText('Ana Lima')).toBeInTheDocument();
});

test('mostra detail 422 de CPF inválido', async () => {
  server.use(
    http.get('/api/v1/producers', () =>
      HttpResponse.json({ data: [], meta: { page: 1, limit: 20, total: 0 } }),
    ),
    http.post('/api/v1/producers', () =>
      HttpResponse.json(
        {
          type: 'about:blank',
          title: 'Erro de validação',
          status: 422,
          detail: 'CPF inválido',
          requestId: 't',
        },
        { status: 422 },
      ),
    ),
  );
  const user = userEvent.setup();
  renderWithProviders(<ProducersPage />, { route: '/producers' });
  await user.type(screen.getByLabelText(/nome/i), 'Inválido');
  await user.type(screen.getByLabelText(/documento/i), '111.111.111-11');
  await user.click(screen.getByRole('button', { name: /cadastrar/i }));
  expect(await screen.findByRole('alert')).toHaveTextContent('CPF inválido');
});
