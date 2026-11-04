import { prisma } from "../config/prisma.js";
import { HttpError } from "../utils/http-error.js";
import { publicUser } from "../utils/public-user.js";
import { uuidSchema } from "../validators/schemas.js";

const conversationSelection = {
  id: true,
  title: true,
  createdAt: true,
  members: {
    select: {
      joinedAt: true,
      user: { select: publicUser },
    },
    orderBy: { joinedAt: "asc" },
  },
};

function validateConversationId(conversationId) {
  if (!uuidSchema.safeParse(conversationId).success) {
    throw new HttpError(400, "El identificador de conversación no es válido");
  }
}

export async function createConversation(userId, { title, memberIds }) {
  const participantIds = [...new Set([userId, ...memberIds])];
  if (participantIds.length < 2) {
    throw new HttpError(400, "Una conversación requiere al menos dos usuarios distintos");
  }

  const users = await prisma.user.findMany({
    where: { id: { in: participantIds } },
    select: { id: true },
  });
  if (users.length !== participantIds.length) {
    throw new HttpError(400, "Uno o más participantes no existen");
  }

  return prisma.conversation.create({
    data: {
      title,
      members: {
        create: participantIds.map((id) => ({ userId: id })),
      },
    },
    select: conversationSelection,
  });
}

export async function listConversations(userId) {
  const memberships = await prisma.conversationMember.findMany({
    where: { userId },
    select: { conversation: { select: conversationSelection } },
    orderBy: { conversation: { createdAt: "desc" } },
  });
  return memberships.map(({ conversation }) => conversation);
}

export async function requireMembership(userId, conversationId) {
  validateConversationId(conversationId);
  const member = await prisma.conversationMember.findUnique({
    where: { userId_conversationId: { userId, conversationId } },
  });
  if (!member) {
    throw new HttpError(403, "No perteneces a esta conversación");
  }
}

export async function getConversationMemberIds(conversationId) {
  validateConversationId(conversationId);
  const members = await prisma.conversationMember.findMany({
    where: { conversationId },
    select: { userId: true },
  });
  return members.map(({ userId }) => userId);
}
