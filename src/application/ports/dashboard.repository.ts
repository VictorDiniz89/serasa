export type DashboardSnapshot = {
    totalFarms: number;
    totalHectares: number;
    farmsByState: { state: string; count: number }[];
    cropsPlanted: { crop: string; count: number }[];
    landUse: { arableHectares: number; vegetationHectares: number };
  };
  
  export const DASHBOARD_REPOSITORY = Symbol('DASHBOARD_REPOSITORY');
  
  export interface DashboardRepository {
    getSnapshot(): Promise<DashboardSnapshot>;
  }