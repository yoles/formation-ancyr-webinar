import { Executable } from '../../shared/executable';
import { User } from '../../users/entities/user.entity';
import { IWebinarRepository } from '../ports/webinar-repository.interface';
import { WebinarNotFoundException } from '../exceptions/webinar-not-found';
import { WebinarUpdateForbidden } from '../exceptions/webinar-update-forbidden';
import { IMailer } from 'src/core/ports/mailer.interface';
import { IParticipationRepository } from '../ports/participation-repository.interface';
import { IUserRepository } from 'src/users/ports/user-repository.interface';
import { Webinar } from '../entities/webinar.entity';

type Request = {
  user: User;
  webinarId: string;
};

type Response = void;

export class CancelWebinar implements Executable<Request, Response> {
  constructor(
    private readonly webinarRepository: IWebinarRepository,
    private readonly mailer: IMailer,
    private readonly participationRepository: IParticipationRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(request: Request): Promise<Response> {
    const webinar = await this.webinarRepository.findById(request.webinarId);
    if (!webinar) {
      throw new WebinarNotFoundException();
    }

    if (webinar.isOrganizer(request.user) === false) {
      throw new WebinarUpdateForbidden();
    }

    // We want the deletion of participants to be in the contract of the "delete" method
    // of the repository.
    await this.webinarRepository.delete(webinar);
    await this.sendEmailToParticipants(webinar);
  }

  private async sendEmailToParticipants(webinar: Webinar) {
    const participations = await this.participationRepository.findByWebinarId(
      webinar.props.id,
    );
    const users = (await Promise.all(
      participations
        .map((participation) =>
          this.userRepository.findById(participation.props.userId),
        )
        .filter((user) => user !== null),
    )) as User[];

    await Promise.all(
      users.map((user) =>
        this.mailer.send({
          to: user.props.emailAddress,
          subject: 'Webinar canceled',
          body: `The webinar ${webinar.props.title} has been canceled`,
        }),
      ),
    );
  }
}
