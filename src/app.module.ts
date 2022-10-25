import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: 5432,
      username: 'postgresUser',
      password: 'postgresPw',
      database: 'dbName',
      entities: [],
      synchronize: true,
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
