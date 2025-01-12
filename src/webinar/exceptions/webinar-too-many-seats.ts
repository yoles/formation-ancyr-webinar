import { DomainError } from '../../shared/exception';

const defaultMessage = 'The webinar must have a maximum of 1000 seats';

export class WebinarTooManySeatsException extends DomainError {
  constructor(message: string = defaultMessage) {
    super(message);
  }
}
