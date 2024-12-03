import { IWebinarRepository } from '../ports/webinar-repository.interface';
import { IIDGenerator } from '../ports/id-generator.interface';
import { Webinar } from '../entities/webinar.entity';
import { IDateGenerator } from '../ports/date-generator.interface';

export class OrganizeWebinar {
  constructor(
    private readonly repository: IWebinarRepository,
    private readonly idGenerator: IIDGenerator,
    private readonly dateGenerator: IDateGenerator,
  ) {}

  async execute(data: {
    title: string;
    seats: number;
    startDate: Date;
    endDate: Date;
  }) {
    const id = this.idGenerator.generate();
    const now = this.dateGenerator.now();
    const webinar = new Webinar({
      id,
      title: data.title,
      seats: data.seats,
      startDate: data.startDate,
      endDate: data.endDate,
    });
    if (webinar.isTooClose(now)) {
      throw new Error('The webinar must happen 3 days from now');
    }
    if (webinar.hasTooManySeats()) {
      throw new Error('The webinar must have a maximum of 1500 seats');
    }
    if (webinar.hasNoSeats()) {
      throw new Error("The webinar must have a minimum of 1 seat");
    }
    await this.repository.create(webinar);
    return { id };
  }
}
