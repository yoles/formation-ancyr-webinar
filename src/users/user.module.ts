import { Module } from '@nestjs/common';
import { InMemoryUserRepository } from './adapters/user-repository.in-memory';
import { I_USER_REPOSITORY } from './ports/user-repository.interface';


@Module({
  imports: [],
  controllers: [],
  providers: [
    {
      provide: I_USER_REPOSITORY,
      useFactory: () => {
        return new InMemoryUserRepository()
      }
    },
  ],
  exports: [I_USER_REPOSITORY]
})
export class UserModule {}
