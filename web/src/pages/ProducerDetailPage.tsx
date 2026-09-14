import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '../components/atoms/Button';
import { ErrorText } from '../components/atoms/ErrorText';
import { Input } from '../components/atoms/Input';
import { FormField } from '../components/molecules/FormField';
import { FarmForm } from '../components/organisms/FarmForm';
import { problemDetail } from '../lib/problem';
import {
  useDeleteProducerMutation,
  useGetProducerQuery,
  useUpdateProducerMutation,
} from '../store/api';

const Page = styled.main`
  padding: ${({ theme }) => theme.space.lg};
`;

const Heading = styled.h1`
  margin: 0 0 ${({ theme }) => theme.space.md};
`;

const Status = styled.p`
  color: ${({ theme }) => theme.color.muted};
  margin: 0;
`;

const NameForm = styled.form`
  margin-bottom: ${({ theme }) => theme.space.md};
  max-width: 28rem;
`;

const Actions = styled.div`
  margin-bottom: ${({ theme }) => theme.space.lg};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  color: ${({ theme }) => theme.color.muted};
  border-bottom: 1px solid ${({ theme }) => theme.color.border};
  padding: ${({ theme }) => theme.space.sm};
`;

const Td = styled.td`
  padding: ${({ theme }) => theme.space.sm};
  border-bottom: 1px solid ${({ theme }) => theme.color.border};
`;

const FarmLink = styled(Link)`
  color: ${({ theme }) => theme.color.accent};
`;

const BackLink = styled(Link)`
  color: ${({ theme }) => theme.color.accent};
`;

function isNotFound(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    (error as { status: unknown }).status === 404
  );
}

export function ProducerDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useGetProducerQuery(id, {
    skip: !id,
  });
  const [deleteProducer] = useDeleteProducerMutation();
  const [updateProducer] = useUpdateProducerMutation();
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSaveName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');
    const nextName = String(new FormData(event.currentTarget).get('name') ?? '');
    try {
      await updateProducer({ id, name: nextName }).unwrap();
    } catch (err) {
      setErrorMessage(problemDetail(err));
    }
  }

  async function handleDelete() {
    setErrorMessage('');
    try {
      await deleteProducer(id).unwrap();
      navigate('/producers');
    } catch (err) {
      setErrorMessage(problemDetail(err));
    }
  }

  if (isLoading) {
    return (
      <Page>
        <Status>Carregando…</Status>
      </Page>
    );
  }

  if (isNotFound(error)) {
    return (
      <Page>
        <Status>Não encontrado</Status>
        <BackLink to="/producers">Produtores</BackLink>
      </Page>
    );
  }

  if (isError || !data) {
    return (
      <Page>
        <Status>{problemDetail(error)}</Status>
      </Page>
    );
  }

  return (
    <Page>
      <Heading>{data.name}</Heading>
      {errorMessage ? <ErrorText>{errorMessage}</ErrorText> : null}
      <NameForm onSubmit={handleSaveName}>
        <FormField label="Nome" htmlFor="producer-name">
          <Input id="producer-name" name="name" defaultValue={data.name} />
        </FormField>
        <Button type="submit">Salvar nome</Button>
      </NameForm>
      <Actions>
        <Button type="button" onClick={handleDelete}>
          Excluir produtor
        </Button>
      </Actions>
      <FarmForm producerId={data.id} onError={setErrorMessage} />
      <Table>
        <thead>
          <tr>
            <Th>Fazendas</Th>
          </tr>
        </thead>
        <tbody>
          {data.farms.map((farm) => (
            <tr key={farm.id}>
              <Td>
                <FarmLink to={`/farms/${farm.id}`}>{farm.name}</FarmLink>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Page>
  );
}
