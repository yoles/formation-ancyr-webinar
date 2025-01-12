import { User } from '../../users/entities/user.entity';
import { IWebinarRepository } from '../ports/webinar-repository.interface';
import { Executable } from '../../shared/executable';
import { WebinarNotFoundException } from '../exceptions/webinar-not-found';
import { WebinarUpdateForbidden } from '../exceptions/webinar-update-forbidden';
import { DomainError } from 'src/shared/exception';
import { WebinarTooManySeatsException } from '../exceptions/webinar-too-many-seats';

type Request = {
  user: User;
  webinarId: string;
  seats: number;
};

type Response = void;

export class ChangeSeats implements Executable<Request, Response> {
  constructor(private webinarRepository: IWebinarRepository) {}

  async execute({ user, webinarId, seats }: Request): Promise<Response> {
    const webinar = await this.webinarRepository.findById(webinarId);
    if (!webinar) {
      throw new WebinarNotFoundException();
    }

    if (!webinar.isOrganizer(user)) {
      throw new WebinarUpdateForbidden();
    }

    if (seats < webinar.props.seats) {
      throw new DomainError('You cannot reduce the number of seats');
    }

    webinar.update({ seats });

    if (webinar.hasTooManySeats()) {
      throw new WebinarTooManySeatsException();
    }

    await this.webinarRepository.update(webinar);
    return;
  }
}
