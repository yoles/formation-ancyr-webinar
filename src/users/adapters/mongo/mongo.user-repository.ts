import { IUserRepository } from '../../ports/user-repository.interface';
import { User } from '../../../users/entities/user.entity';
import { MongoUser } from './mongo.user';
import { Model } from 'mongoose';

export class MongoUserRepository implements IUserRepository {
  private readonly mapper = new UserMapper();
  constructor(private readonly model: Model<MongoUser.SchemaClass>) {}

  async findByEmailAddress(emailAddress: string): Promise<User | null> {
    const user = await this.model.findOne({ emailAddress });

    if (!user) return null;

    return this.mapper.toCore(user);
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.model.findById(id);

    if (!user) return null;

    return this.mapper.toCore(user);
  }

  async create(user: User): Promise<void> {
    const record = new this.model(this.mapper.toPersistence(user));
    await record.save();
  }
}

/**
 * With the mapper, the methods can focus on how to
 * retreive, update or create data which are different responsabilities
 * Now methods has only one reason to change
 * Avoid to change methods when the data model change
 * Pattern Data Mapper by Martin Fowler (Entreprise Pattern)
 */
class UserMapper {
  toCore(user: MongoUser.Document): User {
    return new User({
      id: user._id,
      emailAddress: user.emailAddress,
      password: user.password,
    });
  }

  toPersistence(user: User): MongoUser.SchemaClass {
    return {
      _id: user.props.id,
      emailAddress: user.props.emailAddress,
      password: user.props.password,
    };
  }
}
