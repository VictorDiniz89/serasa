import { screen, within } from '@testing-library/react';
import { App } from './App';
import { renderWithProviders } from './test/render';

test('rota desconhecida mostra Não encontrado', () => {
  renderWithProviders(<App />, { route: '/nope' });
  const status = screen.getByText('Não encontrado');
  expect(status).toBeInTheDocument();
  const main = status.closest('main');
  expect(main).not.toBeNull();
  expect(within(main!).getByRole('link', { name: 'Produtores' })).toHaveAttribute(
    'href',
    '/producers',
  );
});
