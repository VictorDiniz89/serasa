import { parseBrazilianState } from './brazilian-state';
import { DomainError } from '../errors/domain-error';

describe('parseBrazilianState', () => {
  it('normaliza para maiúsculas', () => {
    expect(parseBrazilianState('sp')).toBe('SP');
    expect(parseBrazilianState(' Df ')).toBe('DF');
  });

  it('aceita as 27 UFs', () => {
    expect(parseBrazilianState('TO')).toBe('TO');
  });

  it('rejeita UF inexistente', () => {
    expect(() => parseBrazilianState('XX')).toThrow(DomainError);
    expect(() => parseBrazilianState('XX')).toThrow('Estado inválido');
  });
});