import { testUsers } from 'src/users/tests/user.seeds';
import { CancelSeat } from './cancel-seat';
import { Webinar } from '../entities/webinar.entity';
import { Participation } from '../entities/participation.entity';
import { InMemoryWebinarRepository } from '../adapters/webinar-repository.in-memory';
import { InMemoryParticipationRepository } from '../adapters/participation-repository.in-memory';
import { InMemoryUserRepository } from 'src/users/adapters/user-repository.in-memory';
import { EmailCounterMailer } from 'src/core/adapters/mailer.counter';
import { WebinarNotFoundException } from '../exceptions/webinar-not-found';
import { ParticipationNotFoundException } from '../exceptions/participation-not-found';

describe('Feature: canceling a seat', () => {
  function expectParticipationNotToBeDeleted() {
    const storedParticipation = participationRepository.findOneSync(
      testUsers.bob.props.id,
      webinar.props.id,
    );
    expect(storedParticipation).not.toBeNull();
  }

  function expectParticipationToBeDeleted() {
    const storedParticipation = participationRepository.findOneSync(
      testUsers.bob.props.id,
      webinar.props.id,
    );
    expect(storedParticipation).toBeNull();
  }

  let useCase: CancelSeat;
  let webinarRepository: InMemoryWebinarRepository;
  let participationRepository: InMemoryParticipationRepository;
  let userRepository: InMemoryUserRepository;
  let mailer: EmailCounterMailer;

  const webinar = new Webinar({
    id: '1',
    organizerId: testUsers.alice.props.id,
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
    participationRepository = new InMemoryParticipationRepository([
      bobParticipation,
    ]);
    userRepository = new InMemoryUserRepository([
      testUsers.alice,
      testUsers.bob,
    ]);
    mailer = new EmailCounterMailer();
    useCase = new CancelSeat(
      webinarRepository,
      participationRepository,
      userRepository,
      mailer,
    );
  });

  describe('Scenario: Happy Path', () => {
    const payload = {
      user: testUsers.bob,
      webinarId: '1',
    };

    it('should cancel the seat', async () => {
      await useCase.execute(payload);
      expectParticipationToBeDeleted();
    });

    it('should send an email to the organizer', async () => {
      await useCase.execute(payload);

      expect(mailer.sentEmails[0]).toEqual({
        to: testUsers.alice.props.emailAddress,
        subject: 'A participant canceled his seat',
        body: `A participant canceled his seat for the webinar "${webinar.props.title}"`,
      });
    });

    it('should send a confirmation email to the participants', async () => {
      await useCase.execute(payload);

      expect(mailer.sentEmails[1]).toEqual({
        to: testUsers.bob.props.emailAddress,
        subject: 'Your seat has been canceled',
        body: `Your seat has been canceled for the webinar "${webinar.props.title}"`,
      });
    });
  });

  describe('Scenario: Webinar does not exist', () => {
    const payload = {
      user: testUsers.bob,
      webinarId: 'random',
    };

    it('should throw an error', async () => {
      await expect(useCase.execute(payload)).rejects.toThrow(
        WebinarNotFoundException,
      );
      expectParticipationNotToBeDeleted();
    });
  });

  describe('Scenario: User did not register for the webinar', () => {
    const payload = {
      user: testUsers.charles,
      webinarId: '1',
    };

    it('should throw an error', async () => {
      await expect(useCase.execute(payload)).rejects.toThrow(
        ParticipationNotFoundException,
      );
      expectParticipationNotToBeDeleted();
    });
  });
});
