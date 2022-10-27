import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Repository } from 'typeorm';
import { Service } from '../src/services/entities/Service';
import { getRepositoryToken } from '@nestjs/typeorm';

const servicesMetadataMatcher = {
  offset: expect.any(Number),
  limit: expect.any(Number),
  count: expect.any(Number),
};

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
    it('returns an empty list of services', async () => {
      const response = await request(app.getHttpServer())
        .get(servicesPath)
        .expect(200)
        .expect('content-type', 'application/json; charset=utf-8');
      expect(response.body).toEqual({
        ...servicesMetadataMatcher,
        services: [],
      });
    });
    it('returns a list of services', async () => {
      await request(app.getHttpServer()).post(servicesPath);
      await request(app.getHttpServer()).post(servicesPath);
      const response = await request(app.getHttpServer())
        .get(servicesPath)
        .expect(200);
      expect(response.body).toEqual({
        ...servicesMetadataMatcher,
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
        expect(response.body).toEqual(
          expect.objectContaining({
            services: [{ ...servicesMatcher, name: 'BarService' }],
          }),
        );
      });
    });
    describe('sorting', () => {
      it.each([
        [{ sortOrder: 'ASC', expectedOrder: ['a', 'b', 'c'] }],
        [{ sortOrder: 'DESC', expectedOrder: ['c', 'b', 'a'] }],
        [{ sortOrder: undefined, expectedOrder: ['a', 'c', 'b'] }],
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
          expect(response.body).toEqual(
            expect.objectContaining({
              services: expectedOrder.map(name => ({
                ...servicesMatcher,
                name,
              })),
            }),
          );
        },
      );
      it('returns 400 for invalid sort parameter', async () => {
        return request(app.getHttpServer())
          .get(servicesPath)
          .query({ sort: 'invalid' })
          .expect(400);
      });
    });
    describe('pagination', () => {
      it('returns a specific page when queried with offset and limit', async () => {
        const ascendingNames = new Array(20)
          .fill(null)
          .map((_, idx) => String.fromCharCode('a'.charCodeAt(0) + idx));
        await Promise.all(
          ascendingNames.map(name =>
            request(app.getHttpServer())
              .post(servicesPath)
              .send({ name }),
          ),
        );
        const response1 = await request(app.getHttpServer())
          .get(servicesPath)
          .query({ offset: 0, limit: 5, sort: 'ASC' })
          .expect(200);
        expect(response1.body).toEqual({
          services: ascendingNames
            .slice(0, 5)
            .map(name => ({ ...servicesMatcher, name })),
          limit: 5,
          offset: 0,
          count: 20,
        });
        const response2 = await request(app.getHttpServer())
          .get(servicesPath)
          .query({ offset: 10, limit: 10, sort: 'ASC' })
          .expect(200);
        expect(response2.body).toEqual({
          services: ascendingNames
            .slice(10, 20)
            .map(name => expect.objectContaining({ ...servicesMatcher, name })),
          count: 20,
          limit: 10,
          offset: 10,
        });
      });
      it('returns 400 for limits >100', async () => {
        await request(app.getHttpServer())
          .get(servicesPath)
          .query({ offset: 0, limit: 101 })
          .expect(400);
      });
      it.each([[{ limit: 'abc', offset: 10 }], [{ limit: 10, offset: null }]])(
        'returns 400 for non-integer values',
        async ({ limit, offset }) => {
          await request(app.getHttpServer())
            .get(servicesPath)
            .query({ offset, limit })
            .expect(400);
        },
      );
      it.each([
        [{ limit: undefined, offset: 10 }],
        [{ limit: 10, offset: undefined }],
      ])('returns 400 for missing limit or offset', async query => {
        await request(app.getHttpServer())
          .get(servicesPath)
          .query(query)
          .expect(400);
      });
    });
  });
  describe('GET /services/:service_id', () => {
    it('returns all properties of a single service', async () => {
      const postedService = { name: 'SingleService' };
      const postResponse = await request(app.getHttpServer())
        .post(servicesPath)
        .send(postedService);
      const getResponse = await request(app.getHttpServer())
        .get(`${servicesPath}/${postResponse.body.id}`)
        .expect(200)
        .expect('content-type', 'application/json; charset=utf-8');
      expect(getResponse.body).toEqual({
        ...singleServiceMatcher,
        ...postedService,
      });
    });
    it('returns 404 for non-existing service', async () => {
      const response = await request(app.getHttpServer())
        .get(`${servicesPath}/123`)
        .expect(404);
      expect(response.body.message).toEqual('No Service with id 123');
    });
    it.each(['invalidId', null])(
      'returns 400 for non-numeric id',
      async invalidId => {
        await request(app.getHttpServer())
          .get(`${servicesPath}/${invalidId}`)
          .expect(400);
      },
    );
  });
  describe('POST /services', () => {
    it('creates a service', async () => {
      const name = 'TestService';
      const response = await request(app.getHttpServer())
        .post(servicesPath)
        .send({ name })
        .expect(201)
        .expect('content-type', 'application/json; charset=utf-8');
      expect(response.body).toEqual({ ...singleServiceMatcher, name });
    });
  });
});
