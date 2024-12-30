import { User } from '../../users/entities/user.entity';
import { IWebinarRepository } from '../ports/webinar-repository.interface';
import { Executable } from '../../shared/executable';

type Request = {
  user: User,
  webinarId: string;
  seats: number;
}

type Response = void;

export class ChangeSeats implements Executable<Request, Response> {
  constructor(private webinarRepository: IWebinarRepository) {}

  async execute({user, webinarId, seats} : Request): Promise<Response> {
    const webinar = await this.webinarRepository.findById(
      webinarId
    )
    if (!webinar) {
      throw new Error("Webinar not found")
    }

    if (webinar.props.organizerId !== user.props.id) {
      throw new Error("You are not allowed to update this webinar")
    }

    if (seats < webinar.props.seats) {
      throw new Error("You cannot reduce the number of seats")
    }

    webinar.update({seats});

    if (webinar.hasTooManySeats()) {
      throw new Error('The webinar must have a maximum of 1000 seats')
    }

    await this.webinarRepository.update(webinar);

    return;
  }
}
