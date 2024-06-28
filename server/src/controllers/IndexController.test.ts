import { Test } from "supertest";
import * as supertest from 'supertest';
import IndexController from "./IndexController";
import TestAgent from "supertest/lib/agent";
import TestServer from "./shared/TestServer.test";
import { StatusCodes } from "http-status-codes";

describe('Test Index Controller', () => {
  const indexController = new IndexController();
  let agent: TestAgent<Test>;

  beforeAll(done => {
    const server = new TestServer();
    server.setController(indexController);
    agent = supertest.agent(server.getExpressInstance());
    done();
  })

  it('Request main route!', async (done) => {
    agent.get(`/`).end((err, res) => {
      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body.data).toBe("Hello from the Server Side!");
      done();
    })

  })
})

