import { Test, TestingModule } from '@nestjs/testing';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { ServicesRepositoryMock } from './__mocks/services.repository.mock';
import { createMockService } from './entities/__mocks/Services.mock';
import { createFindServiceDto } from './dto/__mocks__/FindServices.Dto.mock';

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
    it.each([[[]], [[createFindServiceDto()]]])(
      'returns the Dto as is',
      serviceReturn => {
        const expected = {
          ...mockServiceMetadata,
          services: serviceReturn,
        };
        jest.spyOn(servicesService, 'findAll').mockResolvedValue(expected);
        expect(servicesController.getAll()).resolves.toEqual(expected);
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
  describe('findById', () => {
    it('queries service by Id and returns result', () => {
      const findByIdSpy = jest
        .spyOn(servicesService, 'findById')
        .mockResolvedValue(createMockService());
      const id = 123;
      servicesController.findById(id);
      expect(findByIdSpy).toBeCalledWith(id);
    });
    it('throws NotFoundException if no service is returned', async () => {
      // can't get this to match with .rejects, temporary workaround for now
      jest.spyOn(servicesService, 'findById').mockResolvedValue(undefined);
      try {
        await servicesController.findById(123);
      } catch (e) {
        expect(e.message.message).toEqual(`No Service with id 123`);
      }
    });
  });
});
