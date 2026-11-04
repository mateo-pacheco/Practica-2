import { prisma } from "../config/prisma.js";
import { verifyToken } from "../utils/jwt.js";
import { getConversationMemberIds } from "../services/conversation.service.js";
import { createMessage } from "../services/message.service.js";

function getAuthentication(token) {
  const payload = verifyToken(token);
  if (typeof payload === "string" || typeof payload.sub !== "string" || typeof payload.exp !== "number") {
    throw new Error("Token sin información de sesión válida");
  }
  return { userId: payload.sub, expiresAt: payload.exp * 1000 };
}

export async function broadcastMessage(io, message) {
  if (!io) {
    throw new Error("Socket.IO no está configurado");
  }
  const memberIds = await getConversationMemberIds(message.conversationId);
  io.to(memberIds.map((userId) => `user:${userId}`)).emit("message:new", message);
}

export function configureChatSocket(io) {
  io.use(async (socket, next) => {
    try {
      const { userId, expiresAt } = getAuthentication(socket.handshake.auth?.token);
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
      if (!user) {
        throw new Error("Usuario no encontrado");
      }
      socket.data.userId = userId;
      socket.data.tokenExpiresAt = expiresAt;
      next();
    } catch {
      next(new Error("Autenticación de Socket.IO inválida o expirada"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(`user:${socket.data.userId}`);

    const millisecondsToExpiration = Math.max(0, socket.data.tokenExpiresAt - Date.now());
    const expirationTimer = setTimeout(() => socket.disconnect(true), millisecondsToExpiration);

    socket.on("message:send", async (data, callback) => {
      const reply = typeof callback === "function" ? callback : () => {};
      try {
        if (Date.now() >= socket.data.tokenExpiresAt) {
          throw new Error("El token expiró");
        }
        const message = await createMessage(socket.data.userId, data);
        try {
          await broadcastMessage(io, message);
        } catch (error) {
          console.error("Falló la emisión del mensaje Socket.IO", error);
        }
        reply({ ok: true, message });
      } catch {
        reply({ ok: false, error: "No se pudo enviar el mensaje" });
      }
    });

    socket.on("disconnect", () => clearTimeout(expirationTimer));
  });
}
