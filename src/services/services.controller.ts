import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/CreateServiceDto';

@Controller('services')
export class ServicesController {
  constructor(private servicesService: ServicesService) {}
  @Get()
  async getAll(@Query('filter') filter?: string) {
    const services = await this.servicesService.findAll({ exactName: filter });
    return { services };
  }

  @Post()
  async create(@Body() createServiceDto: CreateServiceDto) {
    if (!createServiceDto.name) {
      createServiceDto.name = 'DefaultServiceName';
    }
    const service = await this.servicesService.create(createServiceDto);
    return { service };
  }
}
