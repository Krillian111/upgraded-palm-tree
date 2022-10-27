import { Test, TestingModule } from '@nestjs/testing';
import { ServicesService, ValidSortOrder } from './services.service';
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
        expect(servicesService.findAll({})).resolves.toEqual(repoReturn);
      },
    );
    it('selects subset of relevant columns', () => {
      const repoSpy = jest
        .spyOn(ServicesRepositoryMock.instance, 'find')
        .mockResolvedValue([]);
      servicesService.findAll({});
      expect(repoSpy).toBeCalledWith({
        select: ['id', 'name', 'description', 'versions'],
      });
    });
    it('filters for exact name matches', () => {
      const repoSpy = jest
        .spyOn(ServicesRepositoryMock.instance, 'find')
        .mockResolvedValue([]);
      const exactName = 'someName';
      servicesService.findAll({ exactName });
      expect(repoSpy).toBeCalledWith(
        expect.objectContaining({
          where: { name: exactName },
        }),
      );
    });
    it.each([
      [{ sortOrder: 'ASC', query: { order: { name: 'ASC' } } }],
      [{ sortOrder: 'DESC', query: { order: { name: 'DESC' } } }],
    ])(
      'sorts by name',
      ({ sortOrder, query }: { sortOrder: ValidSortOrder; query }) => {
        const repoSpy = jest
          .spyOn(ServicesRepositoryMock.instance, 'find')
          .mockResolvedValue([]);
        servicesService.findAll({ sortOrder });
        expect(repoSpy).toBeCalledWith(expect.objectContaining(query));
      },
    );
    it('throws database error', () => {
      const dbFindError = new Error('find failed');
      jest
        .spyOn(ServicesRepositoryMock.instance, 'find')
        .mockRejectedValue(dbFindError);
      expect(() => servicesService.findAll({})).rejects.toEqual(dbFindError);
    });
  });
});
