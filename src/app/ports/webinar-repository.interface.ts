import { Webinar } from '../entities/webinar.entity';

export interface IWebinarRepository {
  create(webinar: Webinar): Promise<void>;
}
