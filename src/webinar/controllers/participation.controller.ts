import { Controller, Request, Post, Param, HttpCode } from '@nestjs/common';
import { WebinarAPI } from '../contract';
import { User } from '../../users/entities/user.entity';
import { ReserveSeat } from '../usecases/reserve-seat';

@Controller()
export class ParticipationController {
  constructor(private readonly reserveSeat: ReserveSeat) {}

  @Post('/webinars/:id/participation')
  async handleReserveSeat(
    @Param('id') webinarId: string,
    @Request() request: { user: User },
  ): Promise<WebinarAPI.ReserveSeat.Response> {
    return this.reserveSeat.execute({
      user: request.user,
      webinarId,
    });
  }
}
