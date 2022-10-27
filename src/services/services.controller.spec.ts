import { Test, TestingModule } from '@nestjs/testing';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { ServicesRepositoryMock } from './__mocks/services.repository.mock';
import { createMockService } from './entities/__mocks/Services.mock';

describe('ServicesController', () => {
  let servicesController: ServicesController;
  let servicesService: ServicesService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ServicesController],
      providers: [ServicesService, ServicesRepositoryMock.provider],
    }).compile();

    servicesController = app.get<ServicesController>(ServicesController);
    servicesService = app.get<ServicesService>(ServicesService);
  });

  describe('getAll', () => {
    it.each([[[]], [[createMockService({ collapsed: true })]]])(
      'nests the service response in an object',
      serviceReturn => {
        jest.spyOn(servicesService, 'findAll').mockResolvedValue(serviceReturn);
        expect(servicesController.getAll()).resolves.toEqual({
          services: serviceReturn,
        });
      },
    );
    it('passes the filter to service', () => {
      const findAllSpy = jest
        .spyOn(servicesService, 'findAll')
        .mockResolvedValue([]);
      servicesController.getAll('someFilter');
      expect(findAllSpy).toBeCalledWith({ exactName: 'someFilter' });
    });

    it('throws service errors', () => {
      const serviceError = new Error('findAll failed');
      jest.spyOn(servicesService, 'findAll').mockRejectedValue(serviceError);
      expect(servicesController.getAll()).rejects.toEqual(serviceError);
    });
  });
});
