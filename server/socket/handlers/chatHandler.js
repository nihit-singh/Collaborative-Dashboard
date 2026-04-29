/**
 * Chat handler — send-message event for room chat.
 */

// In-memory chat history per room
const roomChats = {};

export default function chatHandler(io, socket) {
  socket.on("chat-message", ({ roomCode, name, text, timestamp }) => {
    if (!roomChats[roomCode]) roomChats[roomCode] = [];

    const message = { name, text, timestamp };
    roomChats[roomCode].push(message);

    // Broadcast to everyone in the room (including sender)
    io.to(roomCode).emit("chat-message", message);
  });

  // Send chat history when requested (called after join-room)
  socket.on("chat-history", ({ roomCode }) => {
    socket.emit("chat-history", roomChats[roomCode] || []);
  });
}
