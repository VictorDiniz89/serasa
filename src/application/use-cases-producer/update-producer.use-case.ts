import { Document } from '../../domain/document/document';
import { DomainError } from '../../domain/errors/domain-error';
import { ProducerRecord, ProducerRepository } from '../ports/producer.repository';

export class UpdateProducerUseCase {
  constructor(private readonly producers: ProducerRepository) {}

  async execute(
    id: string,
    input: { name?: string; document?: string },
  ): Promise<ProducerRecord> {
    const existing = await this.producers.findById(id);
    if (!existing) {
      throw DomainError.notFound('Produtor não encontrado');
    }

    const data: Partial<{ name: string; document: string; documentType: 'CPF' | 'CNPJ' }> = {};
    if (input.name !== undefined) {
      data.name = input.name.trim();
    }
    if (input.document !== undefined) {
      const document = Document.create(input.document);
      data.document = document.digits;
      data.documentType = document.type;
    }

    return this.producers.update(id, data);
  }
}