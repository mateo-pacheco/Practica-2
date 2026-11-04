import { createInterface } from "node:readline";
import { io } from "socket.io-client";

const [token, conversationId] = process.argv.slice(2);
if (!token || !conversationId) {
  console.log("Uso: bun run test:chat TOKEN ID_CONVERSACION");
  process.exit(1);
}

const socket = io("http://localhost:3100", { auth: { token } });
const terminal = createInterface({ input: process.stdin, output: process.stdout });

socket.on("connect", () => console.log("Conectado. Escribe un mensaje"));
socket.on("connect_error", (error) => console.log(error.message));
socket.on("disconnect", (reason) => console.log("Desconectado", reason));
socket.on("message:new", (message) => {
  if (message.conversationId === conversationId) {
    console.log(`${message.sender.name}: ${message.content}`);
  }
});

terminal.on("line", (content) => {
  if (!content.trim()) return;
  if (!socket.connected) return console.log("Sin conexión");
  socket.timeout(5000).emit(
    "message:send",
    { conversationId, content },
    (error, result) => {
      if (error) return console.log("Sin confirmación. Revisa el historial antes de reenviar");
      if (!result.ok) console.log(result.error);
    },
  );
});

terminal.on("close", () => socket.disconnect());
