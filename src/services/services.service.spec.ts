import { Test, TestingModule } from '@nestjs/testing';
import { ServicesService } from './services.service';
import { ServicesRepositoryMock } from './__mocks/services.repository.mock';
import { Service } from './entities/Service';

describe('ServicesService', () => {
  let servicesService: ServicesService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [ServicesService, ServicesRepositoryMock.provider],
    }).compile();
    servicesService = app.get<ServicesService>(ServicesService);
  });
  describe('findAll', () => {
    it('returns an empty list', () => {
      jest.spyOn(ServicesRepositoryMock.instance, 'find').mockResolvedValue([]);
      expect(servicesService.findAll()).resolves.toEqual([]);
    });
    it('throws database error', () => {
      const dbFindError = new Error('find failed');
      jest
        .spyOn(ServicesRepositoryMock.instance, 'find')
        .mockRejectedValue(dbFindError);
      expect(() => servicesService.findAll()).rejects.toEqual(dbFindError);
    });
  });

  describe('create', () => {
    it('creates and saves an entity', () => {
      const toCreate: Service = {
        id: 1,
      };
      jest
        .spyOn(ServicesRepositoryMock.instance, 'create')
        .mockReturnValue(toCreate);
      jest
        .spyOn(ServicesRepositoryMock.instance, 'save')
        .mockResolvedValue({ ...toCreate });
      expect(servicesService.create()).resolves.toEqual(toCreate);
      expect(ServicesRepositoryMock.instance.save).toBeCalledWith(toCreate);
    });
    it('throws db save error', () => {
      const dbSaveError = new Error('create failed');
      jest
        .spyOn(ServicesRepositoryMock.instance, 'save')
        .mockRejectedValue(dbSaveError);
      expect(() => servicesService.create()).rejects.toEqual(dbSaveError);
    });
  });
});
