import { User } from '../../users/entities/user.entity';

export const testUsers = {
  alice: new User({
    id: 'alice',
    emailAddress: 'alice@example.fr',
    password: 'azerty',
  }),

  bob: new User({
    id: 'bob',
    emailAddress: 'bob@example.fr',
    password: 'azerty',
  }),
};
