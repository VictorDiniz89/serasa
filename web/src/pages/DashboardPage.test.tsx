import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { renderWithProviders } from '../test/render';
import { server } from '../test/server';
import { DashboardPage } from './DashboardPage';

const snapshot = {
  totalFarms: 3,
  totalHectares: 770,
  farmsByState: [
    { state: 'SP', count: 1 },
    { state: 'MT', count: 1 },
    { state: 'GO', count: 1 },
  ],
  cropsPlanted: [
    { crop: 'Soja', count: 2 },
    { crop: 'Milho', count: 1 },
    { crop: 'Café', count: 1 },
  ],
  landUse: { arableHectares: 510, vegetationHectares: 170 },
};

const emptySnapshot = {
  totalFarms: 0,
  totalHectares: 0,
  farmsByState: [],
  cropsPlanted: [],
  landUse: { arableHectares: 0, vegetationHectares: 0 },
};

test('mostra Nenhuma fazenda ainda quando totalFarms é zero', async () => {
  server.use(
    http.get('/api/v1/dashboard', () => HttpResponse.json(emptySnapshot)),
  );
  renderWithProviders(<DashboardPage />);
  expect(await screen.findByText('Nenhuma fazenda ainda')).toBeInTheDocument();
});

test('mostra erro de API em falha de rede e não mostra estado vazio', async () => {
  server.use(
    http.get('/api/v1/dashboard', () => HttpResponse.error()),
  );
  renderWithProviders(<DashboardPage />);
  expect(
    await screen.findByText('Não foi possível falar com a API'),
  ).toBeInTheDocument();
  expect(screen.queryByText('Nenhuma fazenda ainda')).not.toBeInTheDocument();
});

test('mostra totais e títulos das três pizzas', async () => {
  server.use(
    http.get('/api/v1/dashboard', () => HttpResponse.json(snapshot)),
  );
  renderWithProviders(<DashboardPage />);
  expect(await screen.findByText('3')).toBeInTheDocument();
  expect(screen.getByText('770')).toBeInTheDocument();
  expect(screen.getByText('Por estado')).toBeInTheDocument();
  expect(screen.getByText('Por cultura')).toBeInTheDocument();
  expect(screen.getByText('Uso do solo')).toBeInTheDocument();
  expect(
    screen.getByText(/não entra na pizza/i),
  ).toBeInTheDocument();
});
