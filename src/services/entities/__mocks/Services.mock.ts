import { Service } from '../Service';

function createCollapsedService(): Service {
  return {
    id: 0,
    name: 'ServiceName',
    description: 'Service description',
    versions: 1,
  };
}

export function createMockService(
  {
    collapsed,
  }: {
    collapsed: boolean;
  } = { collapsed: true },
): Service {
  const service = createCollapsedService();
  if (collapsed) {
    return service;
  }
  return {
    ...service,
    updatedAt: new Date(),
    createdAt: new Date(),
  };
}
