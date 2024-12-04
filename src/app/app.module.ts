import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CurrentDateGenerator } from './adapters/date-generator.system';
import { RandomIdGenerator } from './adapters/id-generator.system';
import {
  InMemoryWebinarRepository
} from './adapters/webinar-repository.in-memory';
import { OrganizeWebinar } from './usecases/organize-webinar';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AppService,
    InMemoryWebinarRepository,
    CurrentDateGenerator,
    RandomIdGenerator,
    {
      provide: OrganizeWebinar,
      inject: [
        InMemoryWebinarRepository,
        RandomIdGenerator,
        CurrentDateGenerator,
      ],
      useFactory: (repository, idGenerator, dateGenerator) => {
        return new OrganizeWebinar(repository, idGenerator, dateGenerator);
      }
    }
  ],
})
export class AppModule {}
