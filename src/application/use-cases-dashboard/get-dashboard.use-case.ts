import {
  DashboardRepository,
  DashboardSnapshot,
} from '../ports/dashboard.repository';

export class GetDashboardUseCase {
  constructor(private readonly dashboard: DashboardRepository) {}

  execute(): Promise<DashboardSnapshot> {
    return this.dashboard.getSnapshot();
  }
}
