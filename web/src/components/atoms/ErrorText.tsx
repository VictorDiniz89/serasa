import styled from 'styled-components';

const Text = styled.p`
  color: ${({ theme }) => theme.color.danger};
  margin: ${({ theme }) => theme.space.sm} 0;
`;

export function ErrorText({ children }: { children: string }) {
  return <Text role="alert">{children}</Text>;
}
