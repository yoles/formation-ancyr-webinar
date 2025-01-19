import { Module } from '@nestjs/common';
import { InMemoryWebinarRepository } from './adapters/webinar-repository.in-memory';
import { OrganizeWebinar } from './usecases/organize-webinar';
import { I_WEBINAR_REPOSITORY } from './ports/webinar-repository.interface';
import { WebinarController } from './controllers/webinar.controller';
import { I_ID_GENERATOR } from '../core/ports/id-generator.interface';
import { I_DATE_GENERATOR } from '../core/ports/date-generator.interface';
import { CommonModule } from '../core/common.module';
import { ChangeSeats } from './usecases/change-seats';
import { I_PARTICIPATION_REPOSITORY } from './ports/participation-repository.interface';
import { InMemoryParticipationRepository } from './adapters/participation-repository.in-memory';
import { ChangeDates } from './usecases/change-dates';
import { I_MAILER } from '../core/ports/mailer.interface';
import { UserModule } from '../users/user.module';
import { I_USER_REPOSITORY } from '../users/ports/user-repository.interface';
import { CancelWebinar } from './usecases/cancel-webinar';
import { ParticipationController } from './controllers/participation.controller';
import { ReserveSeat } from './usecases/reserve-seat';
import { CancelSeat } from './usecases/cancel-seat';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { MongoWebinar } from './adapters/mongo/mongo-webinar';
import { MongoWebinarRepository } from './adapters/mongo/mongo-webinar.repository';

@Module({
  imports: [
    CommonModule,
    UserModule,
    MongooseModule.forFeature([
      {
        name: MongoWebinar.CollectionName,
        schema: MongoWebinar.Schema,
      },
    ]),
  ],
  controllers: [WebinarController, ParticipationController],
  providers: [
    {
      provide: I_WEBINAR_REPOSITORY,
      inject: [getModelToken(MongoWebinar.CollectionName)],
      useFactory: (model) => {
        return new MongoWebinarRepository(model);
      },
    },
    {
      provide: I_PARTICIPATION_REPOSITORY,
      useFactory: () => {
        return new InMemoryParticipationRepository();
      },
    },
    {
      provide: OrganizeWebinar,
      inject: [I_WEBINAR_REPOSITORY, I_ID_GENERATOR, I_DATE_GENERATOR],
      useFactory: (repository, idGenerator, dateGenerator) => {
        return new OrganizeWebinar(repository, idGenerator, dateGenerator);
      },
    },
    {
      provide: ChangeSeats,
      inject: [I_WEBINAR_REPOSITORY],
      useFactory: (repository) => {
        return new ChangeSeats(repository);
      },
    },
    {
      provide: ChangeDates,
      inject: [
        I_WEBINAR_REPOSITORY,
        I_DATE_GENERATOR,
        I_PARTICIPATION_REPOSITORY,
        I_MAILER,
        I_USER_REPOSITORY,
      ],
      useFactory: (
        repository,
        dateGenerator,
        participationRepository,
        mailer,
        userRepository,
      ) => {
        return new ChangeDates(
          repository,
          dateGenerator,
          participationRepository,
          mailer,
          userRepository,
        );
      },
    },
    {
      provide: CancelWebinar,
      inject: [
        I_WEBINAR_REPOSITORY,
        I_MAILER,
        I_PARTICIPATION_REPOSITORY,
        I_USER_REPOSITORY,
      ],
      useFactory: (
        repository,
        mailer,
        participationRepository,
        userRepository,
      ) => {
        return new CancelWebinar(
          repository,
          mailer,
          participationRepository,
          userRepository,
        );
      },
    },
    {
      provide: ReserveSeat,
      inject: [
        I_PARTICIPATION_REPOSITORY,
        I_MAILER,
        I_WEBINAR_REPOSITORY,
        I_USER_REPOSITORY,
      ],
      useFactory: (
        participationRepository,
        mailer,
        webinarRepository,
        userRepository,
      ) => {
        return new ReserveSeat(
          participationRepository,
          mailer,
          webinarRepository,
          userRepository,
        );
      },
    },
    {
      provide: CancelSeat,
      inject: [
        I_WEBINAR_REPOSITORY,
        I_PARTICIPATION_REPOSITORY,
        I_USER_REPOSITORY,
        I_MAILER,
      ],
      useFactory: (
        webinarRepository,
        participationRepository,
        userRepository,
        mailer,
      ) => {
        return new CancelSeat(
          webinarRepository,
          participationRepository,
          userRepository,
          mailer,
        );
      },
    },
  ],
  exports: [I_WEBINAR_REPOSITORY],
})
export class WebinarModule {}
