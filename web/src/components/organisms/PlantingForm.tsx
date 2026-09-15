import { useState, type FormEvent } from 'react';
import styled from 'styled-components';
import { problemDetail } from '../../lib/problem';
import { useCreatePlantingMutation } from '../../store/api';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { FormField } from '../molecules/FormField';

const Form = styled.form`
  margin-bottom: ${({ theme }) => theme.space.lg};
  max-width: 28rem;
`;

const Heading = styled.h2`
  margin: 0 0 ${({ theme }) => theme.space.md};
`;

type PlantingFormProps = {
  farmId: string;
  onError: (message: string) => void;
};

export function PlantingForm({ farmId, onError }: PlantingFormProps) {
  const [harvestName, setHarvestName] = useState('');
  const [cropName, setCropName] = useState('');
  const [createPlanting, { isLoading }] = useCreatePlantingMutation();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onError('');
    try {
      await createPlanting({ farmId, harvestName, cropName }).unwrap();
      setHarvestName('');
      setCropName('');
    } catch (err) {
      onError(problemDetail(err));
    }
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Heading>Novo plantio</Heading>
      <FormField label="Safra" htmlFor="planting-harvest">
        <Input
          id="planting-harvest"
          name="harvestName"
          value={harvestName}
          onChange={(event) => setHarvestName(event.target.value)}
        />
      </FormField>
      <FormField label="Cultura" htmlFor="planting-crop">
        <Input
          id="planting-crop"
          name="cropName"
          value={cropName}
          onChange={(event) => setCropName(event.target.value)}
        />
      </FormField>
      <Button type="submit" disabled={isLoading}>
        Cadastrar plantio
      </Button>
    </Form>
  );
}
