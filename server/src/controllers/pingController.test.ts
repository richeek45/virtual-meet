import request from "supertest";
import { app } from "../app";



describe('Test Ping Controller', () => {
  it('Request Ping should return Pong!', async () => {
    const result = await request(app).get('/ping').send();

    expect(result.status).toBe(200);
    expect(result.body.data).toBe('Pong!');
  })
})




