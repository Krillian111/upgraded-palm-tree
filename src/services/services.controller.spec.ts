import { Test, TestingModule } from '@nestjs/testing';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { ServicesRepositoryMock } from './__mocks/services.repository.mock';
import { createMockService } from './entities/__mocks/Services.mock';

const mockServiceMetadata = {
  count: 0,
  offset: 10,
  limit: 5,
};
const mockFindAllReturn = {
  ...mockServiceMetadata,
  services: [],
};

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
        jest.spyOn(servicesService, 'findAll').mockResolvedValue({
          ...mockServiceMetadata,
          services: serviceReturn,
        });
        expect(servicesController.getAll()).resolves.toEqual({
          ...mockServiceMetadata,
          services: serviceReturn,
        });
      },
    );
    it('throws service errors', () => {
      const serviceError = new Error('findAll failed');
      jest.spyOn(servicesService, 'findAll').mockRejectedValue(serviceError);
      expect(servicesController.getAll()).rejects.toEqual(serviceError);
    });
    describe('filter', () => {
      it('passes the filter param to service', () => {
        const findAllSpy = jest
          .spyOn(servicesService, 'findAll')
          .mockResolvedValue(mockFindAllReturn);
        servicesController.getAll('someFilter');
        expect(findAllSpy).toBeCalledWith(
          expect.objectContaining({ exactName: 'someFilter' }),
        );
      });
    });
    describe('sorting', () => {
      it.each([
        [{ sortFromQuery: 'ASC', passedParam: 'ASC' }],
        [{ sortFromQuery: 'DESC', passedParam: 'DESC' }],
        [{ sortFromQuery: undefined, passedParam: undefined }],
      ])(
        'passes a valid sort param to service',
        ({ sortFromQuery, passedParam }) => {
          const findAllSpy = jest
            .spyOn(servicesService, 'findAll')
            .mockResolvedValue(mockFindAllReturn);
          servicesController.getAll(undefined, sortFromQuery);
          expect(findAllSpy).toBeCalledWith(
            expect.objectContaining({ sortOrder: passedParam }),
          );
        },
      );
      it('rejects invalid sort values with 400', async () => {
        await expect(() =>
          servicesController.getAll(undefined, 'invalid'),
        ).rejects.toThrow(
          "Invalid 'sort' parameter - expected 'ASC' or 'DESC' but received invalid",
        );
      });
    });
    describe('pagination', () => {
      it('passes limit and offset to service', () => {
        const findAllSpy = jest
          .spyOn(servicesService, 'findAll')
          .mockResolvedValue(mockFindAllReturn);
        servicesController.getAll(undefined, undefined, '20', '10');
        expect(findAllSpy).toBeCalledWith({ limit: 20, offset: 10 });
      });
      it('passes default values to service', () => {
        const findAllSpy = jest
          .spyOn(servicesService, 'findAll')
          .mockResolvedValue(mockFindAllReturn);
        servicesController.getAll(undefined, undefined, undefined, undefined);
        expect(findAllSpy).toBeCalledWith({
          limit: ServicesController.LIMIT_DEFAULT,
          offset: ServicesController.OFFSET_DEFAULT,
        });
      });
      it.each([
        [{ limit: '20', offset: undefined }],
        [{ limit: undefined, offset: '20' }],
      ])(
        'throws if not both limit and offset are present',
        async ({ limit, offset }) => {
          await expect(() =>
            servicesController.getAll(undefined, undefined, limit, offset),
          ).rejects.toThrowError(
            `Invalid 'limit'/'offset' parameters - expected both but received '${limit}'/'${offset}'`,
          );
        },
      );
      it('throws if limit > threshold', async () => {
        // can't get this to match with .rejects, temporary workaround for now
        try {
          await servicesController.getAll(undefined, undefined, '101', '20');
          fail('expect to fail with threshold violation');
        } catch (e) {
          expect(e.message.message).toEqual(
            "Invalid 'limit' parameter - expected integer <=100 but received 101",
          );
        }
      });
    });
  });
});
