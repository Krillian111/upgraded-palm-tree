import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('app', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
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
