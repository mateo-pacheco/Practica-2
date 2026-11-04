import { ZodError } from "zod";
import { HttpError } from "../utils/http-error.js";

export function errorHandler(error, _req, res, _next) {
  if (error instanceof ZodError) {
    return res.status(400).json({ error: "Entrada inválida", details: error.flatten() });
  }

  if (error instanceof HttpError) {
    return res.status(error.status).json({ error: error.message });
  }

  console.error(error);
  return res.status(500).json({ error: "Error interno del servidor" });
}
