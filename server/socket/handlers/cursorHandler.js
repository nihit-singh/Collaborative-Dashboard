/**
 * Cursor handler — cursor-move and cursor-leave events.
 */
export default function cursorHandler(io, socket) {
  socket.on("cursor-move", ({ roomCode, uid, x, y, name }) => {
    socket.to(roomCode).emit("cursor-move", {
      id: uid,
      x,
      y,
      name,
    });
  });

  socket.on("cursor-leave", ({ roomCode, uid }) => {
    socket.to(roomCode).emit("cursor-remove", uid);
  });
}
