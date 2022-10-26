import { Module } from '@nestjs/common';
import { ServicesService } from './services.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from './entities/Service';
import { ServicesController } from './services.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Service])],
  controllers: [ServicesController],
  providers: [ServicesService],
})
export class ServicesModule {}
