import  { Application, Router } from "express";
import { IndexController } from "./controllers/IndexController";
import { PingController } from "./controllers/pingController";

export const _routes: [string, Router][] = [
  ['/', IndexController],
  ['/ping', PingController]
] 

export const routes = (app: Application) => {
  _routes.forEach((route) => {
    const [url, controller] = route;
    app.use(url, controller);
  })
}