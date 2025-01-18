import { DomainError } from '../../shared/exception';

const defaultMessage = 'You already participate in this webinar';

export class SeatAlreadyReservedException extends DomainError {
  constructor(message: string = defaultMessage) {
    super(message);
  }
}
