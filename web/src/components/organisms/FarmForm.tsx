import { useState, type FormEvent } from 'react';
import styled from 'styled-components';
import { BRAZILIAN_STATES } from '../../lib/brazilian-states';
import { problemDetail } from '../../lib/problem';
import { useCreateFarmMutation } from '../../store/api';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Select } from '../atoms/Select';
import { FormField } from '../molecules/FormField';

const Form = styled.form`
  margin-bottom: ${({ theme }) => theme.space.lg};
  max-width: 28rem;
`;

type FarmFormProps = {
  producerId: string;
  onError: (message: string) => void;
};

export function FarmForm({ producerId, onError }: FarmFormProps) {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState<string>(BRAZILIAN_STATES[0]);
  const [total, setTotal] = useState('');
  const [arable, setArable] = useState('');
  const [vegetation, setVegetation] = useState('');
  const [createFarm, { isLoading }] = useCreateFarmMutation();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onError('');
    try {
      await createFarm({
        producerId,
        name,
        city,
        state,
        totalAreaHa: Number(total),
        arableAreaHa: Number(arable),
        vegetationAreaHa: Number(vegetation),
      }).unwrap();
      setName('');
      setCity('');
      setState(BRAZILIAN_STATES[0]);
      setTotal('');
      setArable('');
      setVegetation('');
    } catch (err) {
      onError(problemDetail(err));
    }
  }

  return (
    <Form onSubmit={handleSubmit}>
      <FormField label="Nome" htmlFor="farm-name">
        <Input
          id="farm-name"
          name="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </FormField>
      <FormField label="Cidade" htmlFor="farm-city">
        <Input
          id="farm-city"
          name="city"
          value={city}
          onChange={(event) => setCity(event.target.value)}
        />
      </FormField>
      <FormField label="UF" htmlFor="farm-state">
        <Select
          id="farm-state"
          name="state"
          value={state}
          onChange={(event) => setState(event.target.value)}
        >
          {BRAZILIAN_STATES.map((uf) => (
            <option key={uf} value={uf}>
              {uf}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField label="Total" htmlFor="farm-total">
        <Input
          id="farm-total"
          name="total"
          type="number"
          value={total}
          onChange={(event) => setTotal(event.target.value)}
        />
      </FormField>
      <FormField label="Agricultável" htmlFor="farm-arable">
        <Input
          id="farm-arable"
          name="arable"
          type="number"
          value={arable}
          onChange={(event) => setArable(event.target.value)}
        />
      </FormField>
      <FormField label="Vegetação" htmlFor="farm-vegetation">
        <Input
          id="farm-vegetation"
          name="vegetation"
          type="number"
          value={vegetation}
          onChange={(event) => setVegetation(event.target.value)}
        />
      </FormField>
      <Button type="submit" disabled={isLoading}>
        Cadastrar fazenda
      </Button>
    </Form>
  );
}
