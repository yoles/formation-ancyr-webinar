import { Model } from 'mongoose';
import { TestApp } from '../../../tests/utils/test-app';
import { MongoWebinar } from './mongo-webinar';
import { MongoWebinarRepository } from './mongo-webinar.repository';
import { Webinar } from '../../entities/webinar.entity';
import { getModelToken } from '@nestjs/mongoose';

const cleanArchitectureWebinar = new Webinar({
  organizerId: '1',
  id: '1',
  title: 'Clean Architecture',
  seats: 100,
  startDate: new Date('2024-01-01T00:00:00.000Z'),
  endDate: new Date('2024-01-01T02:00:00.000Z'),
});
const cqrsWebinar = new Webinar({
  organizerId: '1',
  id: '2',
  title: 'CQRS',
  seats: 100,
  startDate: new Date('2024-01-05T00:00:00.000Z'),
  endDate: new Date('2024-01-05T02:00:00.000Z'),
});

describe('MongoWebinarRepository', () => {
  async function createWebinarInDatabase(webinar: Webinar) {
    const record = new model({
      _id: webinar.props.id,
      organizerId: webinar.props.organizerId,
      title: webinar.props.title,
      seats: webinar.props.seats,
      startDate: webinar.props.startDate,
      endDate: webinar.props.endDate,
    });
    await record.save(); // Pattern Active Record
  }

  let app: TestApp;
  let model: Model<MongoWebinar.SchemaClass>;
  let repository: MongoWebinarRepository;

  beforeEach(async () => {
    app = new TestApp();
    await app.setup();
    model = app.get<Model<MongoWebinar.SchemaClass>>(
      getModelToken(MongoWebinar.CollectionName),
    );

    repository = new MongoWebinarRepository(model);
    await createWebinarInDatabase(cleanArchitectureWebinar);
  });

  afterEach(async () => {
    await app.cleanup();
  });

  describe('findById', () => {
    it('should find the webinar corresponding to the id', async () => {
      const webinar = await repository.findById(
        cleanArchitectureWebinar.props.id,
      );
      expect(webinar!.props).toEqual(cleanArchitectureWebinar.props);
    });
    it('should return null if the webinar is not found', async () => {
      const webinar = await repository.findById('does-not-exist');
      expect(webinar).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new webinar', async () => {
      await repository.create(cqrsWebinar);
      const createdWebinar = await model.findById(cqrsWebinar.props.id);
      expect(createdWebinar!.toObject()).toEqual({
        __v: 0,
        _id: cqrsWebinar.props.id,
        organizerId: cqrsWebinar.props.organizerId,
        title: cqrsWebinar.props.title,
        seats: cqrsWebinar.props.seats,
        startDate: cqrsWebinar.props.startDate,
        endDate: cqrsWebinar.props.endDate,
      });
    });
  });

  describe('update', () => {
    it('should update the webinar', async () => {
      await createWebinarInDatabase(cqrsWebinar);

      const cqrsCopy = cqrsWebinar.clone() as Webinar;
      cqrsCopy.update({
        title: 'CQRS 2',
        seats: 1000,
        startDate: new Date('2025-01-01T00:00:00.000Z'),
        endDate: new Date('2025-01-01T02:00:00.000Z'),
      });

      await repository.update(cqrsCopy);

      const updatedWebinar = await model.findById(cqrsWebinar.props.id);
      expect(updatedWebinar!.toObject()).toEqual({
        __v: 0,
        _id: cqrsCopy.props.id,
        organizerId: cqrsCopy.props.organizerId,
        title: 'CQRS 2',
        seats: cqrsCopy.props.seats,
        startDate: cqrsCopy.props.startDate,
        endDate: cqrsCopy.props.endDate,
      });

      expect(cqrsCopy.props).toEqual(cqrsCopy.initialState);
    });
  });

  describe('delete', () => {
    it('should delete the webinar', async () => {
      await repository.delete(cleanArchitectureWebinar);
      const record = await model.findById(cleanArchitectureWebinar.props.id);
      expect(record).toBeNull();
    });
  });
});
