
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Application from "../models/Application.js";

let io;

export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Authenticate every socket connection
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Authentication required."));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      socket.userId = decoded.userId;

      next();
    } catch (error) {
      next(new Error("Invalid or expired token."));
    }
  });

  io.on("connection", async (socket) => {
    console.log("Authenticated client connected:", socket.id);

    try {
      // Find applications belonging to this user
      const applications = await Application.find({
        userId: socket.userId,
        isActive: true
      }).select("_id");

      // Join only authorized application rooms
      for (const application of applications) {
        socket.join(`application:${application._id}`);
      }

      console.log("Application rooms joined:", applications.length);

    } catch (error) {
      console.error("Socket room assignment failed:", error.message);
      socket.disconnect(true);
      return;
    }

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized.");
  }

  return io;
};
