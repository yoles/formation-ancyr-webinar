import * as request from 'supertest';
import { TestApp } from './utils/test-app';
import { e2eUsers } from './seeds/user.seeds.e2e';
import { e2eWebinars } from './seeds/webinar.seeds.e2e';

describe('Feature: Get Webinar By Id', () => {
  let app: TestApp;

  beforeEach(async () => {
    app = new TestApp();
    await app.setup();
    await app.loadFixtures([e2eUsers.johnDoe, e2eWebinars.webinar1]);
  });

  afterEach(async () => {
    await app.cleanup();
  });

  describe('Scenario: Happy Path', () => {
    it('should succeed', async () => {
      const webinar = e2eWebinars.webinar1.entity;
      const organizer = e2eUsers.johnDoe.entity;
      const id = webinar.props.id;

      const result = await request(app.getHttpServer())
        .get(`/webinars/${id}`)
        .set('Authorization', e2eUsers.johnDoe.createValidAuthorizationToken());

      expect(result.status).toEqual(200);
      expect(result.body).toEqual({
        id: webinar.props.id,
        title: webinar.props.title,
        startDate: webinar.props.startDate.toISOString(),
        endDate: webinar.props.endDate.toISOString(),
        seats: {
          reserved: 0,
          available: webinar.props.seats,
        },
        organizer: {
          id: organizer.props.id,
          emailAddress: organizer.props.emailAddress,
        },
      });
    });
  });

  describe('Scenario: The user is not authenticated', () => {
    const id = e2eWebinars.webinar1.entity.props.id;

    it('should reject the webinar update with anonymous user', async () => {
      const result = await request(app.getHttpServer())
        .get(`/webinars/${id}`)
        .send();

      expect(result.status).toEqual(403);
    });

    it("should reject the cancel of a webinar when it's wrong user", async () => {
      const id = e2eWebinars.webinar1.entity.props.id;

      const result = await request(app.getHttpServer())
        .get(`/webinars/${id}`)
        .set(
          'Authorization',
          e2eUsers.johnDoe.createInvalidAuthorizationToken(),
        )
        .send();

      expect(result.status).toEqual(403);
    });
  });
});
