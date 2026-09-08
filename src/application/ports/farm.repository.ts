export type FarmRecord = {
    id: string;
    producerId: string;
    name: string;
    city: string;
    state: string;
    totalAreaHa: number;
    arableAreaHa: number;
    vegetationAreaHa: number;
    createdAt: Date;
    updatedAt: Date;
  };
  
  export type FarmPlanting = {
    id: string;
    harvestName: string;
    cropName: string;
  };
  
  export type FarmDetail = FarmRecord & { plantings: FarmPlanting[] };
  
  export const FARM_REPOSITORY = Symbol('FARM_REPOSITORY');
  
  export interface FarmRepository {
    create(data: {
      producerId: string;
      name: string;
      city: string;
      state: string;
      totalAreaHa: number;
      arableAreaHa: number;
      vegetationAreaHa: number;
    }): Promise<FarmRecord>;
    findById(id: string): Promise<FarmDetail | null>;
    update(
      id: string,
      data: Partial<{
        name: string;
        city: string;
        state: string;
        totalAreaHa: number;
        arableAreaHa: number;
        vegetationAreaHa: number;
      }>,
    ): Promise<FarmRecord>;
    delete(id: string): Promise<void>;
  }