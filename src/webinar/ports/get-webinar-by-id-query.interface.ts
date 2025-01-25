// CQRS

import { WebinarDTO } from '../dto/webinar.dto';

export const I_GET_WEBINAR_BY_ID_QUERY = 'I_GET_WEBINAR_BY_ID_QUERY';

export interface GetWebinarByIdQuery {
  execute(id: string): Promise<WebinarDTO>;
}
