import { useState, type FormEvent } from 'react';
import styled from 'styled-components';
import { Button } from '../atoms/Button';
import { ErrorText } from '../atoms/ErrorText';
import { Input } from '../atoms/Input';
import { FormField } from '../molecules/FormField';
import { problemDetail } from '../../lib/problem';
import { useCreateProducerMutation } from '../../store/api';

const Form = styled.form`
  margin-bottom: ${({ theme }) => theme.space.lg};
  max-width: 28rem;
`;

export function ProducerForm() {
  const [name, setName] = useState('');
  const [document, setDocument] = useState('');
  const [error, setError] = useState('');
  const [createProducer, { isLoading }] = useCreateProducerMutation();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    try {
      await createProducer({ name, document }).unwrap();
      setName('');
      setDocument('');
    } catch (err) {
      setError(problemDetail(err));
    }
  }

  return (
    <Form onSubmit={handleSubmit}>
      {error ? <ErrorText>{error}</ErrorText> : null}
      <FormField label="Nome" htmlFor="producer-name">
        <Input
          id="producer-name"
          name="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </FormField>
      <FormField label="Documento" htmlFor="producer-document">
        <Input
          id="producer-document"
          name="document"
          value={document}
          onChange={(event) => setDocument(event.target.value)}
        />
      </FormField>
      <Button type="submit" disabled={isLoading}>
        Cadastrar
      </Button>
    </Form>
  );
}
