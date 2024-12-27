import * as request from 'supertest';
import { addDays } from 'date-fns';
import { TestApp } from './utils/test-app';
import { e2eUsers } from './seeds/user.seeds';
import {
  I_WEBINAR_REPOSITORY,
  IWebinarRepository,
} from '../webinar/ports/webinar-repository.interface';
import { WebinarFixture } from './fixtures/webinar.fixture';
import { Webinar } from '../webinar/entities/webinar.entity';

describe('Feature: organizing a webinar', () => {
  let app: TestApp;

  beforeEach(async () => {
    app = new TestApp();
    await app.setup()
    await app.loadFixtures([e2eUsers.johnDoe, new WebinarFixture(new Webinar({
      id: "1",
      organizerId: e2eUsers.johnDoe.entity.props.id,
      seats: 50,
      title: "My first webinar",
      startDate: new Date("2023-01-10T10:00:00Z"),
      endDate: new Date("2023-01-10T11:00:00Z")
    }))]);
  });

  afterEach(async () => {
    await app.cleanup();
  });

  describe('Scenario: Happy Path', () => {
    it('should update the number of seats for a webinar', async () => {
      const seats = 100;
      const id = "1";

      const result = await request(app.getHttpServer())
        .post(`/webinars/${id}/seats`)
        .set('Authorization', e2eUsers.johnDoe.createValidAuthorizationToken())
        .send({seats});

      expect(result.status).toEqual(200);

      const webinarRepository = app
        .get<IWebinarRepository>(I_WEBINAR_REPOSITORY);

      const webinar = await webinarRepository.findById(id);

      expect(webinar).toBeDefined();
      expect(webinar!.props.seats).toEqual(seats);
    });
  });

  describe('Scenario: The user is not authenticated', () => {
    const seats = 100;
    const id = "1";

    it('should reject the webinar update with anonymous user', async () => {
      const result = await request(app.getHttpServer())
        .post(`/webinars/${id}/seats`)
        .send({seats});

      expect(result.status).toEqual(403);
    });

    it("should reject the webinar update when it's wrong user", async () => {
      const seats = 100;
      const id = "1";

      const result = await request(app.getHttpServer())
        .post(`/webinars/${id}/seats`)
        .set('Authorization', e2eUsers.johnDoe.createInvalidAuthorizationToken())
        .send({seats});

      expect(result.status).toEqual(403);
    });
  });
});
