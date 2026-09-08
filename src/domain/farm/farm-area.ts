import { DomainError } from '../errors/domain-error';

export type FarmAreas = {
  total: number;
  arable: number;
  vegetation: number;
};

export function assertFarmAreas(areas: FarmAreas): void {
  const { total, arable, vegetation } = areas;

  if (arable < 0 || vegetation < 0 || total < 0) {
    throw DomainError.validation('As áreas não podem ser negativas');
  }

  if (total <= 0) {
    throw DomainError.validation('A área total deve ser maior que zero');
  }

  if (arable + vegetation > total) {
    throw DomainError.validation(
      'A soma das áreas agricultável e de vegetação não pode ultrapassar a área total',
    );
  }
}