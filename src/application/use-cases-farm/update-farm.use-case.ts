import { assertFarmAreas } from '../../domain/farm/farm-area';
import { parseBrazilianState } from '../../domain/farm/brazilian-state';
import { DomainError } from '../../domain/errors/domain-error';
import { FarmRecord, FarmRepository } from '../ports/farm.repository';

export class UpdateFarmUseCase {
  constructor(private readonly farms: FarmRepository) {}

  async execute(
    id: string,
    input: {
      name?: string;
      city?: string;
      state?: string;
      totalAreaHa?: number;
      arableAreaHa?: number;
      vegetationAreaHa?: number;
    },
  ): Promise<FarmRecord> {
    const existing = await this.farms.findById(id);
    if (!existing) {
      throw DomainError.notFound('Fazenda não encontrada');
    }

    const name = input.name !== undefined ? input.name.trim() : existing.name;
    const city = input.city !== undefined ? input.city.trim() : existing.city;
    const state =
      input.state !== undefined ? parseBrazilianState(input.state) : existing.state;
    const totalAreaHa = input.totalAreaHa ?? existing.totalAreaHa;
    const arableAreaHa = input.arableAreaHa ?? existing.arableAreaHa;
    const vegetationAreaHa = input.vegetationAreaHa ?? existing.vegetationAreaHa;

    assertFarmAreas({
      total: totalAreaHa,
      arable: arableAreaHa,
      vegetation: vegetationAreaHa,
    });

    return this.farms.update(id, {
      name,
      city,
      state,
      totalAreaHa,
      arableAreaHa,
      vegetationAreaHa,
    });
  }
}