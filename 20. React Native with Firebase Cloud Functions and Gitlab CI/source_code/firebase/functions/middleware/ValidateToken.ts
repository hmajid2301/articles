import * as express from "express";
import { auth } from "firebase-admin";

const ValidateToken = (
  request: express.Request,
  response: express.Response,
  next: express.NextFunction
) => {
  let token;
  if (
    request.headers.authorization &&
    request.headers.authorization.startsWith("Bearer ")
  ) {
    token = request.headers.authorization.split("Bearer ")[1];
  } else {
    response.status(403).json({ code: "unauthorized" });
    return;
  }

  auth()
    .verifyIdToken(token)
    .then(() => {
      return next();
    })
    .catch(() => {
      response.status(403).json({ code: "unauthorized" });
    });
};

export default ValidateToken;
