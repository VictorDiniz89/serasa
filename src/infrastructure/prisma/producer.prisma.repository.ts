import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DomainError } from '../../domain/errors/domain-error';
import {
  ProducerRecord,
  ProducerRepository,
  ProducerWithFarms,
} from '../../application/ports/producer.repository';
import { PrismaService } from './prisma.service';

@Injectable()
export class ProducerPrismaRepository implements ProducerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    name: string;
    document: string;
    documentType: 'CPF' | 'CNPJ';
  }): Promise<ProducerRecord> {
    try {
      return await this.prisma.producer.create({ data });
    } catch (error) {
      this.rethrowUnique(error);
    }
  }

  async findMany(skip: number, take: number) {
    const [items, total] = await Promise.all([
      this.prisma.producer.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.producer.count(),
    ]);
    return { items, total };
  }

  async findById(id: string): Promise<ProducerWithFarms | null> {
    const producer = await this.prisma.producer.findUnique({
      where: { id },
      include: { farms: true },
    });
    if (!producer) {
      return null;
    }

    return {
      ...producer,
      farms: producer.farms.map((farm) => ({
        id: farm.id,
        name: farm.name,
        city: farm.city,
        state: farm.state,
        totalAreaHa: Number(farm.totalAreaHa),
        arableAreaHa: Number(farm.arableAreaHa),
        vegetationAreaHa: Number(farm.vegetationAreaHa),
      })),
    };
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      document: string;
      documentType: 'CPF' | 'CNPJ';
    }>,
  ): Promise<ProducerRecord> {
    try {
      return await this.prisma.producer.update({ where: { id }, data });
    } catch (error) {
      this.rethrowUnique(error);
    }
  }

  async delete(id: string): Promise<void> {
    await this.prisma.producer.delete({ where: { id } });
  }

  countFarms(producerId: string): Promise<number> {
    return this.prisma.farm.count({ where: { producerId } });
  }

  private rethrowUnique(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw DomainError.conflict('Documento já cadastrado');
    }
    throw error;
  }
}
