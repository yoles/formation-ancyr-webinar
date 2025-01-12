import { DomainError } from '../../shared/exception';

const defaultMessage = 'The webinar must happen at least 3 days from now';

export class WebinarTooEarlyException extends DomainError {
  constructor(message: string = defaultMessage) {
    super(message);
  }
}
