import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { ServicesService, ValidSortOrder } from './services.service';
import { CreateServiceDto } from './dto/CreateServiceDto';

@Controller('services')
export class ServicesController {
  constructor(private servicesService: ServicesService) {}

  @Get()
  async getAll(@Query('filter') filter?: string, @Query('sort') sort?: string) {
    const sortOrder: ValidSortOrder | undefined = this.validateSortOrder(sort);
    const services = await this.servicesService.findAll({
      exactName: filter,
      sortOrder,
    });
    return { services };
  }

  private validateSortOrder(sort?: string) {
    if (!sort) {
      return undefined;
    }
    if (this.isValidSortOrder(sort)) {
      return sort;
    }
    throw new HttpException(
      {
        status: HttpStatus.BAD_REQUEST,
        error: `Invalid 'sort' parameter - expected 'ASC' or 'DESC' but received ${sort}`,
      },
      HttpStatus.BAD_REQUEST,
    );
  }

  private isValidSortOrder(
    toCheck: string | undefined,
  ): toCheck is ValidSortOrder {
    return ['ASC', 'DESC'].includes(toCheck);
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
