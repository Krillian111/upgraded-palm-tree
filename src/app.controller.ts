import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('healthcheck')
  getHealthcheck(): Healthcheck {
    return { app: 'OK' };
  }
}

type Healthcheck = {
  app: 'OK';
};
