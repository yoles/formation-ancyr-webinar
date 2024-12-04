import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { CurrentDateGenerator } from './adapters/date-generator.system';
import { OrganizeWebinar } from './usecases/organize-webinar';
import { User } from './entities/user.entity';
import { addDays } from 'date-fns';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly organizeWebinar: OrganizeWebinar
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post("/webinars")
  async handleOrganizeWebinar(@Body() body: any) {
    return this.organizeWebinar.execute({
      user: new User({ id: "John Doe"}),
      title: body.title,
      seats: body.seats,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
    })
  }
}
