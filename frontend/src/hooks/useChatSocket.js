import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { BACKEND_URL } from "../services/api.js";

export function useChatSocket(token, onMessage) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [connectionError, setConnectionError] = useState("");
  const [connectionCount, setConnectionCount] = useState(0);

  useEffect(() => {
    const socket = io(BACKEND_URL, { auth: { token }, autoConnect: false });
    socketRef.current = socket;

    function handleConnect() {
      setConnected(true);
      setConnectionError("");
      setConnectionCount((count) => count + 1);
    }

    function handleDisconnect() {
      setConnected(false);
    }

    function handleError(error) {
      setConnectionError(error.message);
    }

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleError);
    socket.on("message:new", onMessage);
    socket.connect();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleError);
      socket.off("message:new", onMessage);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, onMessage]);

  function send(conversationId, content) {
    const socket = socketRef.current;
    if (!socket?.connected) return Promise.reject(new Error("El chat está desconectado."));

    return new Promise((resolve, reject) => {
      socket.timeout(5000).emit("message:send", { conversationId, content }, (error, result) => {
        if (error) {
          reject(new Error("No llegó la confirmación. Reabre el chat o recarga para consultar el historial antes de reenviar."));
        } else if (!result?.ok || !result.message) {
          reject(new Error(result?.error || "El servidor rechazó el mensaje."));
        } else {
          resolve(result.message);
        }
      });
    });
  }

  return { connected, connectionError, connectionCount, send };
}
