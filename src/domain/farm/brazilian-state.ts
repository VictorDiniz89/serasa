import { DomainError } from '../errors/domain-error';

export const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
] as const;

export type BrazilianState = (typeof BRAZILIAN_STATES)[number];

const STATE_SET = new Set<string>(BRAZILIAN_STATES);

export function parseBrazilianState(raw: string): BrazilianState {
  const state = raw.trim().toUpperCase();

  if (!STATE_SET.has(state)) {
    throw DomainError.validation('Estado inválido');
  }

  return state as BrazilianState;
}