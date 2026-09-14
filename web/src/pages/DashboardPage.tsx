import styled from 'styled-components';
import { PieCard } from '../components/organisms/PieCard';
import { StatCard } from '../components/molecules/StatCard';
import { useGetDashboardQuery } from '../store/api';

const Page = styled.main`
  padding: ${({ theme }) => theme.space.lg};
`;

const Heading = styled.h1`
  margin: 0 0 ${({ theme }) => theme.space.md};
`;

const Stats = styled.section`
  display: flex;
  gap: ${({ theme }) => theme.space.md};
  margin-bottom: ${({ theme }) => theme.space.lg};
`;

const Pies = styled.section`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.space.md};
`;

const Status = styled.p`
  color: ${({ theme }) => theme.color.muted};
  margin: 0;
`;

export function DashboardPage() {
  const { data, isLoading, isError } = useGetDashboardQuery();

  if (isLoading) {
    return (
      <Page>
        <Status>Carregando…</Status>
      </Page>
    );
  }

  if (isError || !data) {
    return (
      <Page>
        <Status>Não foi possível falar com a API</Status>
      </Page>
    );
  }

  if (data.totalFarms === 0) {
    return (
      <Page>
        <Status>Nenhuma fazenda ainda</Status>
      </Page>
    );
  }

  return (
    <Page>
      <Heading>Dashboard</Heading>
      <Stats>
        <StatCard title="Total de fazendas" value={data.totalFarms} />
        <StatCard title="Total de hectares" value={data.totalHectares} />
      </Stats>
      <Pies>
        <PieCard
          title="Por estado"
          data={data.farmsByState.map((row) => ({ name: row.state, value: row.count }))}
        />
        <PieCard
          title="Por cultura"
          data={data.cropsPlanted.map((row) => ({ name: row.crop, value: row.count }))}
        />
        <PieCard
          title="Uso do solo"
          data={[
            { name: 'Agricultável', value: data.landUse.arableHectares },
            { name: 'Vegetação', value: data.landUse.vegetationHectares },
          ]}
          caption="A sobra (total − agricultável − vegetação) não entra na pizza."
        />
      </Pies>
    </Page>
  );
}
