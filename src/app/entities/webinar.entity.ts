type WebinarProps = {
  id: string;
  title: string;
  seats: number;
  startDate: Date;
  endDate: Date;
};

export class Webinar {
  constructor(public props: WebinarProps) {
    this.props = props;
  }
}
