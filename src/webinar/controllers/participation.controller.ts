import { Controller, Request, Post, Param, Delete } from '@nestjs/common';
import { WebinarAPI } from '../contract';
import { User } from '../../users/entities/user.entity';
import { ReserveSeat } from '../usecases/reserve-seat';
import { CancelSeat } from '../usecases/cancel-seat';

@Controller()
export class ParticipationController {
  constructor(
    private readonly reserveSeat: ReserveSeat,
    private readonly cancelSeat: CancelSeat,
  ) {}

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

  @Delete('/webinars/:id/participation')
  async handleCancelSeat(
    @Param('id') webinarId: string,
    @Request() request: { user: User },
  ): Promise<WebinarAPI.CancelSeat.Response> {
    return this.cancelSeat.execute({
      user: request.user,
      webinarId,
    });
  }
}
