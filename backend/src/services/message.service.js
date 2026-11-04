import { prisma } from "../config/prisma.js";
import { HttpError } from "../utils/http-error.js";
import { publicUser } from "../utils/public-user.js";
import { messageHistorySchema, messageSchema } from "../validators/schemas.js";
import { requireMembership } from "./conversation.service.js";

const messageSelection = {
  id: true,
  content: true,
  senderId: true,
  conversationId: true,
  createdAt: true,
  sender: { select: publicUser },
};

export async function createMessage(userId, data) {
  const { conversationId, content } = messageSchema.parse(data);
  await requireMembership(userId, conversationId);

  return prisma.message.create({
    data: { conversationId, content, senderId: userId },
    select: messageSelection,
  });
}

export async function listMessages(userId, conversationId, query) {
  const { limit, before } = messageHistorySchema.parse(query);
  await requireMembership(userId, conversationId);

  if (before) {
    const cursor = await prisma.message.findUnique({
      where: { id: before },
      select: { conversationId: true },
    });
    if (!cursor || cursor.conversationId !== conversationId) {
      throw new HttpError(400, "El cursor no pertenece a esta conversación");
    }
  }

  const page = await prisma.message.findMany({
    where: { conversationId },
    select: messageSelection,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    cursor: before ? { id: before } : undefined,
    skip: before ? 1 : undefined,
    take: limit + 1,
  });

  const hasMore = page.length > limit;
  const messages = page.slice(0, limit);
  return {
    messages: messages.reverse(),
    nextCursor: hasMore ? messages.at(-1).id : null,
  };
}
