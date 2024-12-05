import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { addDays } from 'date-fns';
import { User } from '../entities/user.entity';
import { InMemoryUserRepository } from '../adapters/user-repository.in-memory';
import { IUserRepository } from '../ports/user-repository.interface';
import { INestApplication } from '@nestjs/common';
import { InMemoryWebinarRepository } from '../adapters/webinar-repository.in-memory';

describe('Feature: organizing a webinar', () => {
  let module: TestingModule;
  let app: INestApplication;
  let johnDoe: User;
  let repository: IUserRepository;

  beforeEach(async () => {
    johnDoe = new User({
      id: '1',
      emailAddress: 'j.doe@example.fr',
      password: 'azerty',
    });

    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    repository = app.get(InMemoryUserRepository);
    await repository.create(johnDoe);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Scenario: Happy Path', () => {
    it('should create the webinar', async () => {
      const token = Buffer.from(
        `${johnDoe.props.emailAddress}:${johnDoe.props.password}`,
      ).toString('base64');

      const startDate = addDays(new Date(), 4);
      const endDate = addDays(new Date(), 5);
      const result = await request(app.getHttpServer())
        .post('/webinars')
        .set('Authorization', `Basic ${token}`)
        .send({
          title: 'My first webinar',
          seats: 100,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        });

      expect(result.status).toEqual(201);
      expect(result.body).toEqual({ id: expect.any(String) });

      const webinarRepository = app.get(InMemoryWebinarRepository);
      const webinar = webinarRepository.database[0];
      expect(webinar).toBeDefined();
      expect(webinar.props).toEqual({
        id: result.body.id,
        organizerId: '1',
        title: 'My first webinar',
        seats: 100,
        startDate: startDate,
        endDate: endDate,
      });
    });
  });

  describe('Scenario: The user is not authenticated', () => {
    it('should reject the webinar with anonymous user', async () => {
      const result = await request(app.getHttpServer())
        .post('/webinars')
        .send({
          title: 'My first webinar',
          seats: 100,
          startDate: addDays(new Date(), 4).toISOString(),
          endDate: addDays(new Date(), 5).toISOString(),
        });

      expect(result.status).toEqual(403);
    });

    it("should reject the webinar when it's wrong user", async () => {
      const token = Buffer.from(
        `${johnDoe.props.emailAddress}:invalid`,
      ).toString('base64');

      const result = await request(app.getHttpServer())
        .post('/webinars')
        .set('Authorization', `Basic ${token}`)
        .send({
          title: 'My first webinar',
          seats: 100,
          startDate: addDays(new Date(), 4).toISOString(),
          endDate: addDays(new Date(), 5).toISOString(),
        });

      expect(result.status).toEqual(403);
    });
  });
});
