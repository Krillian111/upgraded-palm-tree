import { FindServiceDto } from '../FindServicesDto';

export function createFindServiceDto(): FindServiceDto {
  return {
    id: 0,
    name: 'ServiceName',
    description: 'Service description',
    versionCount: 0,
  };
}
