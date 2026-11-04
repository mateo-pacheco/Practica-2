import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const tokenOptions = {
  algorithm: "HS256",
  expiresIn: "8h",
};

export function createToken(userId) {
  return jwt.sign({}, env.JWT_SECRET, { ...tokenOptions, subject: userId });
}

export function verifyToken(token) {
  return jwt.verify(token, env.JWT_SECRET, { algorithms: ["HS256"] });
}
