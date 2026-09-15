import { fireEvent, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from '../test/render';
import { server } from '../test/server';
import { FarmDetailPage } from './FarmDetailPage';

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

const farm = {
  id: 'f1',
  producerId: 'p1',
  name: 'Fazenda Horizonte',
  city: 'Uberaba',
  state: 'MG',
  totalAreaHa: 80,
  arableAreaHa: 50,
  vegetationAreaHa: 20,
  plantings: [{ id: 'pl1', harvestName: 'Safra 2021', cropName: 'Soja' }],
};

test('mostra plantios da fazenda', async () => {
  server.use(http.get('/api/v1/farms/f1', () => HttpResponse.json(farm)));
  renderWithProviders(
    <Routes>
      <Route path="/farms/:id" element={<FarmDetailPage />} />
    </Routes>,
    { route: '/farms/f1' },
  );
  expect(await screen.findByText('Fazenda Horizonte')).toBeInTheDocument();
  expect(screen.getByText('Soja')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Novo plantio' })).toBeInTheDocument();
});

test('desabilita Excluir fazenda e Excluir plantio enquanto a mutação está em voo', async () => {
  const farmGate = deferred();
  const plantingGate = deferred();
  server.use(
    http.get('/api/v1/farms/f1', () => HttpResponse.json(farm)),
    http.delete('/api/v1/farms/f1', async () => {
      await farmGate.promise;
      return HttpResponse.json(
        {
          type: 'about:blank',
          title: 'Conflito',
          status: 409,
          detail: 'Não é possível excluir',
          requestId: 't',
        },
        { status: 409 },
      );
    }),
    http.delete('/api/v1/plantings/pl1', async () => {
      await plantingGate.promise;
      return HttpResponse.json(
        {
          type: 'about:blank',
          title: 'Conflito',
          status: 409,
          detail: 'Plantio em uso',
          requestId: 't',
        },
        { status: 409 },
      );
    }),
  );
  renderWithProviders(
    <Routes>
      <Route path="/farms/:id" element={<FarmDetailPage />} />
    </Routes>,
    { route: '/farms/f1' },
  );
  const deleteFarm = await screen.findByRole('button', { name: /excluir fazenda/i });
  const deletePlanting = screen.getByRole('button', { name: /excluir plantio/i });
  expect(deleteFarm).toBeEnabled();
  expect(deletePlanting).toBeEnabled();

  fireEvent.click(deletePlanting);
  await waitFor(() => expect(deletePlanting).toBeDisabled());
  plantingGate.resolve();
  expect(await screen.findByRole('alert')).toHaveTextContent('Plantio em uso');
  await waitFor(() => expect(deletePlanting).toBeEnabled());

  fireEvent.click(deleteFarm);
  await waitFor(() => expect(deleteFarm).toBeDisabled());
  farmGate.resolve();
  expect(await screen.findByRole('alert')).toHaveTextContent('Não é possível excluir');
  await waitFor(() => expect(deleteFarm).toBeEnabled());
});
