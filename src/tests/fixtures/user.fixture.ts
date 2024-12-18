import { IFixture } from '../utils/fixture';
import { User } from '../../users/entities/user.entity';
import { TestApp } from '../utils/test-app';
import {
  I_USER_REPOSITORY,
  IUserRepository,
} from '../../users/ports/user-repository.interface';

export class UserFixture implements IFixture {
  constructor(public entity: User) {}

  async load(app: TestApp): Promise<void> {
    const userRepository = app.get<IUserRepository>(
      I_USER_REPOSITORY
    );
    await userRepository.create(this.entity);
  }

  createValidAuthorizationToken() {
    return `Basic ${Buffer.from(
      `${this.entity.props.emailAddress}:${this.entity.props.password}`,
    ).toString('base64')}`;
  };

  createInvalidAuthorizationToken() {
    return `Basic ${Buffer.from(
      `${this.entity.props.emailAddress}:invalid-token`,
    ).toString('base64')}`;
  };
}