import { Document } from "../../domain/document/document";
import { ProducerRepository, ProducerRecord } from "../ports/producer.repository";

export class CreateProducerUseCase {
    constructor(private readonly producers: ProducerRepository) {}

    execute(input: {name: string, document: string}): Promise<ProducerRecord> {
        const document = Document.create(input.document);
        return this.producers.create({
            name: input.name.trim(),
            document: document.digits,
            documentType: document.type,
        });
    }
}