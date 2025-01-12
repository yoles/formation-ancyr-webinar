import { DomainError } from '../../shared/exception';

const defaultMessage = 'You are not allowed to update this webinar';

export class WebinarUpdateForbidden extends DomainError {
  constructor(message: string = defaultMessage) {
    super(message);
  }
}
