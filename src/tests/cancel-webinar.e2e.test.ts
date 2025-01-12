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

describe('Feature: canceling the webinar', () => {
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
    it('should succeed', async () => {
      const id = '1';

      const result = await request(app.getHttpServer())
        .delete(`/webinars/${id}`)
        .set('Authorization', e2eUsers.johnDoe.createValidAuthorizationToken());

      expect(result.status).toEqual(200);

      const webinarRepository =
        app.get<IWebinarRepository>(I_WEBINAR_REPOSITORY);

      const webinar = await webinarRepository.findById(id);
      expect(webinar).toBeNull();
    });
  });

  describe('Scenario: The user is not authenticated', () => {
    const id = '1';

    it('should reject the webinar update with anonymous user', async () => {
      const result = await request(app.getHttpServer())
        .delete(`/webinars/${id}`)
        .send();

      expect(result.status).toEqual(403);
    });

    it("should reject the cancel of a webinar when it's wrong user", async () => {
      const id = '1';

      const result = await request(app.getHttpServer())
        .delete(`/webinars/${id}`)
        .set(
          'Authorization',
          e2eUsers.johnDoe.createInvalidAuthorizationToken(),
        )
        .send();

      expect(result.status).toEqual(403);
    });
  });
});
