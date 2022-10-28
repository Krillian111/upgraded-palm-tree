import { Service } from '../Service';

export function createMockService(): Service {
  return {
    id: 0,
    name: 'ServiceName',
    description: 'Service description',
    versions: [],

    updatedAt: new Date(),
    createdAt: new Date(),
  };
}
