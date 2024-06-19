import { Server } from "@overnightjs/core";
import Logger from 'jet-logger';
import * as bodyParser from 'body-parser';
import { PingController } from "./controllers/PingController";
import * as controllers from './controllers';
import IndexController from "./controllers/IndexController";
import { Controller } from "@overnightjs/core/lib/decorators/types";


class App extends Server {

  private readonly SERVER_START_MSG = "Demo server started on port";
  private readonly DEV_MSG = 'Express Server is running in development mode. ' +
  'No front-end content is being served.';

  constructor() {
    super(true);
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({extended: true}));
    super.addControllers(new PingController());
    super.addControllers(new IndexController());

    if (process.env.NODE_ENV !== 'production') {
      console.log('Starting server in development mode');
      const msg = this.DEV_MSG + process.env.EXPRESS_PORT;
      this.app.get('*', (req, res) => res.send(msg));
    }
  }

  private setUpControllers(): void {
    const ctlrInstances = [];

    for (const name in controllers) {
      console.log(controllers)
      
      if (Object.prototype.hasOwnProperty.call(controllers, name)) {
          const Controller = (controllers as Controller)[name];
          ctlrInstances.push(new Controller());
      }
    }
    super.addControllers(ctlrInstances);
  }

  public start(port: number): void {
    this.app.listen(port, () => {
      Logger.imp(this.SERVER_START_MSG + port)
    })
  }
}

export default App;