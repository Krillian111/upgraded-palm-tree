import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

// Skipping because running this in parallel messes with the Database initialization
// I would have to dig into this deeper on how to avoid the e2e tests
// affecting each other via the TypeORM module
describe.skip('app', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });
  afterEach(async () => {
    await app.close();
  });

  describe('GET /healthcheck', () => {
    it('returns app OK', () => {
      return request(app.getHttpServer())
        .get('/healthcheck')
        .expect(200)
        .expect({ app: 'OK' });
    });
  });
});
