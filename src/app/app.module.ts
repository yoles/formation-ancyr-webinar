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

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AppService,
    InMemoryWebinarRepository,
    CurrentDateGenerator,
    RandomIdGenerator,
    InMemoryUserRepository,
    {
      provide: OrganizeWebinar,
      inject: [
        InMemoryWebinarRepository,
        RandomIdGenerator,
        CurrentDateGenerator,
      ],
      useFactory: (repository, idGenerator, dateGenerator) => {
        return new OrganizeWebinar(repository, idGenerator, dateGenerator);
      },
    },
    {
      provide: Authenticator,
      inject: [InMemoryUserRepository],
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
