import { DomainError } from '../errors/domain-error';

export type DocumentType = 'CPF' | 'CNPJ';

export class Document {
  private constructor(
    public readonly digits: string,
    public readonly type: DocumentType,
  ) {}

  static create(raw: string): Document {
    const digits = raw.replace(/\D/g, '');

    if (digits.length === 11) {
      if (!isValidCpf(digits)) {
        throw DomainError.validation('CPF inválido');
      }
      return new Document(digits, 'CPF');
    }

    if (digits.length === 14) {
      if (!isValidCnpj(digits)) {
        throw DomainError.validation('CNPJ inválido');
      }
      return new Document(digits, 'CNPJ');
    }

    throw DomainError.validation(
      'Documento deve ser CPF (11 dígitos) ou CNPJ (14 dígitos)',
    );
  }

  mask(): string {
    return `***${this.digits.slice(-4)}`;
  }
}

function isValidCpf(digits: string): boolean {
  if (/^(\d)\1{10}$/.test(digits)) {
    return false;
  }

  const checkDigit = (length: number): number => {
    let sum = 0;
    for (let i = 0; i < length; i++) {
      sum += Number(digits[i]) * (length + 1 - i);
    }
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };

  return (
    checkDigit(9) === Number(digits[9]) &&
    checkDigit(10) === Number(digits[10])
  );
}

function isValidCnpj(digits: string): boolean {
  if (/^(\d)\1{13}$/.test(digits)) {
    return false;
  }

  const checkDigit = (base: string, factors: number[]): number => {
    const sum = base
      .split('')
      .reduce((acc, digit, i) => acc + Number(digit) * factors[i], 0);
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  const first = checkDigit(digits.slice(0, 12), [
    5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2,
  ]);
  const second = checkDigit(digits.slice(0, 13), [
    6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2,
  ]);

  return first === Number(digits[12]) && second === Number(digits[13]);
}