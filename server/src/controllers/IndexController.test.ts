import request from "supertest";
import { app } from "../app";

describe('Test Index Controller', () => {
  it('Request Ping should return Pong!', async () => {
    const result = await request(app).get('/').send();

    expect(result.status).toBe(200);
    expect(result.body.data).toBe("Hello from the Server Side!");
  })
})

