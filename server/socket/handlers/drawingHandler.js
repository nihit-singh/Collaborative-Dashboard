import { roomBoards } from "../state/roomState.js";

/**
 * Drawing handler — start-draw, draw, stop-draw, clear-board events.
 */
export default function drawingHandler(io, socket) {
  socket.on("start-draw", (data) => {
    if (!roomBoards[data.roomCode]) {
      roomBoards[data.roomCode] = [];
    }
    const payload = { ...data, socketId: socket.id };
    roomBoards[data.roomCode].push({ ...payload, type: "start" });
    socket.to(data.roomCode).emit("start-draw", payload);
  });

  socket.on("draw", (data) => {
    if (!roomBoards[data.roomCode]) {
      roomBoards[data.roomCode] = [];
    }
    const payload = { ...data, socketId: socket.id };
    roomBoards[data.roomCode].push({ ...payload, type: "draw" });
    socket.to(data.roomCode).emit("draw", payload);
  });

  socket.on("stop-draw", (data) => {
    socket.to(data.roomCode).emit("stop-draw", { socketId: socket.id });
  });

  socket.on("clear-board", ({ roomCode }) => {
    roomBoards[roomCode] = [];
    io.to(roomCode).emit("clear-board");
  });
}
