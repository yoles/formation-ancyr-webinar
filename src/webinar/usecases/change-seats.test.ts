import { OrganizeWebinar } from './organize-webinar';
import { FixedIdGenerator } from '../../core/adapters/id-generator.stub';
import { InMemoryWebinarRepository } from '../adapters/webinar-repository.in-memory';
import { Webinar } from '../entities/webinar.entity';
import { FixedDateGenerator } from '../../core/adapters/date-generator.stub';
import { User } from '../../users/entities/user.entity';
import { ChangeSeats } from './change-seats';

describe('Feature: change number of seats', () => {
  let useCase: ChangeSeats;
  let webinarRepository: InMemoryWebinarRepository;

  function expectSeatsToRemainUnchanged() {
    const webinar = webinarRepository.findByIdSync("1")
    expect(webinar!.props.seats).toEqual(50);
  }

  const johnDoe = new User({
    id: 'john-doe',
    emailAddress: 'j.doe@example.fr',
    password: 'azerty',
  });

  const bob = new User({
    id: 'bob',
    emailAddress: 'bob@example.fr',
    password: 'azerty',
  });

  const webinar = new Webinar({
    id: "1",
    organizerId: "john-doe",
    title: "My first webinar",
    seats: 50,
    startDate: new Date("2023-01-10T10:00:00Z"),
    endDate: new Date("2023-01-10T11:00:00Z")
  });

  beforeEach(async () => {
    webinarRepository = new InMemoryWebinarRepository([webinar])
    useCase = new ChangeSeats(webinarRepository);
  });

  describe("Scenario: Happy Path", () => {
    it('should change the number of seats', async () => {
      const webinarId = "1";
      await useCase.execute({
        user: johnDoe,
        webinarId: webinarId,
        seats: 100
      });

      const webinar = await webinarRepository.findById(webinarId)
      expect(webinar!.props.seats).toEqual(100);
    });
  })

  describe("Scenario: Webinar does not exist", () => {
    it('should fail', async () => {
      await expect(useCase.execute({
        user: johnDoe,
        webinarId: '2',
        seats: 200
      })).rejects.toThrow("Webinar not found")

      expectSeatsToRemainUnchanged()
    });
  })


  describe("Scenario: Update webinar of someone else", () => {
    it('should fail', async () => {
      await expect(useCase.execute({
        user: bob,
        webinarId: '1',
        seats: 100
      })).rejects.toThrow("You are not allowed to update this webinar")

      expectSeatsToRemainUnchanged()
    });
  })

  describe("Scenario: Reduce the number of seats of a webinar ", () => {
    it('should fail', async () => {
      await expect(useCase.execute({
        user: johnDoe,
        webinarId: '1',
        seats: 49
      })).rejects.toThrow("You cannot reduce the number of seats")

      expectSeatsToRemainUnchanged()
    });
  })

  describe("Scenario: Exceed the maximum amount of seats for a webinar ", () => {
    it('should fail', async () => {
      await expect(useCase.execute({
        user: johnDoe,
        webinarId: '1',
        seats: 1001
      })).rejects.toThrow("The webinar must have a maximum of 1000 seats")

      expectSeatsToRemainUnchanged()
    });
  })
});
