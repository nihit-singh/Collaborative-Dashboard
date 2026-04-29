import { roomUsers, roomBoards, userRoles } from "../state/roomState.js";

/**
 * Room handler — join-room and disconnect events.
 */
export default function roomHandler(io, socket) {
  socket.on("join-room", ({ roomCode, name, uid }) => {
    socket.join(roomCode);

    if (!roomUsers[roomCode]) roomUsers[roomCode] = [];
    if (!roomBoards[roomCode]) roomBoards[roomCode] = [];
    if (!userRoles[roomCode]) userRoles[roomCode] = {};

    // Unique username check
    const duplicate = roomUsers[roomCode].find(
      (u) => u.name === name && u.uid !== uid
    );

    if (duplicate) {
      socket.emit("name-taken");
      return;
    }

    // Remove stale entry on refresh
    roomUsers[roomCode] = roomUsers[roomCode].filter((u) => u.uid !== uid);

    // Determine role
    let role;
    if (userRoles[roomCode][uid]) {
      role = userRoles[roomCode][uid];
    } else if (roomUsers[roomCode].length === 0) {
      role = "creator";
    } else {
      role = "viewer";
    }

    userRoles[roomCode][uid] = role;

    const user = { uid, socketId: socket.id, name, role };
    roomUsers[roomCode].push(user);

    socket.emit("load-board", roomBoards[roomCode]);
    io.to(roomCode).emit("participants", roomUsers[roomCode]);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    for (const room in roomUsers) {
      roomUsers[room] = roomUsers[room].filter(
        (u) => u.socketId !== socket.id
      );

      io.to(room).emit("participants", roomUsers[room]);
      io.to(room).emit("user-left", socket.id);
    }
  });
}
