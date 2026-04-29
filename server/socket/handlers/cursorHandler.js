/**
 * Cursor handler — cursor-move and cursor-leave events.
 */
export default function cursorHandler(io, socket) {
  socket.on("cursor-move", ({ roomCode, x, y, name }) => {
    socket.to(roomCode).emit("cursor-move", {
      id: socket.id,
      x,
      y,
      name,
    });
  });

  socket.on("cursor-leave", ({ roomCode }) => {
    socket.to(roomCode).emit("cursor-remove", socket.id);
  });
}
