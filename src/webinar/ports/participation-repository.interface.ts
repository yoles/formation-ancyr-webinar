import { Participation } from '../entities/participation.entity';

export interface IParticipationRepository {
  findByWebinarId(webinarId: string): Promise<Participation[]>;
}
