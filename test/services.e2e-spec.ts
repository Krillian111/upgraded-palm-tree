import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Repository } from 'typeorm';
import { Service } from '../src/services/entities/Service';
import { getRepositoryToken } from '@nestjs/typeorm';

const servicesMatcher = {
  id: expect.any(Number),
  name: expect.any(String),
  description: expect.any(String),
  versions: expect.any(Number),
};
const matchIsoDate = expect.stringMatching(
  /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/,
);
const singleServiceMatcher = {
  ...servicesMatcher,
  createdAt: matchIsoDate,
  updatedAt: matchIsoDate,
};

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
        .expect(200);
      expect(response.body).toEqual({
        services: [servicesMatcher, servicesMatcher],
      });
    });
    describe('errors', () => {
      it('returns 500 with generic error message for internal error', async () => {
        jest
          .spyOn(serviceRepo, 'find')
          .mockRejectedValueOnce(new Error('some db error'));
        await request(app.getHttpServer())
          .get(servicesPath)
          .expect(500)
          .expect({
            // NestJS questions out of curiosity: Why is this message slightly
            // different to new InternalServerErrorException().message?
            statusCode: 500,
            message: 'Internal server error',
          });
      });
    });
    describe('filter', () => {
      it('returns a list of services with exact match of name', async () => {
        await request(app.getHttpServer())
          .post(servicesPath)
          .send({ name: 'FooService' });
        await request(app.getHttpServer())
          .post(servicesPath)
          .send({ name: 'BarService' });
        const response = await request(app.getHttpServer())
          .get(servicesPath)
          .query({ filter: 'BarService' })
          .expect(200);
        expect(response.body).toEqual({
          services: [{ ...servicesMatcher, name: 'BarService' }],
        });
      });
    });
    describe('sorting', () => {
      it.each([
        [{ sortOrder: 'ASC', expectedOrder: ['a', 'b', 'c'] }],
        [{ sortOrder: 'DESC', expectedOrder: ['c', 'b', 'a'] }],
        [{ sortOrder: undefined, expectedOrder: ['a', 'b', 'c'] }],
      ])(
        'returns list of services sorted by name',
        async ({ sortOrder, expectedOrder }) => {
          await Promise.all(
            ['a', 'c', 'b'].map(name => {
              return request(app.getHttpServer())
                .post(servicesPath)
                .send({ name });
            }),
          );
          const response = await request(app.getHttpServer())
            .get(servicesPath)
            .query({ sort: sortOrder })
            .expect(200);
          expect(response.body).toEqual({
            services: expectedOrder.map(name => ({ ...servicesMatcher, name })),
          });
        },
      );
      it('returns 400 for invalid sort parameter', async () => {
        return request(app.getHttpServer())
          .get(servicesPath)
          .query({ sort: 'invalid' })
          .expect(400);
      });
    });
  });
  describe('POST /services', () => {
    it('creates a service', async () => {
      const name = 'TestService';
      const response = await request(app.getHttpServer())
        .post(servicesPath)
        .send({ name })
        .expect(201)
        .expect('content-type', 'application/json; charset=utf-8');
      expect(response.body).toEqual({
        service: { ...singleServiceMatcher, name },
      });
    });
  });
});
