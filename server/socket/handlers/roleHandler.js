import { roomUsers, userRoles } from "../state/roomState.js";

/**
 * Role handler — change-role event for permission management.
 */
export default function roleHandler(io, socket) {
  socket.on("change-role", ({ roomCode, userId, role }) => {
    const users = roomUsers[roomCode];
    if (!users) return;

    const user = users.find((u) => u.uid === userId);
    if (user) user.role = role;

    if (!userRoles[roomCode]) userRoles[roomCode] = {};
    userRoles[roomCode][userId] = role;

    io.to(roomCode).emit("participants", users);
  });
}
