import { IWebinarRepository } from '../ports/webinar-repository.interface';
import { IIDGenerator } from '../../core/ports/id-generator.interface';
import { Webinar } from '../entities/webinar.entity';
import { IDateGenerator } from '../../core/ports/date-generator.interface';
import { User } from '../../users/entities/user.entity';
import { Executable } from '../../shared/executable';
import { WebinarTooEarlyException } from '../exceptions/webinar-too-early';
import { WebinarTooManySeatsException } from '../exceptions/webinar-too-many-seats';
import { WebinarNotEnoughSeatsException } from '../exceptions/webinar-not-enough-seats';

type Request = {
  user: User;
  title: string;
  seats: number;
  startDate: Date;
  endDate: Date;
};

type Response = {
  id: string;
};

export class OrganizeWebinar implements Executable<Request, Response> {
  constructor(
    private readonly repository: IWebinarRepository,
    private readonly idGenerator: IIDGenerator,
    private readonly dateGenerator: IDateGenerator,
  ) {}

  async execute(data: Request) {
    const id = this.idGenerator.generate();
    const now = this.dateGenerator.now();
    const webinar = new Webinar({
      id,
      organizerId: data.user.props.id,
      title: data.title,
      seats: data.seats,
      startDate: data.startDate,
      endDate: data.endDate,
    });
    if (webinar.isTooClose(now)) {
      throw new WebinarTooEarlyException();
    }
    if (webinar.hasTooManySeats()) {
      throw new WebinarTooManySeatsException();
    }
    if (webinar.hasNoSeats()) {
      throw new WebinarNotEnoughSeatsException();
    }
    await this.repository.create(webinar);
    return { id };
  }
}
