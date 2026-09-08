export type ProducerRecord = {
    id: string;
    name: string;
    document: string;
    documentType: 'CPF' | 'CNPJ';
    createdAt: Date;
    updatedAt: Date;
  };
  
  export type FarmSummary = {
    id: string;
    name: string;
    city: string;
    state: string;
    totalAreaHa: number;
    arableAreaHa: number;
    vegetationAreaHa: number;
  };
  
  export type ProducerWithFarms = ProducerRecord & { farms: FarmSummary[] };
  
  export const PRODUCER_REPOSITORY = Symbol('PRODUCER_REPOSITORY');
  
  export interface ProducerRepository {
    create(data: {
      name: string;
      document: string;
      documentType: 'CPF' | 'CNPJ';
    }): Promise<ProducerRecord>;
    findMany(
      skip: number,
      take: number,
    ): Promise<{ items: ProducerRecord[]; total: number }>;
    findById(id: string): Promise<ProducerWithFarms | null>;
    update(
      id: string,
      data: Partial<{ name: string; document: string; documentType: 'CPF' | 'CNPJ' }>,
    ): Promise<ProducerRecord>;
    delete(id: string): Promise<void>;
    countFarms(producerId: string): Promise<number>;
  }