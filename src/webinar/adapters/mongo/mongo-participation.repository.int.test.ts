import { Model } from 'mongoose';
import { TestApp } from '../../../tests/utils/test-app';
import { MongoParticipationRepository } from './mongo-participation.repository';
import { MongoParticipation } from './mongo-participation';
import { getModelToken } from '@nestjs/mongoose';
import { Participation } from '../../entities/participation.entity';

describe('MongoParticipationRepository', () => {
  async function createParticipationInDatabase(participation: Participation) {
    const record = new model({
      _id: MongoParticipation.SchemaClass.makeId(participation),
      userId: participation.props.userId,
      webinarId: participation.props.webinarId,
    });
    await record.save();
  }

  let app: TestApp;
  let model: Model<MongoParticipation.SchemaClass>;
  let repository: MongoParticipationRepository;
  const defaultParticipation = new Participation({
    userId: '1',
    webinarId: '1',
  });

  beforeEach(async () => {
    app = new TestApp();
    await app.setup();
    model = app.get<Model<MongoParticipation.SchemaClass>>(
      getModelToken(MongoParticipation.CollectionName),
    );

    repository = new MongoParticipationRepository(model);
    await createParticipationInDatabase(defaultParticipation);
  });

  afterEach(async () => {
    await app.cleanup();
  });

  describe('findOne', () => {
    it('should find the participation corresponding to the id', async () => {
      const participation = await repository.findOne(
        defaultParticipation.props.userId,
        defaultParticipation.props.webinarId,
      );
      expect(participation!.props).toEqual(defaultParticipation.props);
    });

    it('should return null if the participation is not found', async () => {
      const participation = await repository.findOne('no-user', 'no-webinar');
      expect(participation).toBeNull();
    });
  });

  describe('findByWebinarId', () => {
    it('should find the participations corresponding to the webinar id', async () => {
      const participations = await repository.findByWebinarId('1');
      expect(participations.length).toBe(1);
      expect(participations[0].props).toEqual(defaultParticipation.props);
    });
  });

  describe('create', () => {
    it('should create a participation', async () => {
      const participation = new Participation({
        userId: '2',
        webinarId: '2',
      });
      await repository.create(participation);

      const record = await model.findOne({
        userId: participation.props.userId,
        webinarId: participation.props.webinarId,
      });
      expect(record!.toObject()).toEqual({
        __v: 0,
        _id: MongoParticipation.SchemaClass.makeId(participation),
        userId: participation.props.userId,
        webinarId: participation.props.webinarId,
      });
    });
  });

  describe('getParticipantsCount', () => {
    it('should get the number of participants for a webinar', async () => {
      const count = await repository.getParticipantsCount(
        defaultParticipation.props.webinarId,
      );
      expect(count).toBe(1);
    });
  });

  describe('delete', () => {
    it('should delete a participation', async () => {
      await repository.delete(defaultParticipation);

      const record = await model.findOne({
        userId: defaultParticipation.props.userId,
        webinarId: defaultParticipation.props.webinarId,
      });
      expect(record).toBeNull();
    });
  });
});
