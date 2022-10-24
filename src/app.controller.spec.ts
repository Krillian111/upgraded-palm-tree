import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('getHealthcheck', () => {
    it('should app: OK', () => {
      expect(appController.getHealthcheck()).toEqual({ app: 'OK' });
    });
  });
});
