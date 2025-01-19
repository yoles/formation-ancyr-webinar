import { Model } from 'mongoose';
import { Participation } from '../../entities/participation.entity';
import { IParticipationRepository } from '../../ports/participation-repository.interface';
import { MongoParticipation } from './mongo-participation';
export class MongoParticipationRepository implements IParticipationRepository {
  constructor(private readonly model: Model<MongoParticipation.SchemaClass>) {}

  async findOne(
    userId: string,
    webinarId: string,
  ): Promise<Participation | null> {
    const record = await this.model.findOne({
      userId,
      webinarId,
    });

    if (!record) return null;

    return new Participation({
      userId: record.userId,
      webinarId: record.webinarId,
    });
  }

  async findByWebinarId(webinarId: string): Promise<Participation[]> {
    const records = await this.model.find({
      webinarId,
    });

    return records.map(
      (record) =>
        new Participation({
          userId: record.userId,
          webinarId: record.webinarId,
        }),
    );
  }

  async create(participation: Participation): Promise<void> {
    await this.model.create({
      _id: MongoParticipation.SchemaClass.makeId(participation),
      userId: participation.props.userId,
      webinarId: participation.props.webinarId,
    });
  }

  async getParticipantsCount(webinarId: string): Promise<number> {
    const count = await this.model.countDocuments({
      webinarId,
    });
    return count;
  }

  async delete(participation: Participation): Promise<void> {
    await this.model.deleteOne({
      userId: participation.props.userId,
      webinarId: participation.props.webinarId,
    });
  }
}
