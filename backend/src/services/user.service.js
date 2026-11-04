import { prisma } from "../config/prisma.js";
import { publicUser } from "../utils/public-user.js";

export function listUsers(currentUserId, limit = 30) {
  return prisma.user.findMany({
    where: { id: { not: currentUserId } },
    select: publicUser,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
