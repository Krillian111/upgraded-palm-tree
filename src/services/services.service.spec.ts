import { Test, TestingModule } from '@nestjs/testing';
import { ServicesService } from './services.service';
import { ServicesRepositoryMock } from './__mocks/services.repository.mock';
import { createMockService } from './entities/__mocks/Services.mock';

describe('ServicesService', () => {
  let servicesService: ServicesService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [ServicesService, ServicesRepositoryMock.provider],
    }).compile();
    servicesService = app.get<ServicesService>(ServicesService);
  });
  describe('findAll', () => {
    it.each([[[]], [[createMockService({ collapsed: true })]]])(
      'passes on what find returns',
      repoReturn => {
        jest
          .spyOn(ServicesRepositoryMock.instance, 'find')
          .mockResolvedValue(repoReturn);
        expect(servicesService.findAll()).resolves.toEqual(repoReturn);
      },
    );
    it('selects subset of relevant columns', () => {
      const repoSpy = jest
        .spyOn(ServicesRepositoryMock.instance, 'find')
        .mockResolvedValue([]);
      servicesService.findAll();
      expect(repoSpy).toBeCalledWith({
        select: ['id', 'name', 'description', 'versions'],
      });
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
      const toCreate = createMockService();
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
