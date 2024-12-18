import * as request from 'supertest';
import { addDays } from 'date-fns';
import { TestApp } from './utils/test-app';
import { e2eUsers } from './seeds/user.seeds';
import {
  I_WEBINAR_REPOSITORY,
  IWebinarRepository,
} from '../webinar/ports/webinar-repository.interface';

describe('Feature: organizing a webinar', () => {
  let app: TestApp;

  beforeEach(async () => {
    app = new TestApp();
    await app.setup()
    await app.loadFixtures([e2eUsers.johnDoe]);
  });

  afterEach(async () => {
    await app.cleanup();
  });

  describe('Scenario: Happy Path', () => {
    it('should create the webinar', async () => {
      const startDate = addDays(new Date(), 4);
      const endDate = addDays(new Date(), 5);
      const result = await request(app.getHttpServer())
        .post('/webinars')
        .set('Authorization', e2eUsers.johnDoe.createValidAuthorizationToken())
        .send({
          title: 'My first webinar',
          seats: 100,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        });
      expect(result.status).toEqual(201);
      expect(result.body).toEqual({ id: expect.any(String) });

      const webinarRepository = app
        .get<IWebinarRepository>(I_WEBINAR_REPOSITORY);

      const webinar = await webinarRepository.findById(
        result.body.id
      );

      expect(webinar).toBeDefined();
      expect(webinar!.props).toEqual({
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
      const result = await request(app.getHttpServer())
        .post('/webinars')
        .set('Authorization', e2eUsers.johnDoe.createInvalidAuthorizationToken())
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
