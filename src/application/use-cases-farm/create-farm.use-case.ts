import { assertFarmAreas } from '../../domain/farm/farm-area';
import { parseBrazilianState } from '../../domain/farm/brazilian-state';
import { DomainError } from '../../domain/errors/domain-error';
import { ProducerRepository } from '../ports/producer.repository';
import { FarmRecord, FarmRepository } from '../ports/farm.repository';

export class CreateFarmUseCase {
  constructor(
    private readonly producers: ProducerRepository,
    private readonly farms: FarmRepository,
  ) {}

  async execute(
    producerId: string,
    input: {
      name: string;
      city: string;
      state: string;
      totalAreaHa: number;
      arableAreaHa: number;
      vegetationAreaHa: number;
    },
  ): Promise<FarmRecord> {
    const producer = await this.producers.findById(producerId);
    if (!producer) {
      throw DomainError.notFound('Produtor não encontrado');
    }

    const state = parseBrazilianState(input.state);
    assertFarmAreas({
      total: input.totalAreaHa,
      arable: input.arableAreaHa,
      vegetation: input.vegetationAreaHa,
    });

    return this.farms.create({
      producerId,
      name: input.name.trim(),
      city: input.city.trim(),
      state,
      totalAreaHa: input.totalAreaHa,
      arableAreaHa: input.arableAreaHa,
      vegetationAreaHa: input.vegetationAreaHa,
    });
  }
}
