import { DomainError } from "../../domain/errors/domain-error";
import { ProducerRepository, ProducerWithFarms } from "../ports/producer.repository";

export class GetProducerUseCase {
    constructor(private readonly producers: ProducerRepository) {}

    async execute(id: string): Promise<ProducerWithFarms> {
        const producer = await this.producers.findById(id);
        if (!producer) {
            throw DomainError.notFound('Produtor não encontrado');
        }
        return producer;
    }
}