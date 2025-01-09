import { Email, IMailer } from '../ports/mailer.interface';

export class EmailCounterMailer implements IMailer {
  public sentEmails: Email[] = [];

  async send(email: Email): Promise<void> {
    this.sentEmails.push(email);
  }
}
