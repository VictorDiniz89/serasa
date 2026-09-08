import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { configureApp } from '../src/infrastructure/http/configure-app';
import { PrismaService } from '../src/infrastructure/prisma/prisma.service';

const DOCUMENT = '11222333000181';

describe('Dashboard (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
    prisma = app.get(PrismaService);

    await prisma.farm.deleteMany({ where: { producer: { document: DOCUMENT } } });
    await prisma.producer.deleteMany({ where: { document: DOCUMENT } });

    const producer = await request(app.getHttpServer())
      .post('/api/v1/producers')
      .send({ name: 'Agro Horizonte', document: '11.222.333/0001-81' })
      .expect(201);

    const sp = await request(app.getHttpServer())
      .post(`/api/v1/producers/${producer.body.id}/farms`)
      .send({
        name: 'Fazenda SP',
        city: 'Ribeirão Preto',
        state: 'SP',
        totalAreaHa: 100,
        arableAreaHa: 60,
        vegetationAreaHa: 30,
      })
      .expect(201);

    const mg = await request(app.getHttpServer())
      .post(`/api/v1/producers/${producer.body.id}/farms`)
      .send({
        name: 'Fazenda MG',
        city: 'Uberaba',
        state: 'MG',
        totalAreaHa: 50,
        arableAreaHa: 20,
        vegetationAreaHa: 20,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/v1/farms/${sp.body.id}/plantings`)
      .send({ harvestName: 'Safra 2021', cropName: 'Soja' })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/v1/farms/${sp.body.id}/plantings`)
      .send({ harvestName: 'Safra 2021', cropName: 'Milho' })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/v1/farms/${mg.body.id}/plantings`)
      .send({ harvestName: 'Safra 2021', cropName: 'Soja' })
      .expect(201);
  });

  afterEach(async () => {
    if (prisma) {
      await prisma.farm.deleteMany({ where: { producer: { document: DOCUMENT } } });
      await prisma.producer.deleteMany({ where: { document: DOCUMENT } });
    }
    if (app) {
      await app.close();
    }
  });

  it('GET /api/v1/dashboard agrega fazendas, culturas e uso do solo', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/dashboard')
      .expect(200);

    expect(response.body.totalFarms).toBeGreaterThanOrEqual(2);
    expect(response.body.totalHectares).toBeGreaterThanOrEqual(150);
    expect(response.body.landUse.arableHectares).toBeGreaterThanOrEqual(80);
    expect(response.body.landUse.vegetationHectares).toBeGreaterThanOrEqual(50);

    expect(response.body.farmsByState).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ state: 'SP', count: expect.any(Number) }),
        expect.objectContaining({ state: 'MG', count: expect.any(Number) }),
      ]),
    );

    expect(response.body.cropsPlanted).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ crop: 'Soja', count: expect.any(Number) }),
        expect.objectContaining({ crop: 'Milho', count: expect.any(Number) }),
      ]),
    );

    const soja = response.body.cropsPlanted.find(
      (item: { crop: string }) => item.crop === 'Soja',
    );
    const milho = response.body.cropsPlanted.find(
      (item: { crop: string }) => item.crop === 'Milho',
    );
    expect(soja.count).toBeGreaterThanOrEqual(2);
    expect(milho.count).toBeGreaterThanOrEqual(1);
  });
});