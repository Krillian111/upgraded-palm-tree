import { Service } from '../entities/Service';
import { getRepositoryToken } from '@nestjs/typeorm';

class ServicesRepository {
  async find(): Promise<Service[]> {
    return [];
  }
  create(): Service {
    return { id: 1 };
  }
  async save(service: Service): Promise<Service> {
    return service;
  }
}
const instance = new ServicesRepository();

export const ServicesRepositoryMock = {
  instance,
  provider: {
    provide: getRepositoryToken(Service),
    useValue: instance,
  },
};
