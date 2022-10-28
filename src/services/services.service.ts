import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Service } from './entities/Service';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { CreateServiceDto } from './dto/CreateServiceDto';
import { FindServicesDto } from './dto/FindServicesDto';

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
  }): Promise<FindServicesDto> {
    const countOptions: FindManyOptions<Service> = {
      select: ['id'],
    };
    if (params.exactName) {
      countOptions.where = { name: params.exactName };
    }
    const findOptions: FindManyOptions<Service> = {
      ...countOptions,
      select: [...countOptions.select, 'name', 'description'],
      skip: params.offset,
      take: params.limit,
      relations: ['versions'],
    };
    if (params.sortOrder) {
      findOptions.order = { name: params.sortOrder };
    }
    const count = await this.serviceRepo.count(countOptions);
    const services = await this.serviceRepo.find(findOptions);
    const servicesWithVersionCount = services.map(service => ({
      id: service.id,
      name: service.name,
      description: service.description,
      updatedAt: service.updatedAt,
      createdAt: service.createdAt,
      versionCount: service.versions.length,
    }));
    return {
      services: servicesWithVersionCount,
      count,
      limit: params.limit,
      offset: params.offset,
    };
  }

  async findById(id: number, expandVersions?: boolean): Promise<Service> {
    const findOneOptions: FindOneOptions<Service> = {};
    if (expandVersions) {
      findOneOptions.relations = ['versions'];
    }
    return this.serviceRepo.findOne(id, findOneOptions);
  }

  async create(createServiceDto: CreateServiceDto): Promise<Service> {
    const serviceToCreate = this.serviceRepo.create(createServiceDto);
    return await this.serviceRepo.save(serviceToCreate);
  }
}

export type ValidSortOrder = 'ASC' | 'DESC';
