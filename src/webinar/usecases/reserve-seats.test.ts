import { ReserveSeat } from './reserve-seat';
import { InMemoryParticipationRepository } from '../adapters/participation-repository.in-memory';
import { testUsers } from '../../users/tests/user.seeds';
import { Webinar } from '../entities/webinar.entity';
import { EmailCounterMailer } from '../../core/adapters/mailer.counter';
import { InMemoryUserRepository } from '../../users/adapters/user-repository.in-memory';
import { InMemoryWebinarRepository } from '../adapters/webinar-repository.in-memory';
import { WebinarNotFoundException } from '../exceptions/webinar-not-found';
import { Participation } from '../entities/participation.entity';

describe('Feature: reserving a seat', () => {
  let useCase: ReserveSeat;
  let participationRepository: InMemoryParticipationRepository;
  let mailer: EmailCounterMailer;
  let webinarRepository: InMemoryWebinarRepository;
  let userRepository: InMemoryUserRepository;

  const webinar = new Webinar({
    id: '1',
    organizerId: testUsers.alice.props.id,
    title: 'My first webinar',
    seats: 50,
    startDate: new Date('2023-01-10T10:00:00Z'),
    endDate: new Date('2023-01-10T11:00:00Z'),
  });

  const webinarWithFewSeat = new Webinar({
    id: '2',
    organizerId: 'alice',
    title: 'My first webinar',
    seats: 1,
    startDate: new Date('2023-01-10T10:00:00Z'),
    endDate: new Date('2023-01-10T11:00:00Z'),
  });

  const charlesParticipation = new Participation({
    userId: testUsers.charles.props.id,
    webinarId: webinarWithFewSeat.props.id,
  });

  function expectParticipationNotToBeCreated() {
    const storedParticipation = participationRepository.findOneSync(
      testUsers.bob.props.id,
      webinar.props.id,
    );
    expect(storedParticipation).toBeNull();
  }

  function expectParticipationToBeCreated() {
    const storedParticipation = participationRepository.findOneSync(
      testUsers.bob.props.id,
      webinar.props.id,
    );
    expect(storedParticipation).not.toBeNull();
  }

  beforeEach(() => {
    participationRepository = new InMemoryParticipationRepository([
      charlesParticipation,
    ]);
    mailer = new EmailCounterMailer();
    webinarRepository = new InMemoryWebinarRepository([
      webinar,
      webinarWithFewSeat,
    ]);
    userRepository = new InMemoryUserRepository([
      testUsers.bob,
      testUsers.alice,
      testUsers.charles,
    ]);
    useCase = new ReserveSeat(
      participationRepository,
      mailer,
      webinarRepository,
      userRepository,
    );
  });

  describe('Scenario: Happy Path', () => {
    const payload = {
      user: testUsers.bob,
      webinarId: webinar.props.id,
    };

    it('should reserve a seat', async () => {
      await useCase.execute(payload);
      expectParticipationToBeCreated();
    });

    it('should send an email to the organizer', async () => {
      await useCase.execute(payload);

      expect(mailer.sentEmails[0]).toEqual({
        to: testUsers.alice.props.emailAddress,
        subject: 'A new participant has joined your webinar',
        body: `A new user has reserved a seat for your webinar ${webinar.props.title}`,
      });
      expectParticipationToBeCreated();
    });

    it('should send an email to the participant', async () => {
      await useCase.execute(payload);
      expect(mailer.sentEmails[1]).toEqual({
        to: testUsers.bob.props.emailAddress,
        subject: 'You have reserved a seat for the webinar',
        body: `You have reserved a seat for the webinar ${webinar.props.title}`,
      });
      expectParticipationToBeCreated();
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
      expectParticipationNotToBeCreated();
    });
  });

  describe('Scenario: Webinar does not have enough seats', () => {
    const payload = {
      user: testUsers.bob,
      webinarId: webinarWithFewSeat.props.id,
    };

    it('should throw an error', async () => {
      await expect(useCase.execute(payload)).rejects.toThrow(
        'There is not enough seats for this webinar',
      );
      expectParticipationNotToBeCreated();
    });
  });

  describe('Scenario: the user already participates in the webinar', () => {
    const payload = {
      user: testUsers.charles,
      webinarId: webinarWithFewSeat.props.id,
    };

    it('should throw an error', async () => {
      await expect(useCase.execute(payload)).rejects.toThrow(
        'You already participate in this webinar',
      );
      expectParticipationNotToBeCreated();
    });
  });
});
