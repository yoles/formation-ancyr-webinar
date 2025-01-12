import { Participation } from '../entities/participation.entity';

export const I_PARTICIPATION_REPOSITORY = 'I_PARTICIPATION_REPOSITORY';

export interface IParticipationRepository {
  findOne(userId: string, webinarId: string): Promise<Participation | null>;
  findByWebinarId(webinarId: string): Promise<Participation[]>;
  create(participation: Participation): Promise<void>;
  getParticipantsCount(webinarId: string): Promise<number>;
}
