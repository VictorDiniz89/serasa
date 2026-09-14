import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test/render';
import { Header } from './Header';

test('links Dashboard e Produtores', () => {
  renderWithProviders(<Header />);
  expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/');
  expect(screen.getByRole('link', { name: 'Produtores' })).toHaveAttribute(
    'href',
    '/producers',
  );
});
