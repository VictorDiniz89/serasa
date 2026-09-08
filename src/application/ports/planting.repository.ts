export type PlantingRecord = {
    id: string;
    farmId: string;
    harvestName: string;
    cropName: string;
    createdAt: Date;
  };
  
  export const PLANTING_REPOSITORY = Symbol('PLANTING_REPOSITORY');
  
  export interface PlantingRepository {
    create(
      farmId: string,
      harvestName: string,
      cropName: string,
    ): Promise<PlantingRecord>;
    findById(id: string): Promise<PlantingRecord | null>;
    delete(id: string): Promise<void>;
  }