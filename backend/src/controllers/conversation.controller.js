import { createConversation, listConversations } from "../services/conversation.service.js";
import { createMessage, listMessages } from "../services/message.service.js";
import { conversationSchema } from "../validators/schemas.js";
import { broadcastMessage } from "../sockets/chat.socket.js";

export async function create(req, res) {
  const data = conversationSchema.parse(req.body);
  const conversation = await createConversation(req.userId, data);
  res.status(201).json({ conversation });
}

export async function list(req, res) {
  const conversations = await listConversations(req.userId);
  res.json({ conversations });
}

export async function listHistory(req, res) {
  const result = await listMessages(req.userId, req.params.id, req.query);
  res.json(result);
}

export async function sendMessage(req, res) {
  const message = await createMessage(req.userId, {
    conversationId: req.params.id,
    content: req.body?.content,
  });

  try {
    await broadcastMessage(req.app.get("io"), message);
  } catch (error) {
    console.error("Falló la emisión del mensaje REST", error);
  }

  res.status(201).json({ message });
}
