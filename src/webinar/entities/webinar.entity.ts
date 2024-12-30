import { differenceInDays } from 'date-fns';
import { Entity } from '../../shared/entity';

type WebinarProps = {
  organizerId: string;
  id: string;
  title: string;
  seats: number;
  startDate: Date;
  endDate: Date;
};

export class Webinar extends Entity<WebinarProps> {
  isTooClose(now: Date): boolean {
    const diff = differenceInDays(this.props.startDate, now);
    return diff < 3;
  }

  hasTooManySeats(): boolean {
    return this.props.seats > 1_000;
  }

  hasNoSeats(): boolean {
    return this.props.seats < 1;
  }
}
