import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from '../test/render';
import { server } from '../test/server';
import { ProducerDetailPage } from './ProducerDetailPage';

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

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

test('mostra documento, tipo e fazenda com cidade/UF/área', async () => {
  server.use(http.get('/api/v1/producers/p1', () => HttpResponse.json(producer)));
  renderWithProviders(
    <Routes>
      <Route path="/producers/:id" element={<ProducerDetailPage />} />
    </Routes>,
    { route: '/producers/p1' },
  );
  expect(await screen.findByText('Ana Lima')).toBeInTheDocument();
  expect(screen.getByText(/CPF/)).toBeInTheDocument();
  expect(screen.getByText(/39053344705/)).toBeInTheDocument();
  expect(screen.getByText(/Sorriso\/MT/)).toBeInTheDocument();
  expect(screen.getByText(/400 ha/)).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Nova fazenda' })).toBeInTheDocument();
  expect(screen.getByLabelText('Nome')).toBeInTheDocument();
  expect(screen.getByLabelText('Nome da fazenda')).toBeInTheDocument();
});

test('desabilita Salvar nome e Excluir produtor enquanto a mutação está em voo', async () => {
  const patchGate = deferred();
  const deleteGate = deferred();
  server.use(
    http.get('/api/v1/producers/p1', () => HttpResponse.json(producer)),
    http.patch('/api/v1/producers/p1', async () => {
      await patchGate.promise;
      return HttpResponse.json({ ...producer, farms: undefined });
    }),
    http.delete('/api/v1/producers/p1', async () => {
      await deleteGate.promise;
      return HttpResponse.json(
        {
          type: 'about:blank',
          title: 'Conflito',
          status: 409,
          detail: 'Não é possível excluir produtor com fazendas cadastradas',
          requestId: 't',
        },
        { status: 409 },
      );
    }),
  );
  renderWithProviders(
    <Routes>
      <Route path="/producers/:id" element={<ProducerDetailPage />} />
    </Routes>,
    { route: '/producers/p1' },
  );
  const save = await screen.findByRole('button', { name: /salvar nome/i });
  const remove = screen.getByRole('button', { name: /excluir produtor/i });
  expect(save).toBeEnabled();
  expect(remove).toBeEnabled();

  fireEvent.click(save);
  await waitFor(() => expect(save).toBeDisabled());
  patchGate.resolve();
  await waitFor(() => expect(save).toBeEnabled());

  fireEvent.click(remove);
  await waitFor(() => expect(remove).toBeDisabled());
  deleteGate.resolve();
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Não é possível excluir produtor com fazendas cadastradas',
  );
  await waitFor(() => expect(remove).toBeEnabled());
});
