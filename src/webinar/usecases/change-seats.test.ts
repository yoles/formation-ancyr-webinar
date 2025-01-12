import { OrganizeWebinar } from './organize-webinar';
import { FixedIdGenerator } from '../../core/adapters/id-generator.stub';
import { InMemoryWebinarRepository } from '../adapters/webinar-repository.in-memory';
import { Webinar } from '../entities/webinar.entity';
import { FixedDateGenerator } from '../../core/adapters/date-generator.stub';
import { User } from '../../users/entities/user.entity';
import { ChangeSeats } from './change-seats';
import { testUsers } from '../../users/tests/user.seeds';

describe('Feature: change number of seats', () => {
  let useCase: ChangeSeats;
  let webinarRepository: InMemoryWebinarRepository;

  function expectSeatsToRemainUnchanged() {
    const webinar = webinarRepository.findByIdSync('1');
    expect(webinar!.props.seats).toEqual(50);
  }

  const webinar = new Webinar({
    id: '1',
    organizerId: 'alice',
    title: 'My first webinar',
    seats: 50,
    startDate: new Date('2023-01-10T10:00:00Z'),
    endDate: new Date('2023-01-10T11:00:00Z'),
  });

  beforeEach(async () => {
    webinarRepository = new InMemoryWebinarRepository([webinar]);
    useCase = new ChangeSeats(webinarRepository);
  });

  describe('Scenario: Happy Path', () => {
    const payload = {
      user: testUsers.alice,
      webinarId: '1',
      seats: 100,
    };

    it('should change the number of seats', async () => {
      await useCase.execute(payload);

      const webinar = await webinarRepository.findById('1');
      expect(webinar!.props.seats).toEqual(100);
    });
  });

  describe('Scenario: Webinar does not exist', () => {
    const payload = {
      user: testUsers.alice,
      webinarId: '2',
      seats: 200,
    };

    it('should fail', async () => {
      await expect(useCase.execute(payload)).rejects.toThrow(
        'Webinar not found',
      );
      expectSeatsToRemainUnchanged();
    });
  });

  describe('Scenario: Update webinar of someone else', () => {
    const payload = {
      user: testUsers.bob,
      webinarId: '1',
      seats: 100,
    };

    it('should fail', async () => {
      await expect(useCase.execute(payload)).rejects.toThrow(
        'You are not allowed to update this webinar',
      );
      expectSeatsToRemainUnchanged();
    });
  });

  describe('Scenario: Reduce the number of seats of a webinar ', () => {
    const payload = {
      user: testUsers.alice,
      webinarId: '1',
      seats: 49,
    };
    it('should fail', async () => {
      await expect(useCase.execute(payload)).rejects.toThrow(
        'You cannot reduce the number of seats',
      );
      expectSeatsToRemainUnchanged();
    });
  });

  describe('Scenario: Exceed the maximum amount of seats for a webinar ', () => {
    const payload = {
      user: testUsers.alice,
      webinarId: '1',
      seats: 1001,
    };

    it('should fail', async () => {
      await expect(useCase.execute(payload)).rejects.toThrow(
        'The webinar must have a maximum of 1000 seats',
      );
      expectSeatsToRemainUnchanged();
    });
  });
});
