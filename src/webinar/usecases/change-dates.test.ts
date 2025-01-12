import { ChangeDates } from './change-dates';
import { testUsers } from '../../users/tests/user.seeds';
import { Webinar } from '../entities/webinar.entity';
import { InMemoryWebinarRepository } from '../adapters/webinar-repository.in-memory';
import { FixedDateGenerator } from '../../core/adapters/date-generator.stub';
import { Participation } from '../entities/participation.entity';
import { InMemoryParticipationRepository } from '../adapters/participation-repository.in-memory';
import { EmailCounterMailer } from 'src/core/adapters/mailer.counter';
import { InMemoryUserRepository } from 'src/users/adapters/user-repository.in-memory';
import { WebinarNotFoundException } from '../exceptions/webinar-not-found';
import { WebinarUpdateForbidden } from '../exceptions/webinar-update-forbidden';

describe('Feature: changing the dates of a webinar', () => {
  function expectDatesToRemainUnchanged() {
    const updatedWebinar = webinarRepository.findByIdSync('1')!;
    expect(updatedWebinar.props.startDate).toEqual(webinar.props.startDate);
    expect(updatedWebinar.props.endDate).toEqual(webinar.props.endDate);
  }

  const webinar = new Webinar({
    id: '1',
    organizerId: 'alice',
    title: 'My first webinar',
    seats: 50,
    startDate: new Date('2024-01-10T10:00:00Z'),
    endDate: new Date('2024-01-10T11:00:00Z'),
  });
  const bobParticipation = new Participation({
    userId: 'bob',
    webinarId: '1',
  });
  let webinarRepository: InMemoryWebinarRepository;
  let dateGenerator: FixedDateGenerator;
  let participationRepository: InMemoryParticipationRepository;
  let mailer: EmailCounterMailer;
  let userRepository: InMemoryUserRepository;
  let useCase: ChangeDates;

  beforeEach(async () => {
    webinarRepository = new InMemoryWebinarRepository([webinar]);
    participationRepository = new InMemoryParticipationRepository([
      bobParticipation,
    ]);
    mailer = new EmailCounterMailer();
    userRepository = new InMemoryUserRepository([
      testUsers.bob,
      testUsers.alice,
    ]);
    dateGenerator = new FixedDateGenerator();
    useCase = new ChangeDates(
      webinarRepository,
      dateGenerator,
      participationRepository,
      mailer,
      userRepository,
    );
  });

  describe('Scenario: Happy Path', () => {
    const payload = {
      user: testUsers.alice,
      webinarId: '1',
      startDate: new Date('2024-01-20T07:00:00.000Z'),
      endDate: new Date('2024-01-20T08:00:00.000Z'),
    };
    it('should change dates', async () => {
      await useCase.execute(payload);

      const updatedWebinar = webinarRepository.findByIdSync('1')!;
      expect(updatedWebinar.props.startDate).toEqual(payload.startDate);
      expect(updatedWebinar.props.endDate).toEqual(payload.endDate);
    });

    it('should send email to participants', async () => {
      await useCase.execute(payload);
      expect(mailer.sentEmails).toEqual([
        {
          to: testUsers.bob.props.emailAddress,
          subject: 'The date of your webinar has been updated',
          body: 'The dates of your webinar "My first webinar" have been updated',
        },
      ]);
    });
  });

  describe('Scenario: Webinar does not exists', () => {
    const payload = {
      user: testUsers.alice,
      webinarId: '2',
      startDate: new Date('2024-01-20T07:00:00.000Z'),
      endDate: new Date('2024-01-20T08:00:00.000Z'),
    };

    it('it should fail if the webinar is not found', async () => {
      await expect(() => useCase.execute(payload)).rejects.toThrow(
        WebinarNotFoundException,
      );
      expectDatesToRemainUnchanged();
    });
  });

  describe('Scenario: Updating webinar of someone else', () => {
    const payload = {
      user: testUsers.bob,
      webinarId: '1',
      startDate: new Date('2024-01-20T07:00:00.000Z'),
      endDate: new Date('2024-01-20T08:00:00.000Z'),
    };

    it('it should fail if the webinar is own by someone else', async () => {
      await expect(() => useCase.execute(payload)).rejects.toThrow(
        WebinarUpdateForbidden,
      );

      const updatedWebinar = webinarRepository.findByIdSync('1')!;
      expect(updatedWebinar.props.startDate).toEqual(webinar.props.startDate);
      expect(updatedWebinar.props.endDate).toEqual(webinar.props.endDate);
    });
  });

  describe('Scenario: Date are too close', () => {
    const payload = {
      user: testUsers.alice,
      webinarId: '1',
      startDate: new Date('2024-01-03T00:00:00.000Z'),
      endDate: new Date('2024-01-03T00:00:00.000Z'),
    };

    it('it should fail', async () => {
      await expect(() => useCase.execute(payload)).rejects.toThrow(
        'The webinar must happen at least 3 days from now',
      );
      expectDatesToRemainUnchanged();
    });
  });
});
