import { IWebinarRepository } from '../ports/webinar-repository.interface';
import { Webinar } from '../entities/webinar.entity';
import { undefined } from 'zod';

export class InMemoryWebinarRepository implements IWebinarRepository {
  public database: Webinar[] = [];
  async create(webinar: Webinar): Promise<void> {
    this.database.push(webinar);
  }

  async findById(id: string): Promise<Webinar | null> {
    const webinar = this.database.find(
      (w) => w.props.id === id
    );
    return webinar ?? null;
  }
}
