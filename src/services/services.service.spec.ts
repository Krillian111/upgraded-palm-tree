import { Test, TestingModule } from '@nestjs/testing';
import { ServicesService, ValidSortOrder } from './services.service';
import { ServicesRepositoryMock } from './__mocks/services.repository.mock';
import { createMockService } from './entities/__mocks/Services.mock';

const standardParams = { offset: 0, limit: 10 };
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
        expect(servicesService.findAll(standardParams)).resolves.toEqual({
          ...standardParams,
          count: ServicesRepositoryMock.count,
          services: repoReturn,
        });
      },
    );
    it('selects subset of relevant columns', async () => {
      const findSpy = jest
        .spyOn(ServicesRepositoryMock.instance, 'find')
        .mockResolvedValue([]);
      await servicesService.findAll(standardParams);
      expect(findSpy).toBeCalledWith(
        expect.objectContaining({
          select: ['id', 'name', 'description', 'versions'],
        }),
      );
    });
    it('filters for exact name matches', async () => {
      const findSpy = jest
        .spyOn(ServicesRepositoryMock.instance, 'find')
        .mockResolvedValue([]);
      const exactName = 'someName';
      await servicesService.findAll({ ...standardParams, exactName });
      expect(findSpy).toBeCalledWith(
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
      async ({ sortOrder, query }: { sortOrder: ValidSortOrder; query }) => {
        const findSpy = jest
          .spyOn(ServicesRepositoryMock.instance, 'find')
          .mockResolvedValue([]);
        await servicesService.findAll({ ...standardParams, sortOrder });
        expect(findSpy).toBeCalledWith(expect.objectContaining(query));
      },
    );
    it('paginates by using limit and offset', async () => {
      const offset = 10;
      const limit = 20;
      const findSpy = jest
        .spyOn(ServicesRepositoryMock.instance, 'find')
        .mockResolvedValue([]);
      await servicesService.findAll({ offset, limit });
      expect(findSpy).toBeCalledWith(
        expect.objectContaining({ skip: offset, take: limit }),
      );
    });
    it('throws database error', async () => {
      const dbFindError = new Error('find failed');
      jest
        .spyOn(ServicesRepositoryMock.instance, 'find')
        .mockRejectedValue(dbFindError);
      await expect(() =>
        servicesService.findAll(standardParams),
      ).rejects.toEqual(dbFindError);
    });
  });
  describe('findById', () => {
    it('returns single service from database', async () => {
      const expected = createMockService();
      const findOneSpy = jest
        .spyOn(ServicesRepositoryMock.instance, 'findOne')
        .mockResolvedValue(expected);
      const id = 123;
      const actual = await servicesService.findById(id);
      expect(findOneSpy).toBeCalledWith(id);
      expect(actual).toEqual(expected);
    });
    it('resolves to undefined if no service is found', async () => {
      const findOneSpy = jest
        .spyOn(ServicesRepositoryMock.instance, 'findOne')
        .mockResolvedValue(undefined);
      const id = 123;
      const actual = await servicesService.findById(id);
      expect(findOneSpy).toBeCalledWith(id);
      expect(actual).toBeUndefined();
    });
  });
});
