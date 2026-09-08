import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DomainError } from '../../domain/errors/domain-error';
import {
  PlantingRecord,
  PlantingRepository,
} from '../../application/ports/planting.repository';
import { PrismaService } from './prisma.service';

@Injectable()
export class PlantingPrismaRepository implements PlantingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    farmId: string,
    harvestName: string,
    cropName: string,
  ): Promise<PlantingRecord> {
    const harvest = await this.prisma.harvest.upsert({
      where: { nameKey: harvestName.toLowerCase() },
      create: { name: harvestName, nameKey: harvestName.toLowerCase() },
      update: {},
    });

    const crop = await this.prisma.crop.upsert({
      where: { nameKey: cropName.toLowerCase() },
      create: { name: cropName, nameKey: cropName.toLowerCase() },
      update: {},
    });

    try {
      const planting = await this.prisma.farmCrop.create({
        data: {
          farmId,
          harvestId: harvest.id,
          cropId: crop.id,
        },
        include: { harvest: true, crop: true },
      });
      return this.toRecord(planting);
    } catch (error) {
      this.rethrowDuplicate(error);
    }
  }

  async findById(id: string): Promise<PlantingRecord | null> {
    const planting = await this.prisma.farmCrop.findUnique({
      where: { id },
      include: { harvest: true, crop: true },
    });
    return planting ? this.toRecord(planting) : null;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.farmCrop.delete({ where: { id } });
  }

  private toRecord(planting: {
    id: string;
    farmId: string;
    createdAt: Date;
    harvest: { name: string };
    crop: { name: string };
  }): PlantingRecord {
    return {
      id: planting.id,
      farmId: planting.farmId,
      harvestName: planting.harvest.name,
      cropName: planting.crop.name,
      createdAt: planting.createdAt,
    };
  }

  private rethrowDuplicate(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw DomainError.conflict(
        'Plantio já cadastrado para esta fazenda, safra e cultura',
      );
    }
    throw error;
  }
}