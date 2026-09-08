import { Injectable } from '@nestjs/common';
import {
  FarmDetail,
  FarmRecord,
  FarmRepository,
} from '../../application/ports/farm.repository';
import { PrismaService } from './prisma.service';

@Injectable()
export class FarmPrismaRepository implements FarmRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    producerId: string;
    name: string;
    city: string;
    state: string;
    totalAreaHa: number;
    arableAreaHa: number;
    vegetationAreaHa: number;
  }): Promise<FarmRecord> {
    const farm = await this.prisma.farm.create({ data });
    return this.toRecord(farm);
  }

  async findById(id: string): Promise<FarmDetail | null> {
    const farm = await this.prisma.farm.findUnique({
      where: { id },
      include: {
        plantings: { include: { harvest: true, crop: true } },
      },
    });
    if (!farm) {
      return null;
    }

    return {
      ...this.toRecord(farm),
      plantings: farm.plantings.map((planting) => ({
        id: planting.id,
        harvestName: planting.harvest.name,
        cropName: planting.crop.name,
      })),
    };
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      city: string;
      state: string;
      totalAreaHa: number;
      arableAreaHa: number;
      vegetationAreaHa: number;
    }>,
  ): Promise<FarmRecord> {
    const farm = await this.prisma.farm.update({ where: { id }, data });
    return this.toRecord(farm);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.farm.delete({ where: { id } });
  }

  private toRecord(farm: {
    id: string;
    producerId: string;
    name: string;
    city: string;
    state: string;
    totalAreaHa: { toString(): string } | number;
    arableAreaHa: { toString(): string } | number;
    vegetationAreaHa: { toString(): string } | number;
    createdAt: Date;
    updatedAt: Date;
  }): FarmRecord {
    return {
      id: farm.id,
      producerId: farm.producerId,
      name: farm.name,
      city: farm.city,
      state: farm.state,
      totalAreaHa: Number(farm.totalAreaHa),
      arableAreaHa: Number(farm.arableAreaHa),
      vegetationAreaHa: Number(farm.vegetationAreaHa),
      createdAt: farm.createdAt,
      updatedAt: farm.updatedAt,
    };
  }
}