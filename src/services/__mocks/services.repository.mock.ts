import { Service } from '../entities/Service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createMockService } from '../entities/__mocks/Services.mock';

const mockCount = 3;
class ServicesRepository {
  async find(): Promise<Service[]> {
    return [];
  }
  create(): Service {
    return {
      id: 1,
      name: 'some-name',
      description: 'some-description',
      versions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
  async save(service: Service): Promise<Service> {
    return service;
  }
  async count(): Promise<number> {
    return mockCount;
  }
  async findOne(): Promise<Service> {
    return createMockService();
  }
}
const instance = new ServicesRepository();

export const ServicesRepositoryMock = {
  instance,
  provider: {
    provide: getRepositoryToken(Service),
    useValue: instance,
  },
  count: mockCount,
};
