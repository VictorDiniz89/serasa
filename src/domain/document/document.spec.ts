import { Document } from './document';
import { DomainError } from '../errors/domain-error';

describe('Document', () => {
  it('aceita CPF com máscara e guarda só dígitos', () => {
    const document = Document.create('529.982.247-25');

    expect(document.type).toBe('CPF');
    expect(document.digits).toBe('52998224725');
  });

  it('aceita CNPJ com máscara', () => {
    const document = Document.create('11.222.333/0001-81');

    expect(document.type).toBe('CNPJ');
    expect(document.digits).toBe('11222333000181');
  });

  it('mascara mostrando só os 4 últimos dígitos', () => {
    const document = Document.create('52998224725');

    expect(document.mask()).toBe('***4725');
  });

  it('rejeita CPF com digitos iguais', () => {
    expect(() => Document.create('111.111.111-11')).toThrow(DomainError);
    expect(() => Document.create('111.111.111-11')).toThrow('CPF inválido');
  });

  it('rejeita CPF com digito verificador errado', () => {
    expect(() => Document.create('123.456.789-01')).toThrow(DomainError);
  });

  it('rejeita tamanho que não é cpf e nem cnpj', () => {
    expect(() => Document.create('123456789001')).toThrow(DomainError);
    expect(() => Document.create('123456789001')).toThrow(
      'Documento deve ser CPF (11 dígitos) ou CNPJ (14 dígitos',
    );
  });
});
