import { DomainError } from '../../shared/exception';

const defaultMessage = 'No more seats available';

export class NoMoreSeatsAvailableException extends DomainError {
  constructor(message: string = defaultMessage) {
    super(message);
  }
}
