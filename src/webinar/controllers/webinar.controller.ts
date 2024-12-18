import { Body, Controller, Request, Post } from '@nestjs/common';
import { OrganizeWebinar } from '../usecases/organize-webinar';
import { ZodValidationPipe } from '../../core/pipes/zod-validation.pipe';
import { WebinarAPI } from '../contract';
import { User } from '../../users/entities/user.entity';

@Controller()
export class WebinarController {
  constructor(
    private readonly organizeWebinar: OrganizeWebinar,
  ) {}

  @Post('/webinars')
  async handleOrganizeWebinar(
    @Body(new ZodValidationPipe(WebinarAPI.OrganizeWebinar.schema))
    body: WebinarAPI.OrganizeWebinar.Request,
    @Request() request: { user: User },
  ): Promise<WebinarAPI.OrganizeWebinar.Response> {
    return this.organizeWebinar.execute({
      user: request.user,
      title: body.title,
      seats: body.seats,
      startDate: body.startDate,
      endDate: body.endDate,
    });
  }
}
