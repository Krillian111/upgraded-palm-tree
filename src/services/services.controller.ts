import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ServicesService, ValidSortOrder } from './services.service';
import { CreateServiceDto } from './dto/CreateServiceDto';

@Controller('services')
export class ServicesController {
  static readonly OFFSET_DEFAULT = 0;
  static readonly LIMIT_DEFAULT = 12;
  constructor(private servicesService: ServicesService) {}
  @Get()
  async getAll(
    @Query('filter') filter?: string,
    @Query('sort') sort?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const sortOrder: ValidSortOrder | undefined = this.validateSortOrder(sort);
    const parsedLimit = this.validatePositiveInteger('limit', limit, 100);
    const parsedOffset = this.validatePositiveInteger('offset', offset);
    this.validatePaginationInput(parsedLimit, parsedOffset);

    return await this.servicesService.findAll({
      exactName: filter,
      sortOrder,
      limit: parsedLimit ?? ServicesController.LIMIT_DEFAULT,
      offset: parsedOffset ?? ServicesController.OFFSET_DEFAULT,
    });
  }

  private validateSortOrder(sort?: string) {
    if (!sort) {
      return undefined;
    }
    if (this.isValidSortOrder(sort)) {
      return sort;
    }
    throw new BadRequestException(
      `Invalid 'sort' parameter - expected 'ASC' or 'DESC' but received ${sort}`,
    );
  }

  private isValidSortOrder(
    toCheck: string | undefined,
  ): toCheck is ValidSortOrder {
    return ['ASC', 'DESC'].includes(toCheck);
  }

  private validatePositiveInteger(
    paramName: string,
    toCheck?: string,
    maxValue?: number,
  ) {
    if (!toCheck) {
      return undefined;
    }
    const max = maxValue ?? Number.MAX_VALUE;
    const parsedValue = Number.parseInt(toCheck);
    if (
      Number.isSafeInteger(parsedValue) &&
      parsedValue <= max &&
      parsedValue >= 0
    ) {
      return parsedValue;
    }
    throw new BadRequestException(
      `Invalid '${paramName}' parameter - expected integer <=${max} but received ${toCheck}`,
    );
  }

  private validatePaginationInput(limit?: number, offset?: number) {
    const limitPresent = Number.isSafeInteger(limit);
    const offsetPresent = Number.isSafeInteger(offset);
    if ((limitPresent && offsetPresent) || (!limitPresent && !offsetPresent)) {
      return;
    }
    throw new BadRequestException(
      `Invalid 'limit'/'offset' parameters - expected both but received '${limit}'/'${offset}'`,
    );
  }

  @Get(':id')
  async findById(
    @Param('id', ParseIntPipe) id: number,
    @Query('expandVersions') expandVersions?: string,
  ) {
    const parsedExpandVersions = this.parseBoolean(
      'expandVersions',
      expandVersions,
    );
    const service = await this.servicesService.findById(
      id,
      parsedExpandVersions,
    );
    if (!service) {
      throw new NotFoundException(`No Service with id ${id}`);
    }
    return service;
  }

  private parseBoolean(paramName: string, value: string) {
    if (value === undefined || value === 'false') {
      return false;
    } else if (value === 'true') {
      return true;
    } else
      throw new BadRequestException(
        `Invalid ${paramName} parameter - expected 'true' or 'false' but received ${value}`,
      );
  }

  @Post()
  async create(@Body() createServiceDto: CreateServiceDto) {
    if (!createServiceDto.name) {
      createServiceDto.name = 'DefaultServiceName';
    }
    if (!createServiceDto.versions) {
      createServiceDto.versions = [];
    }
    return this.servicesService.create(createServiceDto);
  }
}
