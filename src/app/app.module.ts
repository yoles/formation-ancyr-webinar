import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CurrentDateGenerator } from './adapters/date-generator.system';
import { RandomIdGenerator } from './adapters/id-generator.system';
import { InMemoryWebinarRepository } from './adapters/webinar-repository.in-memory';
import { OrganizeWebinar } from './usecases/organize-webinar';
import { InMemoryUserRepository } from './adapters/user-repository.in-memory';
import { Authenticator } from './services/authenticator';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guard/auth.guard';
import { I_USER_REPOSITORY } from './ports/user-repository.interface';
import { I_WEBINAR_REPOSITORY } from './ports/webinar-repository.interface';
import { I_ID_GENERATOR } from './ports/id-generator.interface';
import { I_DATE_GENERATOR } from './ports/date-generator.interface';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: I_USER_REPOSITORY,
      useFactory: () => {
        return new InMemoryUserRepository()
      }
    },
    {
      provide: I_WEBINAR_REPOSITORY,
      useFactory: () => {
        return new InMemoryWebinarRepository()
      }
    },
    {
      provide: I_ID_GENERATOR,
      useClass: RandomIdGenerator
    },
    {
      provide: I_DATE_GENERATOR,
      useClass: CurrentDateGenerator
    },
    {
      provide: OrganizeWebinar,
      inject: [
        I_WEBINAR_REPOSITORY,
        I_ID_GENERATOR,
        I_DATE_GENERATOR
      ],
      useFactory: (repository, idGenerator, dateGenerator) => {
        return new OrganizeWebinar(repository, idGenerator, dateGenerator);
      },
    },
    {
      provide: Authenticator,
      inject: [I_USER_REPOSITORY],
      useFactory: (repository) => {
        return new Authenticator(repository);
      },
    },
    {
      provide: APP_GUARD,
      inject: [Authenticator],
      useFactory: (authenticator) => {
        return new AuthGuard(authenticator);
      },
    },
  ],
})
export class AppModule {}
