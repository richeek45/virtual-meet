import express, { Application } from "express";
import { routes } from "./routes";

export const app: Application = express();
routes(app);

