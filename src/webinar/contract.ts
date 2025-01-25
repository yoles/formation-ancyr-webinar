import { z } from 'zod';
import { WebinarDTO } from './dto/webinar.dto';

export namespace WebinarAPI {
  export namespace OrganizeWebinar {
    export const schema = z.object({
      title: z.string(),
      seats: z.number(),
      // coerce: check if the string can be cast into date, then cast it
      startDate: z.coerce.date(),
      endDate: z.coerce.date(),
    });

    export type Request = z.infer<typeof schema>;
    export type Response = { id: string };
  }

  export namespace ChangeSeats {
    export const schema = z.object({
      seats: z.number(),
    });

    export type Request = z.infer<typeof schema>;
    export type Response = void;
  }

  export namespace ChangeDates {
    export const schema = z.object({
      startDate: z.coerce.date(),
      endDate: z.coerce.date(),
    });

    export type Request = z.infer<typeof schema>;
    export type Response = void;
  }

  export namespace CancelWebinar {
    export type Response = void;
  }

  export namespace ReserveSeat {
    export type Response = void;
  }

  export namespace CancelSeat {
    export type Response = void;
  }

  export namespace GetWebinarById {
    export type Response = WebinarDTO;
  }
}
