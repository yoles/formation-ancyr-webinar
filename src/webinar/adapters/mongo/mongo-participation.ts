import {
  Prop,
  Schema as MongooseSchema,
  SchemaFactory,
} from '@nestjs/mongoose';
import { Participation } from '../../entities/participation.entity';
import { HydratedDocument } from 'mongoose';

export namespace MongoParticipation {
  export const CollectionName = 'participations';

  @MongooseSchema({ collection: CollectionName })
  export class SchemaClass {
    @Prop({ type: String })
    _id: string;

    @Prop()
    webinarId: string;

    @Prop()
    userId: string;

    static makeId(participation: Participation) {
      return `${participation.props.webinarId}:${participation.props.userId}`;
    }
  }

  export const Schema = SchemaFactory.createForClass(SchemaClass);
  export type Document = HydratedDocument<SchemaClass>;
}
