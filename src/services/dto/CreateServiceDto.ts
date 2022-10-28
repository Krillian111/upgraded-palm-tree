export class CreateVersionDto {
  label: string;
  description?: string;
  status: string;
  environment?: string;
}

export class CreateServiceDto {
  name: string;
  versions: CreateVersionDto[];
}
