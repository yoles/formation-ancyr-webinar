import { DomainError } from '../../shared/exception';

const defaultMessage = 'Participation not found';

export class ParticipationNotFoundException extends DomainError {
  constructor(message: string = defaultMessage) {
    super(message);
  }
}
