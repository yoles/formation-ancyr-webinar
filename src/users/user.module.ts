import { Module } from '@nestjs/common';
import { InMemoryUserRepository } from './adapters/user-repository.in-memory';
import { I_USER_REPOSITORY } from './ports/user-repository.interface';
import { MongoUser } from './adapters/mongo/mongo.user';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { MongoUserRepository } from './adapters/mongo/mongo.user-repository';
import { Model } from 'mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MongoUser.CollectionName, schema: MongoUser.Schema },
    ]),
  ],
  controllers: [],
  providers: [
    {
      provide: I_USER_REPOSITORY,
      inject: [getModelToken(MongoUser.CollectionName)],
      useFactory: (model: Model<MongoUser.Document>) => {
        return new MongoUserRepository(model);
      },
    },
  ],
  exports: [I_USER_REPOSITORY],
})
export class UserModule {}
