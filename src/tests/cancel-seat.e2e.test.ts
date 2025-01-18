import * as request from 'supertest';
import { TestApp } from './utils/test-app';
import { e2eUsers } from './seeds/user.seeds.e2e';
import {
  I_PARTICIPATION_REPOSITORY,
  IParticipationRepository,
} from '../webinar/ports/participation-repository.interface';
import { e2eWebinars } from './seeds/webinar.seeds.e2e';
import { Participation } from '../webinar/entities/participation.entity';
import { ParticipationFixture } from './fixtures/participation.fixture';

describe('Feature: Cancelling a seat', () => {
  let app: TestApp;

  beforeEach(async () => {
    app = new TestApp();
    await app.setup();
    await app.loadFixtures([
      e2eUsers.johnDoe,
      e2eUsers.bob,
      e2eWebinars.webinar1,
      new ParticipationFixture(
        new Participation({
          userId: e2eUsers.bob.entity.props.id,
          webinarId: e2eWebinars.webinar1.entity.props.id,
        }),
      ),
    ]);
  });

  afterEach(async () => {
    await app.cleanup();
  });

  describe('Scenario: Happy Path', () => {
    it('should succeed', async () => {
      const id = e2eWebinars.webinar1.entity.props.id;

      const result = await request(app.getHttpServer())
        .delete(`/webinars/${id}/participation`)
        .set('Authorization', e2eUsers.bob.createValidAuthorizationToken());

      expect(result.status).toEqual(200);

      const participationRepository = app.get<IParticipationRepository>(
        I_PARTICIPATION_REPOSITORY,
      );

      const participation = await participationRepository.findOne(
        e2eUsers.bob.entity.props.id,
        id,
      );
      expect(participation).toBeNull();
    });
  });

  describe('Scenario: The user is not authenticated', () => {
    const id = e2eWebinars.webinar1.entity.props.id;

    it('should reject the webinar update with anonymous user', async () => {
      const result = await request(app.getHttpServer())
        .delete(`/webinars/${id}/participation`)
        .send();

      expect(result.status).toEqual(403);
    });

    it("should reject the cancel of a webinar when it's wrong user", async () => {
      const id = e2eWebinars.webinar1.entity.props.id;

      const result = await request(app.getHttpServer())
        .delete(`/webinars/${id}/participation`)
        .set(
          'Authorization',
          e2eUsers.johnDoe.createInvalidAuthorizationToken(),
        )
        .send();

      expect(result.status).toEqual(403);
    });
  });
});
