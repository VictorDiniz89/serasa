import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from '../test/render';
import { server } from '../test/server';
import { ProducerDetailPage } from './ProducerDetailPage';

const producer = {
  id: 'p1',
  name: 'Ana Lima',
  document: '39053344705',
  documentType: 'CPF',
  farms: [
    {
      id: 'f1',
      name: 'Fazenda Pantanal',
      city: 'Sorriso',
      state: 'MT',
      totalAreaHa: 400,
      arableAreaHa: 280,
      vegetationAreaHa: 80,
    },
  ],
};

test('DELETE 409 mostra o detail da API', async () => {
  server.use(
    http.get('/api/v1/producers/p1', () => HttpResponse.json(producer)),
    http.delete('/api/v1/producers/p1', () =>
      HttpResponse.json(
        {
          type: 'about:blank',
          title: 'Conflito',
          status: 409,
          detail: 'Não é possível excluir produtor com fazendas cadastradas',
          requestId: 't',
        },
        { status: 409 },
      ),
    ),
  );
  const user = userEvent.setup();
  renderWithProviders(
    <Routes>
      <Route path="/producers/:id" element={<ProducerDetailPage />} />
    </Routes>,
    { route: '/producers/p1' },
  );
  expect(await screen.findByText('Ana Lima')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: /excluir produtor/i }));
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Não é possível excluir produtor com fazendas cadastradas',
  );
});
