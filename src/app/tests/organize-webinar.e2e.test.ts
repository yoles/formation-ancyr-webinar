import { Test} from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { addDays } from 'date-fns';

describe("Feature: organizing a webinar", () => {
  it("should organize the webinar", async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const app = module.createNestApplication();
    await app.init();

    const result = await request(app.getHttpServer())
      .post("/webinars")
      .send({
        user: 'john-doe',
        title: 'My first webinar',
        seats: 100,
        startDate: addDays(new Date(), 4).toISOString(),
        endDate: addDays(new Date(), 5).toISOString(),
      });

    expect(result.status).toEqual(201);
    expect(result.body).toEqual({id: expect.any(String)});
  });
});