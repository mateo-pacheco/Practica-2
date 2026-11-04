import { createServer } from "node:http";
import { Server } from "socket.io";
import app from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";
import { configureChatSocket } from "./sockets/chat.socket.js";

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: env.CLIENT_ORIGIN },
  maxHttpBufferSize: 100_000,
});

app.set("io", io);
configureChatSocket(io);

await prisma.$connect();

httpServer.listen(env.PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${env.PORT}`);
});

async function shutdown() {
  await prisma.$disconnect();
  httpServer.close();
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
