import { Controller, Get } from '@overnightjs/core';
import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';
import Logger from 'jet-logger';


@Controller('ping/')
export class PingController {

  public static readonly SUCCESS_MSG = 'hello ';

  @Get(':name')
  private sayHello(req: Request, res: Response) {
    try {
      const { name } = req.params;
      if (name === 'make_it_fail') {
          throw Error('User triggered failure');
      }
      Logger.info(PingController.SUCCESS_MSG  + name);
      return res.status(StatusCodes.OK).json({
          message: PingController.SUCCESS_MSG + name,
      });
    } catch (err: unknown) {
        Logger.err(err, true);

        if (typeof err === "object" && err && ("message" in err) && typeof err.message === "string") {
          return res.status(StatusCodes.BAD_REQUEST).json({
              error: err.message,
          });
        }
    }
  }

}
