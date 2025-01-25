import { Executable } from '../../shared/executable';
import { WebinarDTO } from '../dto/webinar.dto';
import { GetWebinarByIdQuery } from '../ports/get-webinar-by-id-query.interface';

type Request = {
  id: string;
};

export type Response = WebinarDTO;

// Not necessary because the usecase is overkil, we can use directly the query
export class GetWebinarByIdUseCase implements Executable<Request, Response> {
  constructor(private readonly getWebinarByIdQuery: GetWebinarByIdQuery) {}

  async execute(request: Request): Promise<Response> {
    return this.getWebinarByIdQuery.execute(request.id);
  }
}
