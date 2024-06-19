import * as supertest from 'supertest';
import { Test } from "supertest";
import { PingController } from "./PingController";
import TestServer from "./shared/TestServer.test";
import TestAgent from 'supertest/lib/agent';
import Logger from 'jet-logger';
import { StatusCodes } from 'http-status-codes';


describe('Test Ping Controller', () => {
  const pingController = new PingController();
  let agent: TestAgent<Test>;

  beforeAll(done => {
    const server = new TestServer();
    server.setController(pingController);
    agent = supertest.agent(server.getExpressInstance());
    done();
  })

  describe('API: "/ping"', () => {
    const { SUCCESS_MSG } = PingController;
    const name = 'richeek';
    const message = SUCCESS_MSG + name;

    it(`should return a JSON object with the message "${message}"
       and a status code of "${StatusCodes.OK}" if message was successful`, done => {
      agent.get(`/name/${name}`).end((err, res) => {
        if (err) {
          Logger.err(err, true);
        }
  
        expect(res.status).toBe(StatusCodes.OK);
        expect(res.body.message).toBe(message);
        done(); 
      })
    })

    it('Request Ping should return Pong!', (done) => {
      agent.get('/ping').end((err, res) => {
        if (err) {
          Logger.err(err, true);
        }
  
        expect(res.status).toBe(200);
        expect(res.body.data).toBe('Pong!');
        done();
      });
    })

    it(`should return a JSON object with the "error" param and a status code of "${StatusCodes.BAD_REQUEST}"
      if message was unsuccessful`, done => {

      agent.get('/api/say-hello/make_it_fail').end((err, res) => {
        if (err) {
            Logger.err(err, true);
        }
        expect(res.status).toBe(StatusCodes.BAD_REQUEST);
        expect(res.body.error).toBeTruthy();
        done();
      });
    });

  })

})
