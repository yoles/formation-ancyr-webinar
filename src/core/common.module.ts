import { Module } from '@nestjs/common';

import { AppService } from './app.service';
import { CurrentDateGenerator } from './adapters/date-generator.system';
import { RandomIdGenerator } from './adapters/id-generator.system';
import { I_ID_GENERATOR } from './ports/id-generator.interface';
import { I_DATE_GENERATOR } from './ports/date-generator.interface';
import { I_MAILER } from './ports/mailer.interface';
import { EmailCounterMailer } from './adapters/mailer.counter';

@Module({
  imports: [],
  controllers: [],
  providers: [
    AppService,
    {
      provide: I_ID_GENERATOR,
      useClass: RandomIdGenerator,
    },
    {
      provide: I_DATE_GENERATOR,
      useClass: CurrentDateGenerator,
    },
    {
      provide: I_MAILER,
      useClass: EmailCounterMailer,
    },
  ],
  exports: [I_DATE_GENERATOR, I_ID_GENERATOR, I_MAILER],
})
export class CommonModule {}
