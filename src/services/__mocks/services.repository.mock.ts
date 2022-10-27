import { Service } from '../entities/Service';
import { getRepositoryToken } from '@nestjs/typeorm';

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
      versions: 2,
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
