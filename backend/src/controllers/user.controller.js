import { listUsers } from "../services/user.service.js";
import { paginationSchema } from "../validators/schemas.js";

export async function list(req, res) {
  const { limit } = paginationSchema.parse(req.query);
  const users = await listUsers(req.userId, limit);
  res.json({ users });
}
