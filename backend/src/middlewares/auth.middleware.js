import { HttpError } from "../utils/http-error.js";
import { verifyToken } from "../utils/jwt.js";

export function requireAuth(req, _res, next) {
  const [scheme, token] = req.get("authorization")?.split(" ") ?? [];
  if (scheme !== "Bearer" || !token) {
    return next(new HttpError(401, "Se requiere un token Bearer"));
  }

  try {
    const payload = verifyToken(token);
    if (typeof payload.sub !== "string") {
      throw new Error("Token sin subject");
    }
    req.userId = payload.sub;
    next();
  } catch {
    next(new HttpError(401, "Token inválido o expirado"));
  }
}
