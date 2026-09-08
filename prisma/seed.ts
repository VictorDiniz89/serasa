import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Document } from '../src/domain/document/document';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function upsertProducer(name: string, rawDocument: string) {
  const document = Document.create(rawDocument);
  return prisma.producer.upsert({
    where: { document: document.digits },
    create: {
      name,
      document: document.digits,
      documentType: document.type,
    },
    update: { name },
  });
}

async function ensureFarm(
  producerId: string,
  data: {
    name: string;
    city: string;
    state: string;
    totalAreaHa: number;
    arableAreaHa: number;
    vegetationAreaHa: number;
  },
) {
  const existing = await prisma.farm.findFirst({
    where: { producerId, name: data.name },
  });
  if (existing) {
    return existing;
  }
  return prisma.farm.create({ data: { producerId, ...data } });
}

async function ensurePlanting(
  farmId: string,
  harvestName: string,
  cropName: string,
) {
  const harvest = await prisma.harvest.upsert({
    where: { nameKey: harvestName.toLowerCase() },
    create: { name: harvestName, nameKey: harvestName.toLowerCase() },
    update: {},
  });
  const crop = await prisma.crop.upsert({
    where: { nameKey: cropName.toLowerCase() },
    create: { name: cropName, nameKey: cropName.toLowerCase() },
    update: {},
  });

  await prisma.farmCrop.upsert({
    where: {
      farmId_harvestId_cropId: {
        farmId,
        harvestId: harvest.id,
        cropId: crop.id,
      },
    },
    create: { farmId, harvestId: harvest.id, cropId: crop.id },
    update: {},
  });
}

async function main() {
  const carlos = await upsertProducer('Carlos Souza', '111.444.777-35');
  const ana = await upsertProducer('Ana Lima', '390.533.447-05');
  const agro = await upsertProducer('Agro Cerrado Ltda', '11.222.333/0001-81');

  const sp = await ensureFarm(carlos.id, {
    name: 'Fazenda Santa Rita',
    city: 'Ribeirão Preto',
    state: 'SP',
    totalAreaHa: 150,
    arableAreaHa: 90,
    vegetationAreaHa: 40,
  });

  const mt = await ensureFarm(ana.id, {
    name: 'Fazenda Pantanal',
    city: 'Sorriso',
    state: 'MT',
    totalAreaHa: 400,
    arableAreaHa: 280,
    vegetationAreaHa: 80,
  });

  const go = await ensureFarm(agro.id, {
    name: 'Fazenda Cerrado',
    city: 'Rio Verde',
    state: 'GO',
    totalAreaHa: 220,
    arableAreaHa: 140,
    vegetationAreaHa: 50,
  });

  await ensurePlanting(sp.id, 'Safra 2024', 'Soja');
  await ensurePlanting(sp.id, 'Safra 2024', 'Milho');
  await ensurePlanting(mt.id, 'Safra 2024', 'Soja');
  await ensurePlanting(go.id, 'Safra 2024', 'Café');

  console.log('Seed ok: 3 produtores, 3 fazendas (SP, MT, GO), 4 plantios');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });