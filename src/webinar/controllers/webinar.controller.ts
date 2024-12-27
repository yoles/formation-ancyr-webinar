import {
  Body,
  Controller,
  Request,
  Post,
  Param,
  HttpCode,
} from '@nestjs/common';
import { OrganizeWebinar } from '../usecases/organize-webinar';
import { ZodValidationPipe } from '../../core/pipes/zod-validation.pipe';
import { WebinarAPI } from '../contract';
import { User } from '../../users/entities/user.entity';
import { ChangeSeats } from '../usecases/change-seats';

@Controller()
export class WebinarController {
  constructor(
    private readonly organizeWebinar: OrganizeWebinar,
    private readonly changeSeats: ChangeSeats,
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

  @Post('/webinars/:id/seats')
  @HttpCode(200)
  async handleChangeSeats(
    @Param('id') webinarId: string,
    @Body(new ZodValidationPipe(WebinarAPI.ChangeSeats.schema))
    body: WebinarAPI.ChangeSeats.Request,
    @Request() request: { user: User },
  ): Promise<WebinarAPI.ChangeSeats.Response> {
    return this.changeSeats.execute({
      user: request.user,
      webinarId,
      seats: body.seats
    });
  }
}
