export class FindServiceDto {
  id: number;
  name: string;
  description: string;
  versionCount: number;
}

export class FindServicesDto {
  services: FindServiceDto[];
  limit: number;
  offset: number;
  count: number;
}
