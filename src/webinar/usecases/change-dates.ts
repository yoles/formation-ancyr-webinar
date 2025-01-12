import { User } from '../../users/entities/user.entity';
import { Executable } from '../../shared/executable';
import { IWebinarRepository } from '../ports/webinar-repository.interface';
import { IDateGenerator } from '../../core/ports/date-generator.interface';
import { IParticipationRepository } from '../ports/participation-repository.interface';
import { IMailer } from 'src/core/ports/mailer.interface';
import { IUserRepository } from 'src/users/ports/user-repository.interface';
import { Webinar } from '../entities/webinar.entity';
import { WebinarNotFoundException } from '../exceptions/webinar-not-found';
import { WebinarUpdateForbidden } from '../exceptions/webinar-update-forbidden';
import { WebinarTooEarlyException } from '../exceptions/webinar-too-early';

type Request = {
  user: User;
  webinarId: string;
  startDate: Date;
  endDate: Date;
};

type Response = void;

export class ChangeDates implements Executable<Request, Response> {
  constructor(
    private readonly webinarRepository: IWebinarRepository,
    private readonly dateGenerator: IDateGenerator,
    private readonly participationRepository: IParticipationRepository,
    private readonly mailer: IMailer,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(request: Request): Promise<Response> {
    const webinar = await this.webinarRepository.findById(request.webinarId);
    if (webinar === null) {
      throw new WebinarNotFoundException();
    }

    if (!webinar.isOrganizer(request.user)) {
      throw new WebinarUpdateForbidden();
    }

    webinar.update({
      startDate: request.startDate,
      endDate: request.endDate,
    });

    if (webinar.isTooClose(this.dateGenerator.now())) {
      throw new WebinarTooEarlyException();
    }

    await this.webinarRepository.update(webinar);
    await this.sendEmailToParticipants(webinar);
    return;
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
          subject: 'The date of your webinar has been updated',
          body: `The dates of your webinar "${webinar.props.title}" have been updated`,
        }),
      ),
    );
  }
}
