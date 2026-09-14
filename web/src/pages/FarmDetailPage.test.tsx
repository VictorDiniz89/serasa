import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from '../test/render';
import { server } from '../test/server';
import { FarmDetailPage } from './FarmDetailPage';

test('mostra plantios da fazenda', async () => {
  server.use(
    http.get('/api/v1/farms/f1', () =>
      HttpResponse.json({
        id: 'f1',
        producerId: 'p1',
        name: 'Fazenda Horizonte',
        city: 'Uberaba',
        state: 'MG',
        totalAreaHa: 80,
        arableAreaHa: 50,
        vegetationAreaHa: 20,
        plantings: [{ id: 'pl1', harvestName: 'Safra 2021', cropName: 'Soja' }],
      }),
    ),
  );
  renderWithProviders(
    <Routes>
      <Route path="/farms/:id" element={<FarmDetailPage />} />
    </Routes>,
    { route: '/farms/f1' },
  );
  expect(await screen.findByText('Fazenda Horizonte')).toBeInTheDocument();
  expect(screen.getByText('Soja')).toBeInTheDocument();
});
