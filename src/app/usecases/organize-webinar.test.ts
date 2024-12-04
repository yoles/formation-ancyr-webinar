import { OrganizeWebinar } from './organize-webinar';
import { FixedIdGenerator } from '../adapters/id-generator.stub';
import { InMemoryWebinarRepository } from '../adapters/webinar-repository.in-memory';
import { Webinar } from '../entities/webinar.entity';
import { FixedDateGenerator } from '../adapters/date-generator.stub';
import { User } from '../entities/user.entity';

describe('Feature: organizing a webinar', () => {
  let idGenerator: FixedIdGenerator;
  let dateGenerator: FixedDateGenerator;
  let repository: InMemoryWebinarRepository;
  let useCase: OrganizeWebinar;
  const johnDoe = new User({ id: "john-doe"});

  function expectWebinarToEqual(createdWebinar: Webinar) {
    expect(createdWebinar.props).toEqual({
      id: '1',
      title: 'My first webinar',
      seats: 100,
      startDate: new Date('2024-01-12T10:00:00Z'),
      endDate: new Date('2024-01-12T11:00:00Z'),
      organizerId: "john-doe"
    });
  }

  beforeEach(() => {
    idGenerator = new FixedIdGenerator();
    dateGenerator = new FixedDateGenerator();
    repository = new InMemoryWebinarRepository();
    useCase = new OrganizeWebinar(repository, idGenerator, dateGenerator);
  });

  describe('Scenario: happy path', () => {
    const payload = {
      user: johnDoe,
      title: 'My first webinar',
      seats: 100,
      startDate: new Date('2024-01-12T10:00:00Z'),
      endDate: new Date('2024-01-12T11:00:00Z'),
    };

    it('Should give and id to the webinar', async () => {
      const result = await useCase.execute(payload);
      expect(result.id).toEqual('1');
    });

    it('Should insert the webinar into the database', async () => {
      await useCase.execute(payload);
      expect(repository.database.length).toEqual(1);

      const createdWebinar = repository.database[0];
      expectWebinarToEqual(createdWebinar);
    });
  });

  describe('Scenario: the webinar happen to soon', () => {
    const payload = {
      user: johnDoe,
      title: 'My first webinar',
      seats: 100,
      startDate: new Date('2024-01-03T23:59:59Z'),
      endDate: new Date('2024-01-04T0:59:00Z'),
    };

    it('Should throw an error', async () => {
      await expect(
        () => useCase.execute(payload)).rejects.toThrow(
         "The webinar must happen 3 days from now"
      );
    });

    it('Should not create a webinar', async () => {
      try {
        await useCase.execute(payload)
      } catch (error) {}
      expect(repository.database.length).toEqual(0);
    });
  });

  describe('Scenario: the webinar has too many seats', () => {
    const payload = {
      user: johnDoe,
      title: 'My first webinar',
      seats: 1001,
      startDate: new Date('2024-01-12T10:00:00Z'),
      endDate: new Date('2024-01-12T11:00:00Z'),
    };

    it('Should throw an error', async () => {
      await expect(
        () => useCase.execute(payload)).rejects.toThrow(
        "The webinar must have a maximum of 1500 seats"
      );
    });

    it('Should not create a webinar', async () => {
      try {
        await useCase.execute(payload)
      } catch (error) {}
      expect(repository.database.length).toEqual(0);
    });
  });

  describe('Scenario: the webinar has not enough seats', () => {
    const payload = {
      user: johnDoe,
      title: 'My first webinar',
      seats: 0,
      startDate: new Date('2024-01-12T10:00:00Z'),
      endDate: new Date('2024-01-12T11:00:00Z'),
    };

    it('Should throw an error', async () => {
      await expect(
        () => useCase.execute(payload)).rejects.toThrow(
        "The webinar must have a minimum of 1 seat"
      );
    });

    it('Should not create a webinar', async () => {
      try {
        await useCase.execute(payload)
      } catch (error) {}
      expect(repository.database.length).toEqual(0);
    });
  });
});
