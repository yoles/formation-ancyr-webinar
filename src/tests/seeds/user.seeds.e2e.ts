import { UserFixture } from '../fixtures/user.fixture';
import { User } from '../../users/entities/user.entity';

export const e2eUsers = {
  johnDoe: new UserFixture(
    new User({
      id: '1',
      emailAddress: 'j.doe@example.fr',
      password: 'azerty',
    }),
  ),
  bob: new UserFixture(
    new User({
      id: 'bob',
      emailAddress: 'bob@example.fr',
      password: 'azerty',
    }),
  ),
};
