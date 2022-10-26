import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Service } from './entities/Service';
import { Repository } from 'typeorm';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service) private serviceRepo: Repository<Service>,
  ) {}

  findAll(): Promise<Service[]> {
    return this.serviceRepo.find();
  }

  async create(): Promise<Service> {
    const toCreate = this.serviceRepo.create();
    return await this.serviceRepo.save(toCreate);
  }
}
