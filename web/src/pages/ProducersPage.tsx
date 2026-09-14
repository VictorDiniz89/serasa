import { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { ProducerForm } from '../components/organisms/ProducerForm';
import { useGetProducersQuery } from '../store/api';

const Page = styled.main`
  padding: ${({ theme }) => theme.space.lg};
`;

const Heading = styled.h1`
  margin: 0 0 ${({ theme }) => theme.space.md};
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

const ProducerLink = styled(Link)`
  color: ${({ theme }) => theme.color.accent};
`;

export function ProducersPage() {
  const [page] = useState(1);
  const limit = 20;
  const { data } = useGetProducersQuery({ page, limit });
  const producers = data?.data ?? [];

  return (
    <Page>
      <Heading>Produtores</Heading>
      <ProducerForm />
      <Table>
        <thead>
          <tr>
            <Th>Nome</Th>
            <Th>Documento</Th>
            <Th>Tipo</Th>
          </tr>
        </thead>
        <tbody>
          {producers.map((producer) => (
            <tr key={producer.id}>
              <Td>
                <ProducerLink to={`/producers/${producer.id}`}>
                  {producer.name}
                </ProducerLink>
              </Td>
              <Td>{producer.document}</Td>
              <Td>{producer.documentType}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Page>
  );
}
