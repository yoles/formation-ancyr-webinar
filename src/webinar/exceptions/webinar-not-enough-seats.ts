import { DomainError } from '../../shared/exception';

const defaultMessage = 'The webinar must have a minimum of 1 seat';

export class WebinarNotEnoughSeatsException extends DomainError {
  constructor(message: string = defaultMessage) {
    super(message);
  }
}
