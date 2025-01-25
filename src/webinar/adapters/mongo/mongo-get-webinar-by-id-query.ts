import { WebinarDTO } from '../../dto/webinar.dto';
import { NotFoundException } from '@nestjs/common';
import { GetWebinarByIdQuery } from '../../ports/get-webinar-by-id-query.interface';
import { MongoWebinar } from './mongo-webinar';
import { Model } from 'mongoose';
import { MongoParticipation } from './mongo-participation';
import { MongoUser } from '../../../users/adapters/mongo/mongo-user';

type Request = {
  id: string;
};

type Response = WebinarDTO;

export class MongoGetWebinarById implements GetWebinarByIdQuery {
  constructor(
    private readonly webinarModel: Model<MongoWebinar.SchemaClass>,
    private readonly participationModel: Model<MongoParticipation.SchemaClass>,
    private readonly userModel: Model<MongoUser.SchemaClass>,
  ) {}

  async execute(id: string): Promise<WebinarDTO> {
    const webinar = await this.webinarModel.findById(id);

    if (!webinar) {
      throw new NotFoundException(); // should make infraException instead of domainException
    }

    const organizer = await this.userModel.findById(webinar.organizerId);

    if (!organizer) {
      throw new NotFoundException();
    }

    const seats = await this.participationModel.countDocuments({
      webinarId: id,
    });

    return {
      id: webinar.id,
      title: webinar.title,
      startDate: webinar.startDate,
      endDate: webinar.endDate,
      seats: {
        reserved: seats,
        available: webinar.seats - seats,
      },
      organizer: {
        id: organizer.id,
        emailAddress: organizer.emailAddress,
      },
    };
  }
}
