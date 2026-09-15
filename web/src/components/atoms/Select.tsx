import type { SelectHTMLAttributes } from 'react';
import styled from 'styled-components';

const StyledSelect = styled.select`
  background: ${({ theme }) => theme.color.bg};
  color: ${({ theme }) => theme.color.text};
  border: 1px solid ${({ theme }) => theme.color.border};
  border-radius: ${({ theme }) => theme.radius};
  padding: ${({ theme }) => theme.space.sm};
  font: inherit;
`;

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ children, ...rest }: SelectProps) {
  return <StyledSelect {...rest}>{children}</StyledSelect>;
}
