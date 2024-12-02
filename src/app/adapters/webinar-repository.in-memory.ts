import { IWebinarRepository } from '../ports/webinar-repository.interface';
import { Webinar } from '../entities/webinar.entity';

export class InMemoryWebinarRepository implements IWebinarRepository {
  public database: Webinar[] = [];
  async create(webinar: Webinar): Promise<void> {
    this.database.push(webinar);
  }
}
