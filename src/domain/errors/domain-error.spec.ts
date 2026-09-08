import { DomainError } from './domain-error';

describe('DomainError', () => {
    it('cria erro de validação', () => {
        const error = DomainError.validation('CPF inválido');

        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(DomainError);
        expect(error.code).toBe('VALIDATION');
        expect(error.message).toBe('CPF inválido');
        expect(error.name).toBe('DomainError');
    })

    it('cria erro de não encontrado', () => {
        const error = DomainError.notFound('Produtor não encontrado');

        expect(error.code).toBe('NOT_FOUND');
        expect(error.message).toBe('Produtor não encontrado');
    })

    it('cria erro de conflito', () => {
        const error = DomainError.conflict('Documento já cadastrado');

        expect(error.code).toBe('CONFLICT');
        expect(error.message).toBe('Documento já cadastrado');
    })
})