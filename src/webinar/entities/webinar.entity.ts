import { differenceInDays } from 'date-fns';

type WebinarProps = {
  organizerId: string;
  id: string;
  title: string;
  seats: number;
  startDate: Date;
  endDate: Date;
};

export class Webinar {
  public initialState: WebinarProps;
  public props: WebinarProps;

  constructor(data: WebinarProps) {
    this.initialState = { ...data };
    this.props = { ...data};

    Object.freeze(this.initialState);
  }

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

  update(data: Partial<WebinarProps>): void {
    this.props = {...this.props, ...data}
  }

  commit(): void {
    this.initialState = this.props
  }
}
