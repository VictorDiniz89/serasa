import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '../components/atoms/Button';
import { ErrorText } from '../components/atoms/ErrorText';
import { PlantingForm } from '../components/organisms/PlantingForm';
import { problemDetail } from '../lib/problem';
import {
  useDeleteFarmMutation,
  useDeletePlantingMutation,
  useGetFarmQuery,
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

const Meta = styled.p`
  color: ${({ theme }) => theme.color.muted};
  margin: 0 0 ${({ theme }) => theme.space.md};
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

export function FarmDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useGetFarmQuery(id, {
    skip: !id,
  });
  const [deleteFarm] = useDeleteFarmMutation();
  const [deletePlanting] = useDeletePlantingMutation();
  const [errorMessage, setErrorMessage] = useState('');

  async function handleDeleteFarm() {
    if (!data) {
      return;
    }
    setErrorMessage('');
    try {
      await deleteFarm(id).unwrap();
      navigate(`/producers/${data.producerId}`);
    } catch (err) {
      setErrorMessage(problemDetail(err));
    }
  }

  async function handleDeletePlanting(plantingId: string) {
    setErrorMessage('');
    try {
      await deletePlanting(plantingId).unwrap();
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
      <Meta>
        {data.city}/{data.state} · {data.totalAreaHa} ha · agricultável{' '}
        {data.arableAreaHa} · vegetação {data.vegetationAreaHa}
      </Meta>
      {errorMessage ? <ErrorText>{errorMessage}</ErrorText> : null}
      <Actions>
        <Button type="button" onClick={handleDeleteFarm}>
          Excluir fazenda
        </Button>
      </Actions>
      <PlantingForm farmId={data.id} onError={setErrorMessage} />
      <Table>
        <thead>
          <tr>
            <Th>Safra</Th>
            <Th>Cultura</Th>
            <Th>Ações</Th>
          </tr>
        </thead>
        <tbody>
          {data.plantings.map((planting) => (
            <tr key={planting.id}>
              <Td>{planting.harvestName}</Td>
              <Td>{planting.cropName}</Td>
              <Td>
                <Button
                  type="button"
                  onClick={() => handleDeletePlanting(planting.id)}
                >
                  Excluir plantio
                </Button>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Page>
  );
}
