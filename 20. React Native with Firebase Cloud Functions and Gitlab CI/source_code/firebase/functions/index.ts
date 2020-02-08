import express from "express";
import { initializeApp } from "firebase-admin";
import { https } from "firebase-functions";

import { ValidateToken } from "./middleware";

initializeApp();
const app = express();

app.use(express.json());
app.use(ValidateToken);

app.post("/hello", hello);
app.post("/bye", bye);

function hello(request: express.Request, response: express.Response) {
  const name = request.body.name;
  response.status(200).json({ hello: `Hello ${name}` });
}

function bye(request: express.Request, response: express.Response) {
  const name = request.body.name;
  response.status(200).json({ bye: `Bye ${name}` });
}

export const api = https.onRequest(app);
