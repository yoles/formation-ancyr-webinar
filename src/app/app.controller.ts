import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { CurrentDateGenerator } from './adapters/date-generator.system';
import { OrganizeWebinar } from './usecases/organize-webinar';
import { User } from './entities/user.entity';
import { addDays } from 'date-fns';
import { ZodValidationPipe } from './pipes/zod-validation.pipe';
import {z} from 'zod';
import { WebinarAPI } from './contract';



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
  async handleOrganizeWebinar(
    @Body(new ZodValidationPipe(WebinarAPI.OrganizeWebinar.schema))
    body: WebinarAPI.OrganizeWebinar.Request
  ): Promise<WebinarAPI.OrganizeWebinar.Response> {
    return this.organizeWebinar.execute({
      user: new User({ id: "John Doe"}),
      title: body.title,
      seats: body.seats,
      startDate: body.startDate,
      endDate: body.endDate,
    })
  }
}
