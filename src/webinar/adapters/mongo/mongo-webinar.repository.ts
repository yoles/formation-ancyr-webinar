import { Model } from 'mongoose';
import { Webinar } from '../../entities/webinar.entity';
import { IWebinarRepository } from '../../ports/webinar-repository.interface';
import { MongoWebinar } from './mongo-webinar';
import * as deepObject from 'deep-object-diff';

export class MongoWebinarRepository implements IWebinarRepository {
  constructor(private readonly model: Model<MongoWebinar.SchemaClass>) {}

  async findById(id: string): Promise<Webinar | null> {
    const record = await this.model.findById(id);
    if (!record) return null;
    return new Webinar({
      id: record._id,
      organizerId: record.organizerId,
      title: record.title,
      seats: record.seats,
      startDate: record.startDate,
      endDate: record.endDate,
    });
  }

  async create(webinar: Webinar): Promise<void> {
    const record = new this.model({
      _id: webinar.props.id,
      organizerId: webinar.props.organizerId,
      title: webinar.props.title,
      seats: webinar.props.seats,
      startDate: webinar.props.startDate,
      endDate: webinar.props.endDate,
    });
    await record.save();
  }

  async update(webinar: Webinar): Promise<void> {
    const record = await this.model.findById(webinar.props.id);
    if (!record) return;

    const diff = deepObject.diff(webinar.initialState, webinar.props);
    await record.updateOne(diff);
    webinar.commit();
  }

  async delete(webinar: Webinar): Promise<void> {
    await this.model.findByIdAndDelete(webinar.props.id);
  }
}
