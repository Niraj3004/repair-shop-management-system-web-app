import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import Message from "./models/message.model";

let io: Server;

// Map to store connected users: userId -> socketId
const userSocketMap = new Map<string, string>();

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket: Socket) => {
    // Ensure the client passes `userId` in the connection handshake query
    const userId = socket.handshake.query.userId as string;
    
    if (userId && userId !== "undefined") {
      userSocketMap.set(userId, socket.id);
      // Broadcast updated online users list
      io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
    }

    console.log(`[Socket] User connected: ${userId} (Socket: ${socket.id})`);

    // Handle incoming chat messages
    socket.on("sendMessage", async (data) => {
      try {
        const { receiverId, content } = data;
        const senderId = userId; // the one who established the socket connection

        if (!senderId || !receiverId || !content) {
          return socket.emit("messageError", { error: "Missing required fields: sender, receiver, or content." });
        }

        // 1. Save message to MongoDB
        const newMessage = await Message.create({
          senderId,
          receiverId,
          content,
        });

        // Populate basic details to send to the client seamlessly
        const savedMessage = await newMessage.populate("senderId", "firstName lastName email role");

        // Emit to receiver
        const receiverSocketId = userSocketMap.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("newMessage", savedMessage);
        }

        // Also emit back to sender (optional, but good for confirmation)
        socket.emit("newMessage", savedMessage);

      } catch (error) {
        console.error("Socket sendMessage error:", error);
        socket.emit("messageError", { error: "Failed to send message and store in DB." });
      }
    });

    // Handle read receipts
    socket.on("markMessagesRead", (data) => {
      const { partnerId } = data;
      const partnerSocketId = userSocketMap.get(partnerId);
      if (partnerSocketId) {
        // Notify the partner that their messages to this user have been read
        io.to(partnerSocketId).emit("messagesRead", { readerId: userId });
      }
    });

    socket.on("disconnect", () => {
      console.log(`[Socket] User disconnected: ${userId} (Socket: ${socket.id})`);
      if (userId) {
        userSocketMap.delete(userId);
        io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
      }
    });
  });

  return io;
};

export const getIo = () => {
  if (!io) {
    throw new Error("Socket.io has not been initialized yet!");
  }
  return io;
};
