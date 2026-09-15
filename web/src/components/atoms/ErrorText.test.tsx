import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { theme } from '../../styles/theme';
import { ErrorText } from './ErrorText';

test('mostra o detail do problem+json', () => {
  render(
    <ThemeProvider theme={theme}>
      <ErrorText>Não é possível excluir produtor com fazendas cadastradas</ErrorText>
    </ThemeProvider>,
  );
  expect(
    screen.getByText('Não é possível excluir produtor com fazendas cadastradas'),
  ).toBeInTheDocument();
});
