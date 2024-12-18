import { Module } from '@nestjs/common';
import { InMemoryWebinarRepository } from './adapters/webinar-repository.in-memory';
import { OrganizeWebinar } from './usecases/organize-webinar';
import { I_WEBINAR_REPOSITORY } from './ports/webinar-repository.interface';
import { WebinarController } from './controllers/webinar.controller';
import { I_ID_GENERATOR } from '../core/ports/id-generator.interface';
import { I_DATE_GENERATOR } from '../core/ports/date-generator.interface';
import { CommonModule } from '../core/common.module';

@Module({
  imports: [CommonModule],
  controllers: [WebinarController],
  providers: [
    {
      provide: I_WEBINAR_REPOSITORY,
      useFactory: () => {
        return new InMemoryWebinarRepository()
      }
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
    }
  ],
  exports: [I_WEBINAR_REPOSITORY]
})
export class WebinarModule {}
