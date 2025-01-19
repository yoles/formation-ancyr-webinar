import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../core/app.module';
import { IFixture } from './fixture';
import { ConfigModule } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { MongoUser } from '../../users/adapters/mongo/mongo-user';
import { Model } from 'mongoose';
import { MongoWebinar } from '../../webinar/adapters/mongo/mongo-webinar';
import { MongoParticipation } from '../../webinar/adapters/mongo/mongo-participation';

export class TestApp {
  private app: INestApplication;

  async setup() {
    const module = await Test.createTestingModule({
      imports: [
        AppModule,
        ConfigModule.forRoot({
          ignoreEnvFile: true,
          ignoreEnvVars: true,
          isGlobal: true,
          load: [
            () => ({
              DATABASE_URL:
                'mongodb://admin:azerty@localhost:3701/webinaires?authSource=admin&directConnection=true',
            }),
          ],
        }),
      ],
    }).compile();

    this.app = module.createNestApplication();
    await this.app.init();
    await this.clearDatabase();
  }

  async cleanup() {
    await this.app.close();
  }

  async loadFixtures(fixtures: IFixture[]) {
    return Promise.all(fixtures.map((fixture) => fixture.load(this)));
  }

  get<T>(name: any) {
    return this.app.get<T>(name);
  }

  getHttpServer() {
    return this.app.getHttpServer();
  }

  private async clearDatabase() {
    const userModel = this.app.get<Model<MongoUser.SchemaClass>>(
      getModelToken(MongoUser.CollectionName),
    );
    const webinarModel = this.app.get<Model<MongoWebinar.SchemaClass>>(
      getModelToken(MongoWebinar.CollectionName),
    );
    const participationModel = this.app.get<
      Model<MongoParticipation.SchemaClass>
    >(getModelToken(MongoParticipation.CollectionName));

    await userModel.deleteMany({});
    await webinarModel.deleteMany({});
    await participationModel.deleteMany({});
  }
}
