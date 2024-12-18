import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CurrentDateGenerator } from './adapters/date-generator.system';
import { RandomIdGenerator } from './adapters/id-generator.system';
import { InMemoryWebinarRepository } from '../webinar/adapters/webinar-repository.in-memory';
import { OrganizeWebinar } from '../webinar/usecases/organize-webinar';
import { InMemoryUserRepository } from '../users/adapters/user-repository.in-memory';
import { Authenticator } from '../users/services/authenticator';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guard/auth.guard';
import { I_USER_REPOSITORY } from '../users/ports/user-repository.interface';
import { I_WEBINAR_REPOSITORY } from '../webinar/ports/webinar-repository.interface';
import { I_ID_GENERATOR } from './ports/id-generator.interface';
import { I_DATE_GENERATOR } from './ports/date-generator.interface';
import { WebinarController } from '../webinar/controllers/webinar.controller';
import { WebinarModule } from '../webinar/webinar.module';

@Module({
  imports: [],
  controllers: [],
  providers: [
    AppService,
    {
      provide: I_ID_GENERATOR,
      useClass: RandomIdGenerator
    },
    {
      provide: I_DATE_GENERATOR,
      useClass: CurrentDateGenerator
    },

  ],
  exports: [I_DATE_GENERATOR, I_ID_GENERATOR]
})
export class CommonModule {}
