import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Service } from './entities/Service';
import { FindManyOptions, Repository } from 'typeorm';
import { CreateServiceDto } from './dto/CreateServiceDto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service) private serviceRepo: Repository<Service>,
  ) {}

  findAll(params: { exactName?: string }): Promise<Service[]> {
    let findOptions: FindManyOptions<Service> = {
      select: ['id', 'name', 'description', 'versions'],
    };
    if (params.exactName) {
      findOptions = { ...findOptions, where: { name: params.exactName } };
    }
    return this.serviceRepo.find(findOptions);
  }

  async create(createServiceDto: CreateServiceDto): Promise<Service> {
    const toCreate = this.serviceRepo.create(createServiceDto);
    return await this.serviceRepo.save(toCreate);
  }
}
