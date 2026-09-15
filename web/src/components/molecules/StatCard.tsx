import styled from 'styled-components';

const Card = styled.article`
  background: ${({ theme }) => theme.color.surface};
  border: 1px solid ${({ theme }) => theme.color.border};
  border-radius: ${({ theme }) => theme.radius};
  padding: ${({ theme }) => theme.space.md};
`;

const Title = styled.h3`
  color: ${({ theme }) => theme.color.muted};
  margin: 0 0 ${({ theme }) => theme.space.xs};
  font-size: 0.875rem;
`;

const Value = styled.p`
  color: ${({ theme }) => theme.color.text};
  margin: 0;
  font-size: 1.5rem;
`;

export function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <Title>{title}</Title>
      <Value>{value}</Value>
    </Card>
  );
}
