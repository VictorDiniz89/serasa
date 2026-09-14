import type { ReactNode } from 'react';
import styled from 'styled-components';
import { ErrorText } from '../atoms/ErrorText';

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.xs};
  margin-bottom: ${({ theme }) => theme.space.md};
`;

const Label = styled.label`
  color: ${({ theme }) => theme.color.muted};
`;

type FormFieldProps = {
  label: string;
  htmlFor?: string;
  error?: string;
  children: ReactNode;
};

export function FormField({ label, htmlFor, error, children }: FormFieldProps) {
  return (
    <Field>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? <ErrorText>{error}</ErrorText> : null}
    </Field>
  );
}
