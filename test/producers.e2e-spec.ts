import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { configureApp } from '../src/infrastructure/http/configure-app';
import { PrismaService } from '../src/infrastructure/prisma/prisma.service';

describe('Producers (e2e)', () => {
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
    await prisma.producer.deleteMany({ where: { document: '52998224725' } });
  });

  afterEach(async () => {
    if (prisma) {
      await prisma.producer.deleteMany({ where: { document: '52998224725' } });
    }
    if (app) {
      await app.close();
    }
  });

  it('POST /api/v1/producers cria produtor', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/producers')
      .send({ name: 'João da Silva', document: '529.982.247-25' })
      .expect(201);

    expect(response.body.document).toBe('52998224725');
    expect(response.body.documentType).toBe('CPF');
  });

  it('POST /api/v1/producers rejeita documento duplicado', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/producers')
      .send({ name: 'João da Silva', document: '529.982.247-25' })
      .expect(201);

    const response = await request(app.getHttpServer())
      .post('/api/v1/producers')
      .send({ name: 'Outro', document: '529.982.247-25' })
      .expect(409);

    expect(response.body.status).toBe(409);
  });

  it('POST /api/v1/producers rejeita CPF inválido', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/producers')
      .send({ name: 'João da Silva', document: '111.111.111-11' })
      .expect(422);

    expect(response.body.status).toBe(422);
  });
});
