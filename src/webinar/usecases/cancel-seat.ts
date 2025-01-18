import { User } from '../../users/entities/user.entity';
import { Executable } from '../../shared/executable';
import { IMailer } from 'src/core/ports/mailer.interface';
import { IUserRepository } from 'src/users/ports/user-repository.interface';
import { IWebinarRepository } from '../ports/webinar-repository.interface';
import { IParticipationRepository } from '../ports/participation-repository.interface';
import { Webinar } from '../entities/webinar.entity';
import { WebinarNotFoundException } from '../exceptions/webinar-not-found';
import { ParticipationNotFoundException } from '../exceptions/participation-not-found';

type Request = {
  user: User;
  webinarId: string;
};

type Response = void;
export class CancelSeat implements Executable<Request, Response> {
  constructor(
    private readonly webinarRepository: IWebinarRepository,
    private readonly participationRepository: IParticipationRepository,
    private readonly userRepository: IUserRepository,
    private readonly mailer: IMailer,
  ) {}

  async execute(request: Request): Promise<Response> {
    const webinar = await this.webinarRepository.findById(request.webinarId);
    if (!webinar) {
      throw new WebinarNotFoundException();
    }

    const participation = await this.participationRepository.findOne(
      request.user.props.id,
      request.webinarId,
    );
    if (!participation) {
      throw new ParticipationNotFoundException();
    }

    await this.participationRepository.delete(participation);
    await this.sendEmailToOrganizer(webinar);
    await this.sendEmailToParticipant(webinar, request.user);
  }

  private async sendEmailToOrganizer(webinar: Webinar) {
    const organizer = await this.userRepository.findById(
      webinar!.props.organizerId,
    );

    await this.mailer.send({
      to: organizer!.props.emailAddress,
      subject: 'A participant canceled his seat',
      body: `A participant canceled his seat for the webinar "${webinar!.props.title}"`,
    });
  }

  private async sendEmailToParticipant(webinar: Webinar, user: User) {
    await this.mailer.send({
      to: user.props.emailAddress,
      subject: 'Your seat has been canceled',
      body: `Your seat has been canceled for the webinar "${webinar!.props.title}"`,
    });
  }
}
