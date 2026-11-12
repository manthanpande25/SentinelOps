
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

export const connectSocket = (token) => {
  const socket = io(SOCKET_URL, {
    auth: {
      token
    },
    transports: ["websocket"]
  });

  socket.on("connect", () => {
    console.log("SentinelOps socket connected:", socket.id);
  });

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error.message);
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
  });

  return socket;
};
