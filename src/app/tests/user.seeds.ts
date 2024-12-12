import { UserFixture } from './user.fixture';
import { User } from '../entities/user.entity';

export const e2eUsers = {
  johnDoe: new UserFixture(
    new User({
      id: '1',
      emailAddress: 'j.doe@example.fr',
      password: 'azerty',
    })
  )
}