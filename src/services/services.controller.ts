import { Controller, Get, Post } from '@nestjs/common';
import { ServicesService } from './services.service';

@Controller('services')
export class ServicesController {
  constructor(private servicesService: ServicesService) {}
  @Get()
  async getAll() {
    const services = await this.servicesService.findAll();
    return { services };
  }

  @Post()
  async create() {
    const service = await this.servicesService.create();
    return { service };
  }
}
