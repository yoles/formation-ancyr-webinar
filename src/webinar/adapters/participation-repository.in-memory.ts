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

  async findOne(
    userId: string,
    webinarId: string,
  ): Promise<Participation | null> {
    return this.findOneSync(userId, webinarId);
  }

  findOneSync(userId: string, webinarId: string): Participation | null {
    return (
      this.database.find(
        (participation) =>
          participation.props.userId === userId &&
          participation.props.webinarId === webinarId,
      ) ?? null
    );
  }

  async create(participation: Participation): Promise<void> {
    this.database.push(participation);
  }

  async getParticipantsCount(webinarId: string): Promise<number> {
    return this.database.reduce(
      (count, participation) =>
        participation.props.webinarId === webinarId ? count + 1 : count,
      0,
    );
  }

  async delete(participation: Participation): Promise<void> {
    const index = this.database.findIndex(
      (p) =>
        p.props.userId === participation.props.userId &&
        p.props.webinarId === participation.props.webinarId,
    );
    if (index !== -1) {
      this.database.splice(index, 1);
    }
  }
}
