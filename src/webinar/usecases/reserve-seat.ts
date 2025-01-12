import { Executable } from '../../shared/executable';
import { User } from '../../users/entities/user.entity';
import { IWebinarRepository } from '../ports/webinar-repository.interface';
import { IParticipationRepository } from '../ports/participation-repository.interface';
import { Participation } from '../entities/participation.entity';
import { IMailer } from '../../core/ports/mailer.interface';
import { IUserRepository } from '../../users/ports/user-repository.interface';
import { Webinar } from '../entities/webinar.entity';
import { WebinarNotFoundException } from '../exceptions/webinar-not-found';

type Request = {
  user: User;
  webinarId: string;
};

type Response = void;

export class ReserveSeat implements Executable<Request, Response> {
  constructor(
    private readonly participationRepository: IParticipationRepository,
    private readonly mailer: IMailer,
    private readonly webinarRepository: IWebinarRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(request: Request): Promise<Response> {
    const webinar = await this.webinarRepository.findById(request.webinarId);
    if (!webinar) {
      throw new WebinarNotFoundException();
    }

    await this.assertUserIsNotAlreadyParticipating(
      request.user,
      request.webinarId,
    );
    await this.assertHasEnoughSeats(webinar);

    const participation = new Participation({
      userId: request.user.props.id,
      webinarId: request.webinarId,
    });
    await this.participationRepository.create(participation);
    await this.sendEmailToOrganizer(webinar);
    await this.sendEmailToParticipants(webinar, request.user);
  }

  private async assertUserIsNotAlreadyParticipating(
    user: User,
    webinarId: string,
  ) {
    const existingParticipation = await this.participationRepository.findOne(
      user.props.id,
      webinarId,
    );
    if (existingParticipation) {
      throw new Error('You already participate in this webinar');
    }
  }

  private async assertHasEnoughSeats(webinar: Webinar) {
    const participationCount =
      await this.participationRepository.getParticipantsCount(webinar.props.id);
    if (participationCount >= webinar.props.seats) {
      throw new Error('There is not enough seats for this webinar');
    }
  }

  private async sendEmailToOrganizer(webinar: Webinar) {
    const organizer = await this.userRepository.findById(
      webinar.props.organizerId,
    );
    await this.mailer.send({
      to: organizer!.props.emailAddress,
      subject: 'A new participant has joined your webinar',
      body: `A new user has reserved a seat for your webinar ${
        webinar.props.title
      }`,
    });
  }

  private async sendEmailToParticipants(webinar: Webinar, user: User) {
    await this.mailer.send({
      to: user.props.emailAddress,
      subject: 'You have reserved a seat for the webinar',
      body: `You have reserved a seat for the webinar ${webinar!.props.title}`,
    });
  }
}
