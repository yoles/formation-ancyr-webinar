import { Webinar } from '../entities/webinar.entity';
import { testUsers } from '../../users/tests/user.seeds';
import { CancelWebinar } from './cancel-webinar';
import { InMemoryWebinarRepository } from '../adapters/webinar-repository.in-memory';
import { WebinarNotFoundException } from '../exceptions/webinar-not-found';
import { WebinarUpdateForbidden } from '../exceptions/webinar-update-forbidden';
import { EmailCounterMailer } from 'src/core/adapters/mailer.counter';
import { Participation } from '../entities/participation.entity';
import { InMemoryParticipationRepository } from '../adapters/participation-repository.in-memory';
import { InMemoryUserRepository } from 'src/users/adapters/user-repository.in-memory';

describe('Feature: canceling a webinar', () => {
  async function expectWebinarToBeDeleted() {
    const deletedWebinar = await webinarRepository.findById('1');
    expect(deletedWebinar).toBeNull();
  }

  async function expectWebinarNotToBeDeleted() {
    const deletedWebinar = await webinarRepository.findById('1');
    expect(deletedWebinar).not.toBeNull();
  }

  let useCase: CancelWebinar;
  let webinarRepository: InMemoryWebinarRepository;
  let mailer: EmailCounterMailer;
  let participationRepository: InMemoryParticipationRepository;
  let userRepository: InMemoryUserRepository;
  const webinar = new Webinar({
    id: '1',
    organizerId: 'alice',
    title: 'My first webinar',
    seats: 50,
    startDate: new Date('2023-01-10T10:00:00Z'),
    endDate: new Date('2023-01-10T11:00:00Z'),
  });

  const bobParticipation = new Participation({
    userId: testUsers.bob.props.id,
    webinarId: webinar.props.id,
  });

  beforeEach(() => {
    webinarRepository = new InMemoryWebinarRepository([webinar]);
    mailer = new EmailCounterMailer();
    participationRepository = new InMemoryParticipationRepository([
      bobParticipation,
    ]);
    userRepository = new InMemoryUserRepository([
      testUsers.bob,
      testUsers.alice,
    ]);
    useCase = new CancelWebinar(
      webinarRepository,
      mailer,
      participationRepository,
      userRepository,
    );
  });

  describe('Scenario: Happy Path', () => {
    const payload = {
      user: testUsers.alice,
      webinarId: '1',
    };

    it('should delete the webinar', async () => {
      await useCase.execute(payload);

      expectWebinarToBeDeleted();
    });

    it('should send email to the participants', async () => {
      await useCase.execute(payload);

      expect(mailer.sentEmails).toEqual([
        {
          to: testUsers.bob.props.emailAddress,
          subject: 'Webinar canceled',
          body: `The webinar ${webinar.props.title} has been canceled`,
        },
      ]);
    });
  });

  describe('Scenario: Webinar does not exist', () => {
    it('should throw an error', async () => {
      // As execute return a promise, we need to use rejects to
      // indicate that the promise is rejected
      await expect(
        useCase.execute({
          user: testUsers.alice,
          webinarId: 'random',
        }),
      ).rejects.toThrow(WebinarNotFoundException);

      expectWebinarNotToBeDeleted();
    });
  });

  describe('Scenario: deleting the webinar of someone else', () => {
    it('should throw an error', async () => {
      await expect(
        useCase.execute({
          user: testUsers.bob,
          webinarId: '1',
        }),
      ).rejects.toThrow(WebinarUpdateForbidden);

      expectWebinarNotToBeDeleted();
    });
  });
});
