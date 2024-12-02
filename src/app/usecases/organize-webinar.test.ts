import { OrganizeWebinar } from './organize-webinar';
import { FixedIdGenerator } from '../adapters/id-generator.stub';
import { InMemoryWebinarRepository } from '../adapters/webinar-repository.in-memory';

describe('Feature: organizing a webinar', () => {
  let idGenerator: FixedIdGenerator;
  let repository: InMemoryWebinarRepository;
  let useCase: OrganizeWebinar;

  beforeEach(() => {
    idGenerator = new FixedIdGenerator();
    repository = new InMemoryWebinarRepository();
    useCase = new OrganizeWebinar(repository, idGenerator);
  });

  describe('Scenario: happy path', () => {
    it('Should give and id to the webinar', async () => {
      const result = await useCase.execute({
        title: 'My first webinar',
        seats: 100,
        startDate: new Date('2024-01-10T10:00:00Z'),
        endDate: new Date('2024-01-10T11:00:00Z'),
      });

      expect(result.id).toEqual('1');
    });
    it('Should insert the webinar into the database', async () => {
      await useCase.execute({
        title: 'My first webinar',
        seats: 100,
        startDate: new Date('2024-01-10T10:00:00Z'),
        endDate: new Date('2024-01-10T11:00:00Z'),
      });

      expect(repository.database.length).toEqual(1);
      const createdWebinar = repository.database[0];
      expect(createdWebinar.props).toEqual({
        id: '1',
        title: 'My first webinar',
        seats: 100,
        startDate: new Date('2024-01-10T10:00:00Z'),
        endDate: new Date('2024-01-10T11:00:00Z'),
      });
    });
  });
});
