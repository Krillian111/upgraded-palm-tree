import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from './services/entities/Service';
import { ServicesModule } from './services/services.module';
import { Version } from './services/entities/Version';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: 5432,
      username: 'postgresUser',
      password: 'postgresPw',
      database: 'dbName',
      entities: [Service, Version],
      synchronize: true, // simplified setup
      keepConnectionAlive: true, // allow connection reuse during tests
      dropSchema: true, // simple clear of the database after each test
    }),
    ServicesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
