import { Module } from '@nestjs/common';
import { ServicesService } from './services.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from './entities/Service';
import { ServicesController } from './services.controller';
import { Version } from './entities/Version';

@Module({
  imports: [TypeOrmModule.forFeature([Service, Version])],
  controllers: [ServicesController],
  providers: [ServicesService],
})
export class ServicesModule {}
