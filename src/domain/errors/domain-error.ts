export type DomainErrorType = 'VALIDATION' | 'NOT_FOUND' | 'CONFLICT';

export class DomainError extends Error {
    constructor(
        public readonly code: DomainErrorType,
        message: string,
    ) {
        super(message);
        this.name = 'DomainError';
    }

    static validation(message: string): DomainError {
        return new DomainError('VALIDATION', message);
    }

    static notFound(message: string): DomainError {
        return new DomainError('NOT_FOUND', message);
    }

    static conflict(message: string): DomainError {
        return new DomainError('CONFLICT', message);
    }
}