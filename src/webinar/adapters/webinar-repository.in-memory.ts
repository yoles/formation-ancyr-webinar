import { IWebinarRepository } from '../ports/webinar-repository.interface';
import { Webinar } from '../entities/webinar.entity';
import { undefined } from 'zod';

export class InMemoryWebinarRepository implements IWebinarRepository {
  constructor(public database: Webinar[] = []) {}

  async create(webinar: Webinar): Promise<void> {
    this.database.push(webinar);
  }

  async findById(id: string): Promise<Webinar | null> {
    const webinar = this.database.find(
      (w) => w.props.id === id
    );
    return webinar ? new Webinar({...webinar.initialState}) : null;
  }

  findByIdSync(id: string): Webinar | null  {
    const webinar = this.database.find(
      (w) => w.props.id === id
    );
    return webinar ? new Webinar({...webinar.initialState}) : null;
  }

  async update(webinar: Webinar): Promise<void> {
    const index = this.database.findIndex(
      (w) => w.props.id === webinar.props.id
    );
    this.database[index] = webinar;
    webinar.commit()
  }

}
