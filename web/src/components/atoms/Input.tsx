import type { InputHTMLAttributes } from 'react';
import styled from 'styled-components';

const StyledInput = styled.input`
  background: ${({ theme }) => theme.color.bg};
  color: ${({ theme }) => theme.color.text};
  border: 1px solid ${({ theme }) => theme.color.border};
  border-radius: ${({ theme }) => theme.radius};
  padding: ${({ theme }) => theme.space.sm};
  font: inherit;
`;

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ id, value, onChange, name, ...rest }: InputProps) {
  return (
    <StyledInput
      id={id}
      value={value}
      onChange={onChange}
      name={name}
      {...rest}
    />
  );
}
