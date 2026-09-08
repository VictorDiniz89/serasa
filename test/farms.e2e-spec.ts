import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { configureApp } from '../src/infrastructure/http/configure-app';
import { PrismaService } from '../src/infrastructure/prisma/prisma.service';

const DOCUMENT = '52998224725';

describe('Farms (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let producerId: string;

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
      .send({ name: 'João da Silva', document: '529.982.247-25' })
      .expect(201);

    producerId = producer.body.id;
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

  it('POST /api/v1/producers/:id/farms cria fazenda', async () => {
    const response = await request(app.getHttpServer())
      .post(`/api/v1/producers/${producerId}/farms`)
      .send({
        name: 'Fazenda Boa Vista',
        city: 'Ribeirão Preto',
        state: 'SP',
        totalAreaHa: 100,
        arableAreaHa: 60,
        vegetationAreaHa: 30,
      })
      .expect(201);

    expect(response.body.state).toBe('SP');
    expect(response.body.totalAreaHa).toBe(100);
    expect(response.body.producerId).toBe(producerId);
  });

  it('POST rejeita soma de áreas maior que o total', async () => {
    const response = await request(app.getHttpServer())
      .post(`/api/v1/producers/${producerId}/farms`)
      .send({
        name: 'Fazenda Estourada',
        city: 'Ribeirão Preto',
        state: 'SP',
        totalAreaHa: 10,
        arableAreaHa: 8,
        vegetationAreaHa: 3,
      })
      .expect(422);

    expect(response.body.status).toBe(422);
  });

  it('POST rejeita UF inexistente', async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/producers/${producerId}/farms`)
      .send({
        name: 'Fazenda XX',
        city: 'Ribeirão Preto',
        state: 'XX',
        totalAreaHa: 10,
        arableAreaHa: 4,
        vegetationAreaHa: 3,
      })
      .expect(400);
  });

  it('DELETE /api/v1/producers/:id retorna 409 se houver fazenda', async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/producers/${producerId}/farms`)
      .send({
        name: 'Fazenda Boa Vista',
        city: 'Ribeirão Preto',
        state: 'SP',
        totalAreaHa: 100,
        arableAreaHa: 60,
        vegetationAreaHa: 30,
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .delete(`/api/v1/producers/${producerId}`)
      .expect(409);

    expect(response.body.status).toBe(409);
  });
});