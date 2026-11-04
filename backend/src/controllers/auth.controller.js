import { loginUser, registerUser } from "../services/auth.service.js";
import { loginSchema, registerSchema } from "../validators/schemas.js";

export async function register(req, res) {
  const data = registerSchema.parse(req.body);
  const result = await registerUser(data);
  res.status(201).json(result);
}

export async function login(req, res) {
  const data = loginSchema.parse(req.body);
  const result = await loginUser(data);
  res.json(result);
}
