import { Injectable } from '@nestjs/common';
import {
  DashboardRepository,
  DashboardSnapshot,
} from '../../application/ports/dashboard.repository';
import { PrismaService } from './prisma.service';

@Injectable()
export class DashboardPrismaRepository implements DashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getSnapshot(): Promise<DashboardSnapshot> {
    const [totalFarms, sums, farmsByState, plantingsByCrop] = await Promise.all([
      this.prisma.farm.count(),
      this.prisma.farm.aggregate({
        _sum: {
          totalAreaHa: true,
          arableAreaHa: true,
          vegetationAreaHa: true,
        },
      }),
      this.prisma.farm.groupBy({
        by: ['state'],
        _count: { _all: true },
        orderBy: { state: 'asc' },
      }),
      this.prisma.farmCrop.groupBy({
        by: ['cropId'],
        _count: { _all: true },
      }),
    ]);

    const cropIds = plantingsByCrop.map((row) => row.cropId);
    const crops = cropIds.length
      ? await this.prisma.crop.findMany({ where: { id: { in: cropIds } } })
      : [];
    const cropNameById = new Map(crops.map((crop) => [crop.id, crop.name]));

    const cropsPlanted = plantingsByCrop
      .map((row) => ({
        crop: cropNameById.get(row.cropId) ?? row.cropId,
        count: row._count._all,
      }))
      .sort((a, b) => b.count - a.count || a.crop.localeCompare(b.crop));

    return {
      totalFarms,
      totalHectares: Number(sums._sum.totalAreaHa ?? 0),
      farmsByState: farmsByState.map((row) => ({
        state: row.state,
        count: row._count._all,
      })),
      cropsPlanted,
      landUse: {
        arableHectares: Number(sums._sum.arableAreaHa ?? 0),
        vegetationHectares: Number(sums._sum.vegetationAreaHa ?? 0),
      },
    };
  }
}