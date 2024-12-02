import { IWebinarRepository } from '../ports/webinar-repository.interface';
import { IIDGenerator } from '../ports/id-generator.interface';
import { Webinar } from '../entities/webinar.entity';

export class OrganizeWebinar {
  constructor(
    private readonly repository: IWebinarRepository,
    private readonly idGenerator: IIDGenerator,
  ) {}

  async execute(data: {
    title: string;
    seats: number;
    startDate: Date;
    endDate: Date;
  }) {
    const id = this.idGenerator.generate();
    await this.repository.create(
      new Webinar({
        id,
        title: data.title,
        seats: data.seats,
        startDate: data.startDate,
        endDate: data.endDate,
      }),
    );
    return { id };
  }
}
