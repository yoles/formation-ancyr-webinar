import { IUserRepository } from '../ports/user-repository.interface';
import { User } from '../entities/user.entity';

export class InMemoryUserRepository implements IUserRepository {
  constructor(public readonly database: User[] = []) {}

  async create(user: User): Promise<void> {
    this.database.push(user);
  }

  // TODO: Return new user if we potentially have to update a user as InMemoryWebinarRepository
  async findByEmailAddress(emailAddress: string): Promise<User | null> {
    const user = this.database.find(
      (user) => user.props.emailAddress === emailAddress,
    );
    return user ?? null;
  }

  async findById(id: string): Promise<User | null> {
    const user = this.database.find((user) => user.props.id === id);
    return user ?? null;
  }
}
