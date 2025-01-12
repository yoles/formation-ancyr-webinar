import { WebinarFixture } from '../fixtures/webinar.fixture';
import { Webinar } from '../../webinar/entities/webinar.entity';
import { e2eUsers } from './user.seeds.e2e';
import { addDays } from 'date-fns';

export const e2eWebinars = {
  webinar1: new WebinarFixture(
    new Webinar({
      id: '1',
      organizerId: e2eUsers.johnDoe.entity.props.id,
      seats: 50,
      title: 'My first webinar',
      startDate: addDays(new Date(), 4),
      endDate: addDays(new Date(), 5),
    }),
  ),
};
