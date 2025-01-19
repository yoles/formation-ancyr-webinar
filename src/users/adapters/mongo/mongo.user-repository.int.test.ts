import { TestApp } from '../../../tests/utils/test-app';
import { MongoUserRepository } from './mongo.user-repository';
import { MongoUser } from './mongo-user';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { testUsers } from '../../../users/tests/user.seeds';
import { User } from 'src/users/entities/user.entity';

describe('MongoUserRepository', () => {
  async function createUserInDatabase(user: User) {
    const record = new model({
      _id: user.props.id,
      emailAddress: user.props.emailAddress,
      password: user.props.password,
    });
    await record.save(); // Pattern Active Record
  }

  let app: TestApp;
  let model: Model<MongoUser.SchemaClass>;
  let repository: MongoUserRepository;

  beforeEach(async () => {
    app = new TestApp();
    await app.setup();
    model = app.get<Model<MongoUser.SchemaClass>>(
      getModelToken(MongoUser.CollectionName),
    );

    repository = new MongoUserRepository(model);
    await createUserInDatabase(testUsers.alice);
  });

  afterEach(async () => {
    await app.cleanup();
  });

  describe('findByEmailAddress', () => {
    it('should find the user corresponding to the email address', async () => {
      const user = await repository.findByEmailAddress(
        testUsers.alice.props.emailAddress,
      );
      expect(user!.props).toEqual(testUsers.alice.props);
    });

    it('should failed if the user is not found', async () => {
      const user = await repository.findByEmailAddress('does-not-exist');
      expect(user).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find the user corresponding to the id', async () => {
      const user = await repository.findById(testUsers.alice.props.id);
      expect(user!.props).toEqual(testUsers.alice.props);
    });

    it('should failed if the user is not found', async () => {
      const user = await repository.findById('does-not-exist');
      expect(user).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const user = await repository.create(testUsers.bob);

      const record = await model.findById(testUsers.bob.props.id);
      expect(record!.toObject()).toEqual({
        __v: 0,
        _id: testUsers.bob.props.id,
        emailAddress: testUsers.bob.props.emailAddress,
        password: testUsers.bob.props.password,
      });
    });
  });
});
