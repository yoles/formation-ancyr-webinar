import { IParticipationRepository } from '../ports/participation-repository.interface';
import { Participation } from '../entities/participation.entity';

export class InMemoryParticipationRepository
  implements IParticipationRepository
{
  constructor(public readonly database: Participation[] = []) {}

  async findByWebinarId(webinarId: string): Promise<Participation[]> {
    return this.database.filter(
      (participation) => participation.props.webinarId === webinarId,
    );
  }
}
