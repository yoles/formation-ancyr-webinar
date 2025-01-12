import * as request from 'supertest';
import { addDays } from 'date-fns';
import { TestApp } from './utils/test-app';
import { e2eUsers } from './seeds/user.seeds.e2e';
import {
  I_WEBINAR_REPOSITORY,
  IWebinarRepository,
} from '../webinar/ports/webinar-repository.interface';
import { WebinarFixture } from './fixtures/webinar.fixture';
import { Webinar } from '../webinar/entities/webinar.entity';

describe('Feature: change dates of a webinar', () => {
  let app: TestApp;

  beforeEach(async () => {
    app = new TestApp();
    await app.setup();
    await app.loadFixtures([
      e2eUsers.johnDoe,
      new WebinarFixture(
        new Webinar({
          id: '1',
          organizerId: e2eUsers.johnDoe.entity.props.id,
          seats: 50,
          title: 'My first webinar',
          startDate: addDays(new Date(), 4),
          endDate: addDays(new Date(), 5),
        }),
      ),
    ]);
  });

  afterEach(async () => {
    await app.cleanup();
  });

  describe('Scenario: Happy Path', () => {
    it('should update the dates of a webinar', async () => {
      const startDate = addDays(new Date(), 5);
      const endDate = addDays(new Date(), 6);
      const id = '1';

      const result = await request(app.getHttpServer())
        .post(`/webinars/${id}/dates`)
        .set('Authorization', e2eUsers.johnDoe.createValidAuthorizationToken())
        .send({ startDate, endDate });

      expect(result.status).toEqual(200);

      const webinarRepository =
        app.get<IWebinarRepository>(I_WEBINAR_REPOSITORY);

      const webinar = await webinarRepository.findById(id);

      expect(webinar).toBeDefined();
      expect(webinar!.props.startDate).toEqual(startDate);
      expect(webinar!.props.endDate).toEqual(endDate);
    });
  });

  describe('Scenario: The user is not authenticated', () => {
    const startDate = addDays(new Date(), 5);
    const endDate = addDays(new Date(), 6);
    const id = '1';

    it('should reject the webinar update with anonymous user', async () => {
      const result = await request(app.getHttpServer())
        .post(`/webinars/${id}/dates`)
        .send({ startDate, endDate });

      expect(result.status).toEqual(403);
    });

    it("should reject the webinar update when it's wrong user", async () => {
      const seats = 100;
      const id = '1';

      const result = await request(app.getHttpServer())
        .post(`/webinars/${id}/seats`)
        .set(
          'Authorization',
          e2eUsers.johnDoe.createInvalidAuthorizationToken(),
        )
        .send({ seats });

      expect(result.status).toEqual(403);
    });
  });
});
