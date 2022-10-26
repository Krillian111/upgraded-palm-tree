import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Repository } from 'typeorm';
import { Service } from '../src/services/entities/Service';
import { getRepositoryToken } from '@nestjs/typeorm';

const serviceMatcher = { id: expect.any(Number) };

describe('services', () => {
  const servicesPath = '/services';
  let app: INestApplication;
  let serviceRepo: Repository<Service>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    serviceRepo = moduleFixture.get<Repository<Service>>(
      getRepositoryToken(Service),
    );
    await serviceRepo.clear();
    await app.init();
  });
  afterEach(async () => {
    await app.close();
  });

  describe('GET /services', () => {
    it('returns an empty list of services', () => {
      return request(app.getHttpServer())
        .get(servicesPath)
        .expect(200)
        .expect('content-type', 'application/json; charset=utf-8')
        .expect({ services: [] });
    });
    it('returns a list of services', async () => {
      await request(app.getHttpServer()).post(servicesPath);
      await request(app.getHttpServer()).post(servicesPath);
      const response = await request(app.getHttpServer())
        .get(servicesPath)
        .expect(200)
        .expect('content-type', 'application/json; charset=utf-8');
      expect(response.body).toEqual({
        services: [serviceMatcher, serviceMatcher],
      });
    });
  });
  describe('POST /services', () => {
    it('creates a service', async () => {
      const response = await request(app.getHttpServer())
        .post(servicesPath)
        .expect(201)
        .expect('content-type', 'application/json; charset=utf-8');
      expect(response.body).toEqual({
        service: serviceMatcher,
      });
    });
  });
});
