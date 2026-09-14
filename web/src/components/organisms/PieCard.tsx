import { Cell, Legend, Pie, PieChart, Tooltip } from 'recharts';
import styled, { useTheme } from 'styled-components';

const Card = styled.article`
  background: ${({ theme }) => theme.color.surface};
  border: 1px solid ${({ theme }) => theme.color.border};
  border-radius: ${({ theme }) => theme.radius};
  padding: ${({ theme }) => theme.space.md};
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.color.text};
  margin: 0 0 ${({ theme }) => theme.space.sm};
  font-size: 1rem;
`;

const Caption = styled.p`
  color: ${({ theme }) => theme.color.muted};
  margin: ${({ theme }) => theme.space.sm} 0 0;
  font-size: 0.875rem;
`;

const ChartWrap = styled.div`
  width: 320px;
  height: 260px;
`;

export type PieSlice = { name: string; value: number };

export function PieCard({
  title,
  data,
  caption,
}: {
  title: string;
  data: PieSlice[];
  caption?: string;
}) {
  const theme = useTheme();
  const colors = [
    theme.color.accent,
    '#5b9fd4',
    '#f0c14b',
    theme.color.danger,
    theme.color.muted,
    '#7c6af7',
  ];

  return (
    <Card>
      <Title>{title}</Title>
      <ChartWrap>
        <PieChart width={320} height={260}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            isAnimationActive={false}
          >
            {data.map((slice, index) => (
              <Cell key={slice.name} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ChartWrap>
      {caption ? <Caption>{caption}</Caption> : null}
    </Card>
  );
}
