import { assertFarmAreas } from './farm-area';
import { DomainError } from '../errors/domain-error';

describe('assertFarmAreas', () => {
  it('aceita soma igual ao total', () => {
    expect(() =>
      assertFarmAreas({ total: 100, arable: 60, vegetation: 40 }),
    ).not.toThrow();
  });

  it('aceita sobra de area (total maior que soma)', () => {
    expect(() =>
      assertFarmAreas({ total: 100, arable: 40, vegetation: 20 }),
    ).not.toThrow();
  });

  it('aceita agricultavel ou vegetação zeradas', () => {
    expect(() =>
      assertFarmAreas({ total: 50, arable: 50, vegetation: 0 }),
    ).not.toThrow();
  });

  it('rejeita soma maior que total', () => {
    expect(() =>
      assertFarmAreas({ total: 100, arable: 60, vegetation: 50 }),
    ).toThrow(DomainError);
    expect(() =>
      assertFarmAreas({ total: 100, arable: 60, vegetation: 50 }),
    ).toThrow(
      'A soma das áreas agricultável e de vegetação não pode ultrapassar a área total',
    );
  });

  it('rejeita area total menor ou igual a zero', () => {
    expect(() =>
      assertFarmAreas({ total: 0, arable: 60, vegetation: 40 }),
    ).toThrow('A área total deve ser maior que zero');
  });

  it('rejeita area negativa', () => {
    expect(() =>
      assertFarmAreas({ total: 100, arable: -10, vegetation: 0 }),
    ).toThrow('As áreas não podem ser negativas');
  });
});
