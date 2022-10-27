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

  async findAll(params: {
    exactName?: string;
    sortOrder?: ValidSortOrder;
    limit: number;
    offset: number;
  }): Promise<{
    services: Service[];
    offset: number;
    limit: number;
    count: number;
  }> {
    const countOptions: FindManyOptions<Service> = {
      select: ['id', 'name', 'description', 'versions'],
    };
    if (params.exactName) {
      countOptions.where = { name: params.exactName };
    }
    const findOptions: FindManyOptions<Service> = {
      ...countOptions,
      skip: params.offset,
      take: params.limit,
    };
    if (params.sortOrder) {
      findOptions.order = { name: params.sortOrder };
    }
    const count = await this.serviceRepo.count(countOptions);
    const services = await this.serviceRepo.find(findOptions);
    return {
      services,
      count,
      limit: params.limit,
      offset: params.offset,
    };
  }

  async findById(id: number): Promise<Service> {
    return this.serviceRepo.findOne(id);
  }

  async create(createServiceDto: CreateServiceDto): Promise<Service> {
    const toCreate = this.serviceRepo.create(createServiceDto);
    return await this.serviceRepo.save(toCreate);
  }
}

export type ValidSortOrder = 'ASC' | 'DESC';
