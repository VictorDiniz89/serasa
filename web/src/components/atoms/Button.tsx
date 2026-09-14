import type { ButtonHTMLAttributes } from 'react';
import styled from 'styled-components';

const StyledButton = styled.button`
  background: ${({ theme }) => theme.color.accent};
  color: ${({ theme }) => theme.color.bg};
  border: 0;
  border-radius: ${({ theme }) => theme.radius};
  padding: ${({ theme }) => `${theme.space.sm} ${theme.space.md}`};
  cursor: pointer;
  font: inherit;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

type ButtonProps = Pick<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'type' | 'disabled' | 'onClick' | 'children'
>;

export function Button({
  type = 'button',
  disabled,
  onClick,
  children,
}: ButtonProps) {
  return (
    <StyledButton type={type} disabled={disabled} onClick={onClick}>
      {children}
    </StyledButton>
  );
}
