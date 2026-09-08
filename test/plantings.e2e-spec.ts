import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { configureApp } from '../src/infrastructure/http/configure-app';
import { PrismaService } from '../src/infrastructure/prisma/prisma.service';

const DOCUMENT = '93541134780';

describe('Plantings (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let farmId: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
    prisma = app.get(PrismaService);

    await prisma.farm.deleteMany({
      where: { producer: { document: DOCUMENT } },
    });
    await prisma.producer.deleteMany({ where: { document: DOCUMENT } });

    const producer = await request(app.getHttpServer())
      .post('/api/v1/producers')
      .send({ name: 'Maria Souza', document: '935.411.347-80' })
      .expect(201);

    const farm = await request(app.getHttpServer())
      .post(`/api/v1/producers/${producer.body.id}/farms`)
      .send({
        name: 'Fazenda Horizonte',
        city: 'Uberaba',
        state: 'MG',
        totalAreaHa: 80,
        arableAreaHa: 50,
        vegetationAreaHa: 20,
      })
      .expect(201);

    farmId = farm.body.id;
  });

  afterEach(async () => {
    if (prisma) {
      await prisma.farm.deleteMany({
        where: { producer: { document: DOCUMENT } },
      });
      await prisma.producer.deleteMany({ where: { document: DOCUMENT } });
    }
    if (app) {
      await app.close();
    }
  });

  it('POST /api/v1/farms/:id/plantings cria plantio', async () => {
    const response = await request(app.getHttpServer())
      .post(`/api/v1/farms/${farmId}/plantings`)
      .send({ harvestName: 'Safra 2021', cropName: 'Soja' })
      .expect(201);

    expect(response.body.harvestName).toBe('Safra 2021');
    expect(response.body.cropName).toBe('Soja');
    expect(response.body.farmId).toBe(farmId);

    const farm = await request(app.getHttpServer())
      .get(`/api/v1/farms/${farmId}`)
      .expect(200);

    expect(farm.body.plantings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          harvestName: 'Safra 2021',
          cropName: 'Soja',
        }),
      ]),
    );
  });

  it('POST rejeita plantio duplicado na mesma fazenda', async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/farms/${farmId}/plantings`)
      .send({ harvestName: 'Safra 2021', cropName: 'Soja' })
      .expect(201);

    const response = await request(app.getHttpServer())
      .post(`/api/v1/farms/${farmId}/plantings`)
      .send({ harvestName: 'safra 2021', cropName: 'soja' })
      .expect(409);

    expect(response.body.status).toBe(409);
  });

  it('DELETE /api/v1/plantings/:id remove o plantio', async () => {
    const created = await request(app.getHttpServer())
      .post(`/api/v1/farms/${farmId}/plantings`)
      .send({ harvestName: 'Safra 2021', cropName: 'Milho' })
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/api/v1/plantings/${created.body.id}`)
      .expect(204);

    const farm = await request(app.getHttpServer())
      .get(`/api/v1/farms/${farmId}`)
      .expect(200);

    expect(farm.body.plantings).toHaveLength(0);
  });
});
