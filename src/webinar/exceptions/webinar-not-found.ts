import { DomainError } from '../../shared/exception';

const defaultMessage = 'Webinar not found';

export class WebinarNotFoundException extends DomainError {
  constructor(message: string = defaultMessage) {
    super(message);
  }
}
