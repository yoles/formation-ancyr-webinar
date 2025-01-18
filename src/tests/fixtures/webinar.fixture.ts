import { IFixture } from '../utils/fixture';
import { TestApp } from '../utils/test-app';
import { Webinar } from '../../webinar/entities/webinar.entity';
import {
  I_WEBINAR_REPOSITORY,
  IWebinarRepository,
} from '../../webinar/ports/webinar-repository.interface';

export class WebinarFixture implements IFixture {
  constructor(public entity: Webinar) {}

  async load(app: TestApp): Promise<void> {
    const webinarRepository = app.get<IWebinarRepository>(I_WEBINAR_REPOSITORY);
    await webinarRepository.create(this.entity);
  }
}
