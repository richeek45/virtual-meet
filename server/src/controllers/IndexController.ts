import { Controller, Get } from "@overnightjs/core";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import Logger from 'jet-logger';
@Controller('/')
class IndexController {

  @Get()
  private getAll(req: Request, res: Response) {
    try {
      return res.status(StatusCodes.OK).send({ data: "Hello from the Server Side!"});
    } catch(err) {
      Logger.err(err, true);
    }
  }
}

export default IndexController;